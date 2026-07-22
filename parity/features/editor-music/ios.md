---
feature: editor-music
platform: ios
spec_version: 1
last_updated: 2026-07-22
---

# Add Music (media editor) — iOS conformance

AVFoundation port. Key files: `EditorMusicCatalog.swift`, `MusicDownloader.swift`,
`ComposeEdit.swift`, `ComposeEditorModel.swift`, `ComposeEditPanels.swift`,
`ComposeEditView.swift`, `ComposeRenderer.swift`.

## Conformance

| ID | Status | Reference / Notes |
|----|--------|-------------------|
| MUSIC-DATA-01 | MATCH | `EditorMusicCatalog.tracks` (95, ordered); locked by `EditorMusicCatalogTests` |
| MUSIC-DATA-02 | MATCH | `EditorMusicCatalog.audioBaseURL` |
| MUSIC-DATA-03 | MATCH | `MusicCatalogEntry.id == filename` |
| MUSIC-DATA-04 | MATCH | `remoteURL(for:)` uses `.urlPathAllowed` percent-encoding; test asserts %20 |
| MUSIC-RULE-01 | MATCH | `MusicDownloader` → caches/audio/<filename>, reuse if size>0 |
| MUSIC-RULE-02 | MATCH | `URLSession` download task; `@MainActor` only for state, IO off-main |
| MUSIC-RULE-03 | MATCH | `inFlight[id]` task dedupe in `ensureLocal` |
| MUSIC-RULE-04 | MATCH | Resumable via URLSession resume data (mechanism differs from Android Range/.part — see decisions MUSIC-RULE-04) |
| MUSIC-RULE-05 | MATCH | `progress` via `task.progress` KVO; `downloadedIds` seeded in `init` |
| MUSIC-RULE-06 | MATCH | Non-2xx/error → returns nil, keeps resume data; selection not committed |
| MUSIC-STATE-01 | MATCH | `ComposeEditState.music`; `setMusic` via edit path; part of `isEdited` |
| MUSIC-STATE-02 | MATCH | Picker state on `MusicDownloader` + `musicPendingId` (view state, not edit) |
| MUSIC-EDGE-01 | MATCH | `selectMusic` commits only if `musicPendingId == entry.id` |
| MUSIC-RULE-07 | MATCH | `ComposeRenderer.renderVideo` adds `compMusic` audio track |
| MUSIC-RULE-08 | MATCH | Loop-insert until finalDuration, capped via `CMTimeMinimum` |
| MUSIC-RULE-09 | MATCH | Music inserted at `.zero`; no offset |
| MUSIC-RULE-10 | MATCH | Original added only when `!muted`; music always → music-only vs mixed |
| MUSIC-RULE-11 | MATCH | `AVMutableAudioMix` unity (1.0) both tracks |
| MUSIC-RULE-12 | MATCH | Video+original `scaleTimeRange`d; music not scaled |
| MUSIC-EDGE-02 | MATCH | Music track added regardless of original audio presence |
| MUSIC-EDGE-03 | MATCH | `renderVideo` returns nil on non-complete → uploader posts un-baked source |
| MUSIC-EDGE-04 | DIVERGE | Export runs fire-and-forget in the background uploader; no mid-export cancel/half-file delete yet — see decisions MUSIC-EDGE-04 |
| MUSIC-PERF-01 | MATCH | AVFoundation only; no FFmpeg dependency |
| MUSIC-UI-01 | MATCH | Second looping `AVPlayer` (`configureMusicPreview`) |
| MUSIC-UI-02 | MATCH | Video player `isMuted = edit.muted`; music player always audible |
| MUSIC-UI-03 | MATCH | Loops on its own boundary; export is authoritative |
| MUSIC-UI-04 | MATCH | `MusicPanel` — leading "None" row + single-select |
| MUSIC-UI-05 | MATCH | Row trailing: spinner+%, "Saved", check + highlight |
| MUSIC-UI-06 | MATCH | Music tool inside the `if model.isVideo` toolbar block |
| MUSIC-COPY-01 | MATCH | "Add music" / "None" / "Saved" |

## Notes
- Export is deferred to the background uploader (Done returns instantly), so the
  music bake happens off-screen with the "Posting…" banner — see the `no-loader`
  behavior. The uploader's Cancel clears the whole job but does not cancel an
  in-flight `AVAssetExportSession` (MUSIC-EDGE-04).
- On-device DoD verification pending (see test-matrix.md).
