---
name: table-memory
description: Source-linked family cookbook from handwritten recipe cards, scans, screenshots and voice notes stored on UGREEN AI NAS. Use when preparing a family cookbook or shopping list, recovering an incomplete recipe, or preserving a family version and its approved corrections.
---

# Goal

Turn a small authorized recipe selection into a cookbook a family can cook from, while preserving every original card, image, document and voice note. Each recipe keeps a source link and a review status. If several family versions of the same dish exist, keep them separate rather than flattening them into one. Missing quantities, temperatures, times, units or provenance are reported as missing, never filled in from another recipe or general knowledge.

A correction is durable: when a family supplies a missing detail and approves it, bind that correction to the exact source fingerprint and recipe field. On a later run, reuse it only when the source and field still match. Never apply one version's correction to another version.

The user-visible result is a Markdown cookbook with a provenance index, an optional shopping list, a separate review list, and a correction record the next session can reopen. Original files are never edited, moved, renamed or deleted.

# Required input

- The exact authorized folder path on the NAS. The user may also name exact subfolders or files.
- An exact output folder or output file for the cookbook and optional shopping list.
- An exact output path for the correction record.
- An optional exact path to an existing correction record from an earlier run. If none exists, this is the first session.
- Whether the user wants a shopping list, and the number of servings if the recipes should be scaled. Scaling needs the source's stated original yield; if a recipe has no stated yield, do not scale it.
- Separate permission to read any audio files named in the selection. If permission is not given, skip audio and say so.
- The user's decision on every item marked `needs_review` before it can be treated as complete.

Start with one selected dish and no more than 12 regular files. Ask before adding another folder or exceeding that limit; never walk the whole NAS. Do not request passwords, API keys or access outside the authorized paths. Do not widen the scope without asking.

# Generation-time capability evidence

- `ug-filesystem` → `file-agent`
- `ug-document` → `document-agent`
- `ug-photo` → `photo-agent`
- `ug-knowledge` → `knowledge-agent`

# Workflow

1. If the user supplied a correction record, read it before any extraction. Delegate exactly this to `file-agent`:

`delegate --target file-agent --instruction 'Read only the exact correction-record path the user supplied in this session. Return its content, byte count and SHA-256. Do not write, move, rename or delete anything. If the path is missing, unreadable or not valid JSON, stop and report the real error.'`

Parse the record. If it is unreadable, stop; do not silently start a clean first run. Keep its source fingerprints and approved corrections available for step 5.

2. Inventory the selected folder. Delegate exactly this to `file-agent`, using the exact path the user supplied:

`delegate --target file-agent --instruction 'Use exactly the folder path the user supplied in this session; do not substitute a parent, sibling or NAS root. List at most 12 regular files in total across the selected folder and any exact subfolders the user named; do not recurse beyond those paths. For each file return the real path, display name, file type, size, modification time and SHA-256 fingerprint. Read file bytes only as needed to compute SHA-256; do not interpret contents. Do not move, rename, delete, tag or write anything. Return an empty list when no regular files exist and report unreadable entries separately.'`

Use only the real file list returned by this step. If it is empty, stop and report that no recipe files were found. Do not add files merely because they exist nearby.

3. Read the selected PDF documents. Delegate only the exact PDF paths from the real file list to `document-agent`:

`delegate --target document-agent --instruction 'Read only the exact PDF paths returned in the real file list in this session. For each PDF extract the recipe title, ingredients with their original quantities and units, steps in order, yield, preparation time, cooking time, oven temperature, source note and page number when the document states them. Preserve the original wording for quantities and units. Mark every absent field as not found and never infer it. Return per-file results and per-page coverage.'`

4. Read the selected image recipes. Delegate only the exact image paths from the real file list to `photo-agent`:

`delegate --target photo-agent --instruction 'Use only the exact image paths returned in the real file list in this session. For each image run OCR and a layout description to recover the recipe title, ingredients, quantities, units, steps, yield, times, oven temperature and any handwritten note. Return the exact source path and the original OCR text for every extracted value. Report illegible regions, cropped text and uncertain characters as needs_review instead of guessing. Do not edit or move the image.'`

5. Attach optional voice notes. Only when the user approved the exact audio files, delegate those exact paths to `knowledge-agent`:

`delegate --target knowledge-agent --instruction 'Transcribe only the exact audio paths the user approved in this session. Return the transcript, speaker segments when the real result supplies them, source path, duration and a stable timestamp reference for each segment. Do not summarise, imitate, synthesize or alter the voice, and do not claim a speaker identity the result does not provide.'`

6. Reconcile the real results and the prior record. Match by exact source path and fingerprint first, then by clear content. Do not use title alone to decide that two files are the same recipe or a family variant.

- Byte-identical files: one recipe, both source paths recorded.
- Same recipe with a different scan or transcription: one branch, with source variants shown; ask the user if the relationship is not clear from the content.
- Different ingredients, steps or an explicit family attribution: a separate branch only when the source or the user confirms it.
- Same title but different dish: separate recipes.
- Ambiguous relationship: mark `needs_review`; do not create or merge a branch.

