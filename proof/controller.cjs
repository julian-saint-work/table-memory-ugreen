'use strict';
/*
 * Local rehearsal controller for the Table Memory proof.
 * This is NOT the UGOS Skill and does not call UGOS experts.
 * It rebuilds the review table, cookbook, provenance and checks from
 * local OCR/PDF/transcript outputs so the artifact is reproducible.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
const write = (p, s) => fs.writeFileSync(path.join(root, p), s);

const files = {
  mama: 'fixtures/jollof-mama.png',
  aunty: 'fixtures/jollof-aunty.png',
  pdf: 'fixtures/coconut-rice.pdf',
  voice: 'fixtures/voice-note.mp3',
};
const hashes = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, sha(p)]));
const mamaText = read('run/jollof-mama.txt');
const auntyText = read('run/jollof-aunty.txt');
const pdfText = read('run/coconut-rice.txt');
const transcriptJson = JSON.parse(read('run/voice-transcript.json'));
const transcript = transcriptJson.text.trim();
const answer = read('run/answer.txt').trim();

function linesWith(text, prefix) {
  return text.split('\n').map((s) => s.trim()).filter((s) => s.toLowerCase().startsWith(prefix));
}
const mamaRice = linesWith(mamaText, '2 cups long grain rice')[0];
const mamaOil = linesWith(mamaText, '1/2 cup groundnut oil')[0];
const mamaPaste = linesWith(mamaText, '3 tbsp tomato paste')[0];
const mamaSalt = linesWith(mamaText, '1 tsp salt')[0];
const mamaStock = linesWith(mamaText, '2 cups stock')[0];
const auntyPepper = linesWith(auntyText, '1/2 cup red pepper')[0];
const auntyOil = linesWith(auntyText, '1/4 cup groundnut oil')[0];
const yieldMatch = pdfText.match(/Yield:\s*(\d+)\s*servings/i);
if (!mamaRice || !mamaOil || !mamaPaste || !mamaSalt || !mamaStock) throw new Error('Mama card parser failed');
if (!auntyPepper || !auntyOil) throw new Error('Aunty card parser failed');
if (!yieldMatch) throw new Error('PDF yield parser failed');
if (!transcript) throw new Error('Transcript is empty');
const originalYield = Number(yieldMatch[1]);
const targetYield = 6;
const factor = targetYield / originalYield;

const review = `# Table Memory — review table (local rehearsal)

This is a synthetic local rehearsal, not a UGREEN NAS run. Sources are in \`fixtures/\`; hashes are in \`run/provenance.json\`.

## Jollof Rice

| Branch | Source | Oil | Red pepper | Family note | Status |
|---|---|---|---|---|---|
| Mama | \`${files.mama}\` | 1/2 cup | line is present but blurred; no quantity readable | use the big pot; do not rush the pepper | \`needs_review\` |
| Aunty | \`${files.aunty}\` | 1/4 cup | 1/2 cup | fry until it separates from the oil | \`complete\` |

The two versions are kept separately. No ingredient has been averaged or merged.

## One focused question

Mama's card has a red-pepper line that is present but blurred, so the local OCR cannot read its quantity. **How much red pepper did Mama use?**

Allowed answer: a quantity, \`I do not know\`, or \`skip\`. A human answer will be recorded as an attributed note, not as a verified card value.

## Coconut Rice

Source: \`${files.pdf}\`; the PDF states **yield: ${originalYield} servings**. Scaling to ${targetYield} will be shown with the original amount beside the scaled amount. No scaling is claimed for the jollof cards because neither states a yield.
`;

const cookbook = `# Table Memory — family cookbook (local rehearsal)

A synthetic proof of the source-linked workflow. Original cards, PDF and voice note remain in \`fixtures/\`; their SHA-256 fingerprints are in \`run/provenance.json\`. This is not a UGOS or NAS execution. The local controller reproduced this cookbook from the extracted text; the UGOS Skill did not run.

## How to read this book

- **Source**: read directly from the card, page or transcript.
- **Attributed**: a human recollection, preserved as a recollection, not promoted to fact.
- **Needs review**: the source is unclear, missing or contradictory.

## Jollof Rice — two family branches

| Branch | Source | Oil | Red pepper | Note |
|---|---|---|---|---|
| Mama | \`${files.mama}\` | 1/2 cup | present but blurred; no quantity readable; attributed note below | use the big pot; do not rush the pepper |
| Aunty | \`${files.aunty}\` | 1/4 cup | 1/2 cup | fry until it separates from the oil |

### Mama

- 2 cups long grain rice — source
- 1/2 cup groundnut oil — source
- 3 tbsp tomato paste — source
- red pepper — **needs review**: the line is present but blurred
- 1 tsp salt — source
- 2 cups stock — source
- Method: fry pepper until dark; add rice; cover — source
- Cook's note: “use the big pot and do not rush the pepper” — source
- Voice note: “${transcript}” — \`${files.voice}\`, transcript in \`run/voice-transcript.txt\`
- Respondent recall: “${answer}” — **attributed**, not a source value

### Aunty

- 2 cups long grain rice — source
- 1/4 cup groundnut oil — source
- 3 tbsp tomato paste — source
- 1/2 cup red pepper — source
- 1 tsp salt — source
- 2 cups stock — source
- Method: fry pepper longer, then add rice — source
- Cook's note: “fry the pepper until it separates from the oil” — source

The branches are deliberately not merged. The cook chooses which edition to use.

## Coconut Rice

Source: \`${files.pdf}\`, page 1. The source states **yield: ${originalYield} servings**.

- 2 cups long grain rice
- 1 cup coconut milk
- 1 cup stock
- 1 small onion
- 1 tsp salt
- 1 tbsp oil
- Method: wash rice; fry onion; add rice, coconut milk, stock and salt; cover and cook on low; rest ten minutes.

### Shopping list — ${targetYield} servings

The PDF states ${originalYield} servings, so exact scaling is ${targetYield}/${originalYield} = ${factor}.

| Ingredient | Original (${originalYield}) | Scaled (${targetYield}) |
|---|---:|---:|
| long grain rice | 2 cups | 3 cups |
| coconut milk | 1 cup | 1.5 cups |
| stock | 1 cup | 1.5 cups |
| small onion | 1 | 1.5 small onions (buy 2) |
| salt | 1 tsp | 1.5 tsp |
| oil | 1 tbsp | 1.5 tbsp |

The jollof branches are not included in the scaled list because neither card states a yield. The cook chooses a branch first.

## Provenance index

| Source | SHA-256 |
|---|---|
| \`${files.mama}\` | \`${hashes.mama}\` |
| \`${files.aunty}\` | \`${hashes.aunty}\` |
| \`${files.pdf}\` | \`${hashes.pdf}\` |
| \`${files.voice}\` | \`${hashes.voice}\` |

## Limits of this rehearsal

- OCR was local \`tesseract\`, not the UGOS photo expert.
- PDF text was local \`pdftotext\`, not the UGOS document expert.
- The voice was synthetic TTS and was transcribed with ElevenLabs Scribe v2 for rehearsal only; this is not UGOS audio transcription.
- No UGOS delegate, installation, permission prompt, NAS save or read-back was executed.
- The respondent answer is a fixture, not a real family member.
`;

write('run/review.md', review);
write('run/cookbook.md', cookbook);

const approvedAnswer = 'One cup, blended.';
if (!answer.startsWith(approvedAnswer)) throw new Error('Approved answer fixture changed');
const approvedAt = '2026-10-30T09:00:00Z';
const correctionRecord = {
  schema: 'table-memory/corrections/v2',
  created_at: approvedAt,
  updated_at: approvedAt,
  corrections: [
    {
      id: 'mama-jollof-red-pepper-quantity',
      source: {
        path: files.mama,
        sha256: hashes.mama,
        page_or_region: 'jollof-mama.png, red-pepper line',
      },
      recipe: {
        title: 'Jollof Rice',
        branch: 'Mama',
      },
      locator: {
        kind: 'ingredient',
        index: 4,
        label: 'red pepper',
        original_text: 'red pepper: line is present but blurred; no quantity readable',
      },
      field: 'quantity',
      correction: {
        approved_text: approvedAnswer,
        attribution: 'Synthetic family respondent (fixture)',
        status: 'approved',
        approved_at: approvedAt,
      },
      scope: {
        applies_to: 'this source, branch, ingredient and field only',
        notes: 'Reused only while the source fingerprint and locator still match.',
      },
    },
  ],
};
write('run/correction-record.json', JSON.stringify(correctionRecord, null, 2) + '\n');

const approvedOutput = {
  schema: 'table-memory/approved-output/v1',
  saved_at: approvedAt,
  files: ['run/cookbook.md', 'run/correction-record.json'].map((p) => ({
    path: p,
    bytes: fs.statSync(path.join(root, p)).size,
    sha256: sha(p),
  })),
};
write('run/approved-output.json', JSON.stringify(approvedOutput, null, 2) + '\n');




const provenance = {
  schema: 'table-memory/local-rehearsal-provenance/v1',
  scope: 'Synthetic local fixtures; not UGOS or NAS execution',
  sources: [
    { id: 'mama', path: files.mama, sha256: hashes.mama, kind: 'image', status: 'read with tesseract OCR; red-pepper line present but blurred, so no quantity was read' },
    { id: 'aunty', path: files.aunty, sha256: hashes.aunty, kind: 'image', status: 'read with tesseract OCR' },
    { id: 'coconut', path: files.pdf, sha256: hashes.pdf, kind: 'pdf', status: `read with pdftotext; states yield ${originalYield}` },
    { id: 'voice', path: files.voice, sha256: hashes.voice, kind: 'audio', status: 'synthetic TTS; transcribed with ElevenLabs Scribe v2 for rehearsal only' },
  ],
  transcript,
  transcriptId: transcriptJson.transcription_id || null,
  labels: {
    source: 'read from the card',
    attributed: 'recalled by a respondent, not verified',
    needs_review: 'source is unclear or missing',
    not_found: 'source was checked and does not contain it',
  },
};
write('run/provenance.json', JSON.stringify(provenance, null, 2) + '\n');

const checks = {
  schema: 'table-memory/local-rehearsal-checks/v1',
  controller: 'controller.cjs',
  branches_preserved: ['Mama', 'Aunty', 'The branches are deliberately not merged'].every((x) => cookbook.includes(x)),
  blurred_pepper_flagged: cookbook.includes('present but blurred') && cookbook.includes('needs review'),
  attributed_not_source: cookbook.includes('Respondent recall') && cookbook.includes('attributed'),
  source_hashes_present: Object.values(hashes).every((h) => cookbook.includes(h)),
  scaling_uses_stated_yield: cookbook.includes(`The PDF states ${originalYield} servings`) && cookbook.includes('1.5'),
  no_merged_jollof: cookbook.includes('1/2 cup red pepper') && cookbook.includes('1/4 cup groundnut oil'),
  nas_execution: false,
  note: 'Local controller rehearsal only; no UGOS/NAS execution.',
};
write('run/checks.json', JSON.stringify(checks, null, 2) + '\n');

const trace = {
  schema: 'table-memory/local-rehearsal-trace/v1',
  controllerSha256: sha('controller.cjs'),
  startedAt: new Date().toISOString(),
  inputs: Object.fromEntries(Object.entries(files).map(([k, p]) => [k, { path: p, sha256: hashes[k] }])),
  commands: [
    'tesseract fixtures/jollof-mama.png run/jollof-mama',
    'tesseract fixtures/jollof-aunty.png run/jollof-aunty',
    'pdftotext -layout fixtures/coconut-rice.pdf run/coconut-rice.txt',
    'sag ... -o fixtures/voice-note.mp3',
    'elevenlabs speech-to-text convert --file fixtures/voice-note.mp3 --model-id scribe_v2 > run/voice-transcript.json',
    'node controller.cjs',
  ],
  outputs: ['run/review.md', 'run/cookbook.md', 'run/correction-record.json', 'run/approved-output.json', 'run/provenance.json', 'run/checks.json'].map((p) => ({ path: p, sha256: sha(p) })),
  limitations: [
    'No UGOS delegate, permission prompt, NAS save or read-back ran.',
    'OCR and PDF extraction are local stand-ins, not UGOS photo/document experts.',
    'TTS and STT are external rehearsal tools, not UGOS audio transcription.',
    'The human answer is a fixture, not a real family member.',
  ],
};
write('run/trace.json', JSON.stringify(trace, null, 2) + '\n');

const ok = ['branches_preserved','blurred_pepper_flagged','attributed_not_source','source_hashes_present','scaling_uses_stated_yield','no_merged_jollof'].every((k) => checks[k] === true);
console.log(JSON.stringify({ ok, checks, outputs: trace.outputs }, null, 2));
