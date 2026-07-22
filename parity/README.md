# Buzzend Parity System

iOS and Android are built by two developers from the **same design**. The design
says *what it looks like*; it does **not** pin down *how every state and edge case
behaves*. That behavioral gap is where the two apps drift. This folder closes it.

## The idea

For each feature there is **one canonical contract** (`SPEC.md`) with numbered,
stable-ID requirements. Each platform records how it implemented each requirement
in a **conformance file** (`ios.md`, `android.md`) keyed by the same IDs. Because
both files answer the same ID list, a script can mechanically:

- **gate a commit** — every requirement is addressed on your platform, nothing left `TODO`;
- **diff the two apps** — list every ID where iOS and Android disagree.

The `SPEC.md` is the arbiter. `ios.md`/`android.md` are *not* independent
descriptions of the feature — they are answers to the spec.

## Source-of-truth rules

- **Backend API** = truth for data shapes, validation, error codes, pagination.
- **Design (docs/ + figma-images/)** = truth for layout, visuals, copy placement.
- **`SPEC.md`** = truth for **behavior**: states, gating rules, exact copy, the
  API calls a feature makes, and every edge case. It is informed by the old
  Flutter app + the design + the backend, but Flutter is an **input, not the
  authority** — where the contract departs from Flutter, that decision is recorded
  in the feature's `decisions.md`.
- **`shared/`** = the machine-readable "must-match" data (catalogs, codes, limits)
  both apps consume/copy, each locked by a test on its own side.

## Layout

```
parity/
  README.md               ← this file
  INSTRUCTIONS.md         ← how to author a SPEC + a conformance file (read before writing either)
  PARITY.md               ← status tracker (feature × iOS × Android × open divergences)
  templates/              ← SPEC.template.md, conformance.template.md
  shared/                 ← must-match constants (JSON) + design tokens
  features/<feature>/     ← SPEC.md, ios.md, android.md, test-matrix.md, decisions.md
  tools/                  ← parity-diff.py, check-conformance.py
```

## Per-feature workflow

1. **Author `SPEC.md` first** and agree on it (both devs). No code until the spec
   exists — otherwise you are just diffing two interpretations with no arbiter.
2. Each dev implements and fills their conformance file, answering **every ID**
   with a status + a code reference.
3. Run `tools/check-conformance.py features/<feature> --platform ios` before
   committing (gate). Wire it as a pre-commit / CI check.
4. Run `tools/parity-diff.py features/<feature>` to list iOS↔Android differences.
   Each real difference is either fixed or recorded (and approved) in `decisions.md`.
5. Run the `test-matrix.md` cases **on both devices** — the MD verifies intent, the
   device test verifies reality.
6. Update `PARITY.md`.

## What a "commit gate" can and can't do

A script **cannot** prove the code matches the prose. It **can** enforce that the
feature's conformance file exists, every spec ID has a real status (no blanks /
`TODO`), and iOS↔Android agree or the divergence is logged. The human confirms
code ↔ spec. Keep specs to *behavior* — do not re-describe pixels the design owns,
or they rot.

See `INSTRUCTIONS.md` before authoring anything, and `features/editor-music/` for a
complete worked example.
