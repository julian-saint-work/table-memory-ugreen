# Correction record

The correction record is the durable part of Table Memory. It stores a family's approved clarifications separately from the original source, so a later session can reuse each correction without asking the same question again.

A record may contain **zero, one or many** corrections. Do not replace the whole list when adding one: append a new correction with a stable id, and never overwrite an unrelated approved correction.

## Schema

Save one JSON object. An empty `corrections` array means no corrections have been approved yet.

```json
{
  "schema": "table-memory/corrections/v2",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp",
  "corrections": [
    {
      "id": "stable id for this correction",
      "source": {
        "path": "exact NAS path",
        "sha256": "64-character fingerprint",
        "page_or_region": "page number, image region or omitted when not applicable"
      },
      "recipe": {
        "title": "title as shown in the cookbook",
        "branch": "stable branch label"
      },
      "locator": {
        "kind": "ingredient",
        "index": 1,
        "label": "red pepper",
        "original_text": "red pepper: line is present but blurred; no quantity readable"
      },
      "field": "quantity",
      "correction": {
        "approved_text": "the exact wording the user approved",
        "attribution": "who supplied it, in the words the user approved",
        "status": "approved",
        "approved_at": "ISO-8601 timestamp"
      },
      "scope": {
        "applies_to": "this source, branch, locator and field only",
        "notes": "optional, non-sensitive context"
      }
    }
  ]
}
```

`locator.kind` is one of `ingredient`, `step` or `field`. Use `ingredient` with a 1-based `index` and the ingredient label for a quantity or unit. Use `step` with a 1-based step number. Use `field` only for a recipe-level field such as yield. The locator is what distinguishes two missing quantities in the same recipe; a recipe title and field name alone are not enough.

The record must not contain unrelated personal data, addresses, phone numbers, passwords or private material that is not needed to understand the correction.

## Reuse rules

A later run may reuse a correction only when all of these are true:

1. The current source's SHA-256 matches that correction's `source.sha256`.
2. The current recipe, branch and locator match the stored recipe, branch and locator.
3. The same field is still unresolved or still carries the same original text.
4. The correction's status is `approved`.
5. The user confirms reuse once in the review table.

Iterate over every correction independently. One matching correction may be reused while another is rejected or marked `needs_review`.

Never reuse a correction when:

- the source fingerprint changed;
- the field now has different source text;
- the locator no longer points to the same ingredient or step;
- the recipe was split, merged or relabelled;
- the correction belongs to another branch or another dish;
- the user declines reuse.

When any condition is uncertain, mark the item `needs_review` and ask. Do not silently apply, migrate or average the old answer. If the source changed but the correction still seems relevant, show the old and new evidence and ask for a fresh approval; keep the previous record until the user decides.

A correction is not a `stated` source value. In the cookbook it is labelled `approved_correction`, with its attribution visible. The original text remains unchanged.

## Save and read-back

Save the record beside the cookbook at the exact path the user approved. After saving, read the whole record back and compare it with the approved content. A successful write without a matching read-back is unverified, not complete.