Never average, merge or overwrite family versions. Normalise a quantity or unit only when the conversion is exact and unambiguous; keep the original text beside the converted value. Do not combine incompatible units.

7. Apply the correction record. Treat it as a list that may contain zero, one or many corrections. For each correction independently, reuse it only when its source fingerprint matches the current source, its recipe, branch and precise `locator` point to the same ingredient or step, its field is still unresolved, and its approved text is present. If the source has changed, or any match is uncertain, mark that item `needs_review` and ask; do not apply the old answer. Never rely on recipe title and field alone. Show each proposed reuse in the review table and let the user confirm or decline it once. Append new corrections; never overwrite an unrelated approved correction.

8. Present a review table before writing. For each recipe show title, source path and page or image, ingredients, steps, missing fields, ambiguous fields, any proposed reused correction, and a status of `complete`, `needs_review` or `unreadable`. Add a branch table for every dish with more than one version: source, what differs, and which version the user wants to cook. Ask one focused question at a time for each unresolved detail, and accept `I do not know` or `skip` as an answer; record it as unknown, not as a fact. Ask the user to resolve only `needs_review` items. Do not silently choose a likely value.

9. If a shopping list was requested, build it now from the approved recipes. Aggregate only identical ingredients with compatible units. Keep separate lines when units cannot be combined exactly. Show the source recipes for every line. If servings are requested, scale only values with a stated numeric quantity and a stated original yield; show the original and scaled amounts side by side. If the yield is missing, leave the recipe unscaled and mark it `needs_review`; do not infer a yield from another recipe.

10. After the user approves the reviewed cookbook, the shopping list when requested, and the correction record, save them with `knowledge-agent`:

`delegate --target knowledge-agent --instruction 'Save only the user-approved cookbook Markdown, the user-approved shopping list and the user-approved correction record to the exact output paths the user confirmed. The correction record must use the schema in the correction-record reference, contain a list that may be empty or hold several corrections, and include only approved corrections. Return the real verified save status, output file path and content byte count for each file. Do not overwrite an existing file; if a target exists, stop and report it so the user can choose another name. Do not save any file the user did not approve.'`

11. Read back every successful save before calling it complete. Delegate read-only verification to `file-agent`:

`delegate --target file-agent --instruction 'Read back the exact saved cookbook path, the exact saved shopping-list path when one was saved, and the exact saved correction-record path. Return the byte count, SHA-256 and full content of each file. Do not write, move or rename anything. If a file is missing or unreadable, report the real error.'`

Compare the read-back content with the exact approved text. A matching path or byte count alone is not enough. If any content differs, report the save as failed for that file and do not claim completion. If read-back is unavailable or inconclusive, report the save as unverified rather than complete.

# Completion and failure

Handle all five delegation states explicitly:

- `completed`: every required step returned a real result; the cookbook, optional shopping list and correction record were saved and read back with matching content; the provenance index lists every source; and the correction record contains only approved items.
- `failed`: report the failing step, the real error and which recipes were not produced. Do not claim a partial cookbook is complete.
- `cancelled`: stop the current action and keep the original files untouched. If an earlier save already completed, report that saved artifact and its real path. Report nothing was saved only when no save was attempted or read-only verification confirms no artifact exists. Follow the uncertain-save rule below when the outcome is unknown. Never claim nothing was saved after a completed save.
- `waiting_user`: stop at the review table and request the missing decision. Do not guess a value to continue.
- `waiting_approval`: show the exact proposed output paths and wait. Do not write before approval.

For any attempted save with an uncertain outcome, including a failure or cancellation, delegate read-only verification of the exact approved output paths to `file-agent` before reporting the outcome or retrying. If verification is unavailable or inconclusive, report the save outcome as unknown and do not retry. Do not overwrite an existing artifact.

An empty folder, an unreadable image, a PDF with no recipe text, or a transcript without usable segments is a partial result, not a reason to invent content. If a required upstream result is unavailable, stop the dependent step and report the gap.

A cookbook with family branches is complete only when every branch has a source, the differences are visible, and the user has chosen the edition to cook. A correction is complete only when its source, field, approved text and attribution are recorded and read back. The cookbook must state that it is a personal recipe archive, not nutritional, medical or food-safety advice. It must not claim that a recipe was tested or that a missing value is correct.

# References

Read these only when the named part of the workflow needs them:

- [Capability map](references/capability-map.md) - exact CLIs, actions and boundaries.
- [Correction record](references/correction-record.md) - schema and reuse rules for approved corrections.
- [Review rules](references/review-rules.md) - evidence labels, ambiguity, version matching, scaling and privacy rules.
- [Finalist test plan](references/test-plan.md) - synthetic core cases, repeat session and edge cases.
- [Disclosures](references/disclosures.md) - AI assistance, third-party components and data handling.
