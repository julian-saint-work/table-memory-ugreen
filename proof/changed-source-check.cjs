'use strict';
/*
 * Local negative test: change the source after approval and confirm the
 * saved correction is rejected in a new process. This is not a UGOS or NAS test.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');

const record = JSON.parse(read('run/correction-record.json'));
const correction = record.corrections[0];
const original = fs.readFileSync(path.join(root, 'fixtures/jollof-mama.png'));
fs.writeFileSync(path.join(root, 'run/changed-source.png'), Buffer.concat([original, Buffer.from('\nchanged synthetic source\n')]));
const changedHash = sha('run/changed-source.png');
const storedHash = correction.source.sha256;
const output = execFileSync(process.execPath, ['session2.cjs'], {
  cwd: root,
  env: { ...process.env, TM_SOURCE_OVERRIDE: 'run/changed-source.png', TM_EXPECT_REJECT: '1' },
  encoding: 'utf8',
});
fs.writeFileSync(path.join(root, 'run/changed-source-output.json'), output);
const result = JSON.parse(read('run/session-2-changed-checks.json'));
const summary = {
  schema: 'table-memory/changed-source-check/v1',
  executed_by: 'changed-source-check.cjs',
  original_source: correction.source.path,
  changed_source: 'run/changed-source.png',
  stored_sha256: storedHash,
  changed_sha256: changedHash,
  fingerprint_changed: storedHash !== changedHash,
  reused: result.reused,
  expected_reject: result.expected_reject,
  correction_not_leaked_to_aunty: result.checks.correction_not_leaked_to_aunty,
  nas_execution: false,
  note: 'Local changed-source test only; no UGOS or NAS execution.',
};
fs.writeFileSync(path.join(root, 'run/changed-source-check.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (!summary.fingerprint_changed || summary.reused || !summary.expected_reject || !summary.correction_not_leaked_to_aunty) process.exit(1);
