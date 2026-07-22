# Authoring Instructions — SPEC & conformance files

Read this before writing a `SPEC.md`, an `ios.md`, or an `android.md`. The whole
system depends on **stable IDs** and a **parseable table format** — follow them
exactly or the tools can't gate/diff.

---

## 1. Feature key & folder

Pick a short kebab-case key: `editor-music`, `ai-rep-counter`, `post-delete`.
Create `parity/features/<feature-key>/` from the templates:

```
SPEC.md          decisions.md      ios.md
android.md       test-matrix.md
```

Copy `templates/SPEC.template.md` → `SPEC.md`, and
`templates/conformance.template.md` → both `ios.md` and `android.md`.

## 2. The requirement ID scheme (critical)

`FEATURE-CATEGORY-NN` — uppercase, zero-padded number. Example: `MUSIC-EDGE-03`.

- `FEATURE` — a short token unique to the feature (`MUSIC`, `REPCOUNT`, `DELETE`).
- `CATEGORY` — one of:
  | Category | Covers |
  |----------|--------|
  | `DATA`   | catalogs, constants, enums, must-match values |
  | `STATE`  | loading / empty / error / offline / success screen states |
  | `RULE`   | business/gating logic (who can do what, limits, when enabled) |
  | `EDGE`   | edge cases & failure handling |
  | `COPY`   | exact user-facing strings (labels, dialogs, errors) |
  | `API`    | endpoints, params, status codes, what each error means |
  | `UI`     | behavioral UI (not pixels): placement, single-select, entry point |
  | `PERF`   | performance / threading / resource rules |
- `NN` — `01`, `02`, … **never renumber or reuse an ID.** If a requirement is
  dropped, mark it `Deprecated` in the spec; don't recycle its number.

IDs are the join key across `SPEC.md`, `ios.md`, `android.md`, `decisions.md`, and
`test-matrix.md`.

## 3. SPEC.md rules (the contract)

- Must contain a `## Requirements` section with a table whose **first three columns
  are exactly** `ID | Requirement | Must-match`. The tools read this table as the
  canonical ID registry.
  - `Must-match` = `yes` (iOS & Android must be identical) or `platform` (may differ
    idiomatically — e.g. native gesture/sheet style).
- Below the table, add detail subsections **headed by the ID** (`### MUSIC-EDGE-03`)
  for anything needing more than one line: the exact rule, copy, API call, numbers.
- **Cover the behavioral gap, not the visuals.** States, rules, edge cases, copy,
  API. Reference `docs/` / `figma-images/` for layout — do not restate pixels.
- Set the front-matter `version` and bump it on any change. Add a one-line
  `## Changelog` entry. Changing the spec marks both conformance files **stale**.
- Where the contract departs from the old Flutter app or is a judgement call, add a
  row to `decisions.md` and reference it from the requirement subsection.

## 4. conformance file rules (ios.md / android.md)

- Must contain a `## Conformance` section with a table whose columns are exactly
  `ID | Status | Reference / Notes`.
- **One row per SPEC ID** (same order). Status is one of:
  | Status | Meaning |
  |--------|---------|
  | `MATCH`   | implemented per spec |
  | `DIVERGE` | intentionally differs — **must** have a `decisions.md` entry for this ID |
  | `TODO`    | not done yet (blocks the commit gate) |
  | `NA`      | not applicable on this platform (explain in Notes) |
- `Reference / Notes` — the file/type/function that implements it (e.g.
  `EditorMusicCatalog.swift`), or the reason for `DIVERGE`/`NA`.
- Fill in the front-matter `spec_version` you verified against. If it's lower than
  `SPEC.md`'s `version`, the file is stale → re-verify.

## 5. Verify before committing

From `parity/`:

```
# commit gate — every ID addressed on your platform, none TODO, DIVERGE has a decision
python3 tools/check-conformance.py features/<feature-key> --platform ios

# after both platforms are filled — list every ID where iOS and Android disagree
python3 tools/parity-diff.py features/<feature-key>
```

Wire `check-conformance.py` into each app repo's pre-commit hook or CI (the app repo
includes `parity/` as a git submodule so the hook can read the spec). A non-zero exit
blocks the commit. `parity-diff.py` is the "find the difference" report — run it once
both sides exist; resolve every reported ID by fixing code or logging a decision.

## 6. test-matrix.md

List the concrete device test cases (the same ones both devs run), each tagged with
the IDs it exercises. This is the behavioral parity check that the MD files can't do.

---

**Golden rules:** spec first · stable IDs · tables exactly as specified · behavior
not pixels · every DIVERGE has a decision · keep it lean enough that it actually gets
filled in.
