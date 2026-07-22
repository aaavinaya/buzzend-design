#!/usr/bin/env python3
"""
check-conformance.py — the per-platform commit gate.

Verifies that a platform's conformance file addresses EVERY requirement in the
feature SPEC: no requirement missing, nothing left TODO, and every DIVERGE has a
matching entry in decisions.md. It does NOT prove code matches the spec — it
enforces that the paperwork is complete and honest, so drift can't ship silently.

Usage:
    python3 tools/check-conformance.py features/<feature-key> --platform ios
Exit code 0 = clean, 1 = problems (blocks the commit / CI step).
"""
import argparse
import os
import re
import sys

ID_RE = re.compile(r'^[A-Z][A-Z0-9]*-[A-Z]+-\d+$')
VALID_STATUS = {"MATCH", "DIVERGE", "TODO", "NA"}


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def front_matter(md):
    m = re.match(r'^---\n(.*?)\n---', md, re.DOTALL)
    fm = {}
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip()
    return fm


def table_rows(md, section):
    """Return the cell-lists of the markdown table under `## <section>`."""
    lines = md.splitlines()
    start = None
    for i, line in enumerate(lines):
        if line.strip().lower() == f"## {section}".lower():
            start = i + 1
            break
    if start is None:
        return []
    rows = []
    for line in lines[start:]:
        s = line.strip()
        if s.startswith("## "):
            break
        if s.startswith("|"):
            cells = [c.strip() for c in s.strip("|").split("|")]
            rows.append(cells)
    # drop header + separator rows (those without a valid ID in column 0)
    return [r for r in rows if r and ID_RE.match(r[0])]


def spec_ids(feature_dir):
    md = read(os.path.join(feature_dir, "SPEC.md"))
    ids = {}
    for r in table_rows(md, "Requirements"):
        must = r[2].lower() if len(r) > 2 else "yes"
        ids[r[0]] = must
    return ids, front_matter(md).get("version")


def conformance(feature_dir, platform):
    path = os.path.join(feature_dir, f"{platform}.md")
    if not os.path.exists(path):
        return None, {}, {}
    md = read(path)
    status, ref = {}, {}
    for r in table_rows(md, "Conformance"):
        status[r[0]] = (r[1].upper() if len(r) > 1 else "")
        ref[r[0]] = r[2] if len(r) > 2 else ""
    return front_matter(md), status, ref


def decision_ids(feature_dir):
    path = os.path.join(feature_dir, "decisions.md")
    if not os.path.exists(path):
        return set()
    return set(re.findall(r'[A-Z][A-Z0-9]*-[A-Z]+-\d+', read(path)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("feature_dir")
    ap.add_argument("--platform", required=True, choices=["ios", "android"])
    args = ap.parse_args()

    if not os.path.isfile(os.path.join(args.feature_dir, "SPEC.md")):
        print(f"❌ no SPEC.md in {args.feature_dir}")
        sys.exit(1)

    ids, spec_version = spec_ids(args.feature_dir)
    fm, status, _ = conformance(args.feature_dir, args.platform)
    decisions = decision_ids(args.feature_dir)
    errors, warnings = [], []

    if fm is None:
        print(f"❌ missing {args.platform}.md")
        sys.exit(1)

    for rid, must in ids.items():
        st = status.get(rid)
        if st is None:
            errors.append(f"{rid}: missing from {args.platform}.md")
        elif st == "TODO" or st == "":
            errors.append(f"{rid}: TODO (not implemented)")
        elif st not in VALID_STATUS:
            errors.append(f"{rid}: invalid status '{st}'")
        elif st == "DIVERGE" and rid not in decisions:
            errors.append(f"{rid}: DIVERGE but no entry in decisions.md")

    for rid in status:
        if rid not in ids:
            warnings.append(f"{rid}: in {args.platform}.md but not in SPEC (stale?)")

    sv = fm.get("spec_version")
    if spec_version and sv and sv != spec_version:
        warnings.append(f"spec_version {sv} != SPEC version {spec_version} — re-verify (stale)")

    for w in warnings:
        print(f"⚠️  {w}")
    if errors:
        for e in errors:
            print(f"❌ {e}")
        print(f"\n{args.platform.upper()} conformance FAILED ({len(errors)} issue(s)).")
        sys.exit(1)
    print(f"✅ {args.platform.upper()} conformance complete for "
          f"{os.path.basename(args.feature_dir.rstrip('/'))} ({len(ids)} requirements).")


if __name__ == "__main__":
    main()
