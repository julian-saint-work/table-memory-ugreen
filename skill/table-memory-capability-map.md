# Capability map

Use only the capabilities in this map. The public catalog is the source of truth; do not invent a CLI, action or parameter.

| CLI | Agent | Actions used | Purpose |
| --- | --- | --- | --- |
| `ug-filesystem` | `file-agent` | `ls`, `stat`, `sha256sum`, `find`, `cat` | Inventory and fingerprint originals; read back saved files for verification |
| `ug-document` | `document-agent` | `extract`, `metadata`, `page-count` | Read PDF recipes and report page-level coverage |
| `ug-photo` | `photo-agent` | `vision-ocr`, `vision-vlm`, `meta` | Read handwritten and photographed recipes |
| `ug-knowledge` | `knowledge-agent` | `audio-transcription`, `save-text` | Attach approved voice notes and save the approved cookbook, shopping list and correction record |

## Boundaries

- All scans are read-only. Only the final cookbook, optional shopping list and correction record are writes.
- The final save is a `save-text` workflow approval, not a silent write.
- After a save, use `ug-filesystem cat` to read the exact saved files back. A path, status or byte count alone does not prove that the saved content matches the approved text.
- Do not use `ug-photo.create-album`: a cookbook does not require copying photos into an album, and an extra write adds no value.
- Do not use a general-purpose script or shell command; the parent delegates every NAS action to a registered expert.
- Do not claim that a static check, local test or synthetic fixture proves NAS execution.

## Why this combination

The NAS already holds the recipe box, the phone screenshots and the voice notes. OCR and document extraction recover the text; the knowledge expert turns the approved review into a portable cookbook and a durable correction record. The original files stay untouched, so the family keeps the evidence even if the generated book is wrong.
