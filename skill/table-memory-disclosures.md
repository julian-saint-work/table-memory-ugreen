# Disclosures

## Principal functionality

The Skill was created for the UGREEN Hackathon 2026. Its principal functionality is the source-linked recipe review workflow described in the root `SKILL.md`: inventorying an authorized folder, recovering recipe text from PDFs and images, optionally transcribing approved voice notes, presenting a review table, and saving an approved cookbook and shopping list.

## AI assistance

OpenAI ChatGPT was used to assist with concept exploration, workflow drafting, documentation review and static checking. The synthetic voice note was generated with ElevenLabs text-to-speech through the local sag client; the rehearsal transcript was produced with the ElevenLabs Scribe v2 hosted API, called from a local script. These are development and rehearsal tools, not runtime dependencies of the submitted Skill. The entrant directed the concept, chose the scope and boundaries, and is responsible for the submitted material.

## Third-party components

The package contains Markdown only. It does not bundle a third-party SDK, model weight, dataset, executable, script, API key or paid service. The official UGREEN Uliya Skill Development Standard and capability catalog were used as development references and are not redistributed.

## Data handling

The Skill reads only the exact files the user authorizes, starting with one dish and at most 12 regular files. The package defines no separate external-service upload step. The processing location of delegated OCR, document extraction and audio transcription depends on the platform and has not been verified; this Skill does not guarantee on-device-only processing. The final cookbook, optional shopping list and correction record are saved only after user approval, then read back for verification. Original files are not moved, renamed, edited or deleted. The correction record contains only the approved clarification and attribution, not unrelated personal data.

## Status

Round 1 package only. It has not run on a UGREEN AI NAS. Static checking and the synthetic local worked example are preparation evidence, not proof of installation, model quality or device execution. The correction record, repeat session, save read-back and changed-source handling are specified and locally rehearsed; they remain finalist tests on the assigned NAS.
