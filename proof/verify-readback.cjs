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
const matches = results.every((r) => r.match);
const session2 = fs.existsSync(path.join(root, 'run/session-2.md'))
  ? { path: 'run/session-2.md', bytes: fs.statSync(path.join(root, 'run/session-2.md')).size, sha256: sha('run/session-2.md') }
  : null;
const result = {
  schema: 'table-memory/readback/v1',
  method: 'read exact saved files from disk and compare byte count and SHA-256 with approved-output.json',
  files: results,
  matches,
  session2_artifact: session2,
  nas_execution: false,
  note: 'Local filesystem read-back only; no UGOS or NAS save/read-back executed.',
};
fs.writeFileSync(path.join(root, 'run/readback.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (!matches) process.exit(1);
