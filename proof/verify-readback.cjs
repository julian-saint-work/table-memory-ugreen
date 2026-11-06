'use strict';
/*
 * Local read-back verifier for the Table Memory proof.
 * It compares the files on disk with the first-session approved-output manifest.
 * This is a local filesystem check, not a UGOS or NAS read-back.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p));
const sha = (p) => crypto.createHash('sha256').update(read(p)).digest('hex');
const approved = JSON.parse(read('run/approved-output.json').toString());
const expectedPaths = ['run/cookbook.md', 'run/correction-record.json'];
const manifestValid = approved.schema === 'table-memory/approved-output/v1' &&
  Array.isArray(approved.files) &&
  approved.files.length === expectedPaths.length &&
  expectedPaths.every((p) => approved.files.some((entry) => entry.path === p && Number.isInteger(entry.bytes) && /^[a-f0-9]{64}$/.test(entry.sha256)));
if (!manifestValid) {
  const failure = {
    schema: 'table-memory/readback/v1',
    manifest_valid: false,
    expected_paths: expectedPaths,
    matches: false,
    nas_execution: false,
    note: 'Local filesystem read-back only; no UGOS or NAS save/read-back executed.',
  };
  fs.writeFileSync(path.join(root, 'run/readback.json'), JSON.stringify(failure, null, 2) + '\n');
  console.error(JSON.stringify(failure, null, 2));
  process.exit(1);
}
const results = approved.files.map((entry) => {
  const bytes = fs.statSync(path.join(root, entry.path)).size;
  const hash = sha(entry.path);
  return {
    path: entry.path,
    approved_bytes: entry.bytes,
    readback_bytes: bytes,
    approved_sha256: entry.sha256,
    readback_sha256: hash,
    match: bytes === entry.bytes && hash === entry.sha256,
  };
});
const matches = manifestValid && results.every((r) => r.match);
const session2 = fs.existsSync(path.join(root, 'run/session-2.md'))
  ? { path: 'run/session-2.md', bytes: fs.statSync(path.join(root, 'run/session-2.md')).size, sha256: sha('run/session-2.md') }
  : null;
const result = {
  schema: 'table-memory/readback/v1',
  method: 'read exact saved files from disk and compare byte count and SHA-256 with the frozen approved-output manifest',
  manifest_valid: manifestValid,
  expected_paths: expectedPaths,
  files: results,
  matches,
  session2_artifact: session2,
  nas_execution: false,
  note: 'Local filesystem read-back only; no UGOS or NAS save/read-back executed.',
};
fs.writeFileSync(path.join(root, 'run/readback.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!matches) process.exit(1);
