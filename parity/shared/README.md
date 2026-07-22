# shared/ — must-match constants

Values that **must be byte-identical** on iOS and Android. Keep them here once;
each app copies/generates from these and locks the copy with a test on its own
side (e.g. iOS `EditorMusicCatalogTests`, Android `EditorMusicCatalogTest`). If a
value changes, it changes here first, then both apps re-sync and their tests catch
any drift.

| File | What it pins |
|------|--------------|
| `music-catalog.json` | The editor music tracks — title, filename (== id), order, and the S3 base URL. |
| `workout-codes.json` | Workout-type codes (challenge short code ↔ backend enum ↔ display name). |
| `validation-limits.json` | Compose/editor limits (max photos, min trim, speeds, etc.). |

Add new constant files as features introduce shared data. JSON so both platforms
and the tooling can read it. **Do not** hand-maintain the same list in two apps —
point both at these.
