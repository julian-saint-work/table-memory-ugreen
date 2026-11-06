# Finalist test plan

All fixtures are synthetic. No real family data, credentials or personal information is used.

## Core case 1: the readable recipe box

Folder: `Recipes/family-box`.

Contents:

- three photographed handwritten cards, including two versions of the same jollof: one with a different pepper quantity and a margin note;
- one PDF recipe with a stated yield and oven temperature;
- one image with a blurred quantity.

Expected:

- every recipe cites its source path and page or image;
- the blurred quantity is `needs_review`, not guessed;
- both jollof versions are kept as branches only after the content or user confirms the relationship, with a visible difference table, not averaged;
- the user chooses which jollof version to cook;
- the cookbook, correction record and provenance index save to the confirmed output;
- the shopping list aggregates only compatible units;
- each saved file is read back and compared with the approved content.

## Core case 2: voice note and scaling

Folder: `Recipes/family-box`.

Contents: the same recipe box plus one approved voice note describing how a grandmother made the dish. The PDF states that its recipe serves four.

Expected:

- the transcript is attached with a real timestamp reference;
- no synthetic voice is produced;
- scaling from the stated four servings to six changes only numeric quantities;
- “to taste” and whole eggs remain unchanged and are flagged for the cook.

## Core case 3: the repeated session

Start with the approved correction record from Core case 1. The source files are unchanged.

Expected:

- the session reads the record before extraction;
- the source fingerprint and field match;
- the approved correction appears as `approved_correction`, with its attribution and original text;
- the user confirms reuse once and is not asked the same question again;
- the correction is saved and read back in the new cookbook;
- a similar field in the other jollof branch does not receive the correction.

## Core case 4: the changed source

Replace one corrected card with a new scan whose content changed but whose dish and field still look similar.

Expected:

- the old correction is not applied automatically;
- the changed fingerprint is reported;
- the item becomes `needs_review`;
- the old and new evidence are shown side by side;
- the user can approve a fresh correction or keep the old record unchanged.

## Edge case: the misleading scan

Folder: `Recipes/family-box`.

Contents: a screenshot with a recipe in the centre and a bank notification at the edge; one card rotated 90 degrees; one image with no recipe at all.

Expected:

- the bank details are redacted and flagged, not copied into the cookbook;
- the rotated card is read only if the OCR result is usable; otherwise it is `needs_review`;
- the non-recipe image is reported as unreadable and does not become an empty recipe;
- the run completes partially and states what was not produced.

## Measurements

Record wall-clock time, number of files read, number of model calls, number of `needs_review` items, whether each saved file read-back matches the approved content, and whether a reused correction was correctly applied or correctly rejected. A static pass is not a NAS pass.
