# Parity Tracker

One row per feature. Status: ✅ conformance complete · 🚧 in progress · ⬜ not started.
"Diffs" = open must-match differences from `tools/parity-diff.py` (0 = in sync).
Run `python3 tools/parity-diff.py features/<key>` to refresh.

| Feature | Spec | iOS | Android | Diffs | Notes |
|---------|------|-----|---------|-------|-------|
| editor-music | v1 | ✅ | ⬜ (stub) | — | Android pending; iOS DIVERGE on MUSIC-EDGE-04 (export cancel) |

## Backlog (features to spec)
- ai-rep-counter (live rep counter burned into video)
- post-delete (delete post + delete single asset)
- countdown-sound (spoken 3·2·1 + toggle)
- offline-ui (connectivity banner)
- background-upload (banner + local notifications)
- challenge-record (skip picker, challenge post ≠ competition)
- discover (trending single row + "All" filter)
