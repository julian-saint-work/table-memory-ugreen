# Review rules

## Evidence labels

Every field in the cookbook carries one of these labels:

- `stated` — the source states it directly. Quote the source text and page or image.
- `derived` — an exact conversion or arithmetic result. Show the original value and the conversion.
- `approved_correction` — a family member supplied and approved the value in an earlier session. Show the attribution and the original source text; never present it as `stated`.
- `needs_review` — the source is unclear, cropped, contradictory or incomplete.
- `not_found` — the source was checked and does not contain the field.

Never upgrade `needs_review` or `not_found` to `stated` because the value is likely. Never use another recipe, a web search or general cooking knowledge to fill a gap.

## Ambiguity rules

- Handwriting: keep uncertain words exactly as read, then mark the field `needs_review`.
- Units: do not convert cups to grams, ounces to millilitres or “a cup” to a number unless the source states the conversion.
- Fractions: preserve the written fraction; a decimal is a derived value.
- Temperature: preserve the stated unit and oven type. Do not add fan or conventional assumptions.
- Time: distinguish preparation, resting, cooking and total time; never add them unless the source says total.
- Servings: scale only when the source states an original yield and the ingredient has a numeric quantity. If the yield is missing, do not scale; mark the recipe `needs_review`. Do not scale “to taste”, “a pinch” or a whole egg without asking.
- Duplicates: classify before branching. Byte-identical files are one recipe with both paths. A different scan or transcription of the same text is one branch with source variants, confirmed when unclear. Genuinely different ingredients, steps or family attribution may be separate branches, but require source evidence or user confirmation. A shared title alone is not a variant. Do not delete, overwrite or average either version.

## Human follow-up

When a source leaves a detail missing, ask one short question about that detail only. Explain what the source does show and what is missing. Accept `I do not know`, `skip` or a request to stop; record those as unknown or declined, not as facts. A human answer becomes an attributed cook's note, never a verified source. Do not turn the review into a general interview or ask about unrelated family history.

## Variant branches

A dish may have several legitimate family versions. Treat each as a branch with its own source, not as an error to resolve.

- Show a branch table with source, title, differences in ingredients or steps, and any voice note.
- Do not create a synthetic "best" version by combining branches.
- Let the user choose the edition to cook; keep the others available in the cookbook.
- If two files are byte-identical, record one branch and both source paths.
- If the difference is only a spelling, OCR or handwriting variant, say so; do not treat it as a different recipe.
- If the relationship is ambiguous, keep the items separate and ask. Do not turn every shared title into a branch.

## Safety and privacy

- Original recipe cards, images, PDFs and audio stay in place.
- Process at most 12 regular files from one selected dish or folder by default. Ask before expanding the scope; never walk the whole NAS.
- The cookbook may quote family notes, but it must not expose unrelated personal data found in the same image, such as addresses or phone numbers. Redact and flag those regions.
- No voice cloning, synthetic narration or impersonation. The optional transcript is a search aid; the original recording remains the authority.
- The cookbook is a personal archive, not nutritional, medical or food-safety advice. Flag raw or unsafe instructions as `needs_review`; do not certify them.

## Completion test

A recipe is `complete` only when its title, ingredients and steps are present, every missing field is labelled, its source is linked and the user has approved any `needs_review` item. A dish with branches also needs a visible branch table and a chosen edition. Otherwise it stays in the review table.
