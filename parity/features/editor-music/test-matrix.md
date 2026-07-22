# Add Music — shared device test matrix

Run each case on BOTH iOS and Android; record pass/fail. This is the behavioral
parity check the MD files can't do (they verify intent, not runtime). Each case
lists the requirement IDs it exercises.

| # | Case | Steps | Expected | IDs | iOS | Android |
|---|------|-------|----------|-----|-----|---------|
| 1 | Short track loops | Add a track shorter than the clip; export | Music loops seamlessly for the whole clip | MUSIC-RULE-08 | | |
| 2 | Long track truncates | Add a track longer than the clip; export | Music stops at clip end (truncated) | MUSIC-RULE-08 | | |
| 3 | Muted → music only | Mute original, add music; export | Output has ONLY music, no original audio | MUSIC-RULE-10 | | |
| 4 | Unmuted → mixed | Leave unmuted, add music; export | Output has original + music mixed | MUSIC-RULE-10, MUSIC-RULE-11 | | |
| 5 | No original audio | Use a pose/camera clip with no audio track; add music; export | Music-only output, no crash | MUSIC-EDGE-02 | | |
| 6 | Speed independent | Set 0.5×/1.5×, add music; export | Video+original retimed; music at normal speed | MUSIC-RULE-12 | | |
| 7 | Starts at clip start | Add music; export | Music begins at 0:00 (no offset) | MUSIC-RULE-09 | | |
| 8 | Cancel mid-export | Start export, cancel | Export stops; no half-written file left | MUSIC-EDGE-04 | | |
| 9 | Reuse cached | Add a track, remove, add it again | Second add is instant (no re-download) | MUSIC-RULE-01 | | |
| 10 | Resume stalled DL | Start a large track, kill network, restore | Download resumes (not from zero); progress continues | MUSIC-RULE-04, MUSIC-RULE-05 | | |
| 11 | Late DL vs newer choice | Tap track A, immediately tap None (or B) before A finishes | A's completion does NOT select A | MUSIC-EDGE-01 | | |
| 12 | Download failure | Force a network error on tap | Error surfaced; track not selected; app stable | MUSIC-RULE-06 | | |
| 13 | None clears | Select a track, then tap None | Selection cleared; export has no music | MUSIC-UI-04 | | |
| 14 | Preview mute-aware | Play preview muted vs unmuted | Muted → only music; unmuted → both | MUSIC-UI-01, MUSIC-UI-02 | | |
| 15 | Video-only entry | Open the editor on a PHOTO | No Music tool shown | MUSIC-UI-06 | | |
| 16 | Undo/redo/reset | Add music, undo | Music selection reverts like any edit | MUSIC-STATE-01 | | |
