---
feature: editor-music
title: Add Music (media editor)
version: 1
last_updated: 2026-07-22
owners: [ios, android]
design_ref: docs/screens/home/compose.html
---

# Add Music (media editor) — SPEC (canonical contract)

Add background music to a **video** in the media editor: pick a track from a fixed
catalog, download+cache it, preview it looping over the clip, and burn it into the
exported video. Ported from the Flutter media library (idea + data) with Android as
the shipped-behavior reference; where this contract departs from Flutter, see
`decisions.md`. Catalog + limits come from `shared/music-catalog.json` and
`shared/validation-limits.json`.

## Requirements

| ID | Requirement | Must-match |
|----|-------------|------------|
| MUSIC-DATA-01 | Catalog = the 95 tracks in `shared/music-catalog.json`, verbatim and in the same order | yes |
| MUSIC-DATA-02 | S3 base URL exactly `https://itg-misc-static-public.s3.us-east-2.amazonaws.com/audio-tracks/` | yes |
| MUSIC-DATA-03 | Track id == filename (stable natural key; NOT a minted UUID) | yes |
| MUSIC-DATA-04 | Remote URL = base + percent-encoded filename (spaces/parens must encode) | yes |
| MUSIC-RULE-01 | Download-on-tap → cache to a dedicated dir → reuse if exists && size>0 | yes |
| MUSIC-RULE-02 | Download runs off the main thread / async | yes |
| MUSIC-RULE-03 | Concurrent taps of the same track share ONE download (per-track serialize) | yes |
| MUSIC-RULE-04 | Download is resumable (no restart-from-zero on a stalled 7–19 MB file) | yes |
| MUSIC-RULE-05 | Progress 0…1 reported to the UI; downloaded-set seeded on panel open | yes |
| MUSIC-RULE-06 | Graceful failure: surface an error, keep partial for resume, never select an unfinished file | yes |
| MUSIC-STATE-01 | `music: MusicTrack?` is an UNDOABLE edit; select/clear via the standard edit-mutation path | yes |
| MUSIC-STATE-02 | Transient picker state (downloadingId, progress, downloaded ids, pending id) is NOT in the undoable edit state | yes |
| MUSIC-EDGE-01 | Pending-selection reconciliation: a late download must not override a newer choice (None / other track) | yes |
| MUSIC-RULE-07 | Export builds a composition with a dedicated music audio track | yes |
| MUSIC-RULE-08 | Music loops to cover the clip and is capped at clip length (short → loops, long → truncates) | yes |
| MUSIC-RULE-09 | Music starts at clip start — NO start offset | yes |
| MUSIC-RULE-10 | Muted → output = music only; Unmuted → output = original + music mixed | yes |
| MUSIC-RULE-11 | No music-volume control; music plays at unity gain | yes |
| MUSIC-RULE-12 | Speed retimes video + original audio together; music is independent at normal speed | yes |
| MUSIC-EDGE-02 | A source with NO original audio still works (music-only output) | yes |
| MUSIC-EDGE-03 | Export failure falls back to the un-baked source URL (flow never dead-ends) | yes |
| MUSIC-EDGE-04 | Export is cancelable, cancel deletes the half-written file, no partial-file leaks | yes |
| MUSIC-PERF-01 | No FFmpeg — use the platform media stack (AVFoundation / Media3) | yes |
| MUSIC-UI-01 | Best-effort second looping audio player previews the track alongside the video | yes |
| MUSIC-UI-02 | Preview is mute-aware (muted → only music audible; unmuted → both) | yes |
| MUSIC-UI-03 | Preview is not sample-synced; the export is the authoritative mix | yes |
| MUSIC-UI-04 | Single-select list with a leading "None" row that clears the selection | yes |
| MUSIC-UI-05 | Per-row states: spinner+% while downloading, "Saved" once cached, highlight+check when selected | yes |
| MUSIC-UI-06 | Music entry point on the VIDEO editor toolbar ONLY (never on photos) | yes |
| MUSIC-COPY-01 | Copy: section "Add music"; clear row "None"; cached hint "Saved" | yes |

## Details

### MUSIC-DATA-04
`base + filename.percentEncoded(path-allowed)`. Spaces → `%20`; parentheses may stay
literal (valid in a path). Example: `…/ANtarcticbreeze%20-%20This%20is%20Our%20World%20(Audiojungle).mp3`.

### MUSIC-EDGE-01
Track a `pendingId` = the last-tapped track. When a download completes, commit the
selection ONLY if `pendingId` still equals that track's id; otherwise discard it
(the user tapped None or another track meanwhile).

### MUSIC-RULE-08 / RULE-09 / RULE-12
Insert the music asset's audio repeatedly at increasing offsets until it covers the
FINAL (post-trim, post-speed) video duration; cap the last insert at that duration.
Music is inserted at offset 0 (clip start) and is never time-scaled by `speed`.

### MUSIC-RULE-10
Original audio is included only when the clip is not muted. Music is always added.
So: muted ⇒ music only; unmuted ⇒ original + music. (Flutter always mixed and never
muted — this follows Android; see `decisions.md` MUSIC-RULE-10.)

### MUSIC-API — none
There is NO catalog API/DTO/JSON endpoint. The catalog is a compile-time constant;
the only network calls are the S3 file downloads (`MUSIC-RULE-*`).

## Out of scope / deferred
- Music on photos (video only).
- Multiple simultaneous tracks; start offset; music-volume slider (never add these).

## Changelog
- v1 (2026-07-22): initial spec, ported from Flutter + Android contract.
