# Add Music — decision log

Contract decisions (where we depart from Flutter, or make a judgement call) and
platform divergences. Each references the requirement ID(s) it affects — the commit
gate requires any `DIVERGE` status to have an entry here.

---

### MUSIC-RULE-10 — Mute replaces original (not Flutter's always-mix)
**Decision (contract):** Muted → music only; unmuted → original + music. Flutter
*always* mixed and never muted; Android introduced the mute toggle and that is the
shipped behavior. Both platforms follow Android. Status on both: MATCH.

### MUSIC-DATA-03 — Track id is the filename, not a UUID
**Decision (contract):** Flutter minted a random UUID per track; Android switched to
the filename so re-selecting a track is value-equal (undo/dirty tracking). Both use
the filename. Status on both: MATCH.

### MUSIC-RULE-04 — Resume mechanism differs by platform (accepted)
**Divergence (mechanism, not behavior):** the requirement is "resumable, no restart
from zero." Android streams to `<filename>.part` with a `Range:` header; iOS uses
`URLSession` resume data. Both satisfy the requirement, so both are MATCH — the
mechanism difference is platform-idiomatic and intentionally NOT reconciled.

### MUSIC-EDGE-04 — iOS: no mid-export cancel / half-file delete (KNOWN GAP)
**iOS divergence:** the music/video bake runs fire-and-forget inside the background
uploader (so "Done" returns instantly). The uploader's Cancel clears the whole job
but does not cancel an in-flight `AVAssetExportSession`, and a half-written temp
`.mp4` is left for the OS to purge rather than deleted explicitly. iOS status:
DIVERGE. Follow-up: expose a cancelable export that deletes its partial output.
Android should implement the full requirement (Transformer cancel + delete).
