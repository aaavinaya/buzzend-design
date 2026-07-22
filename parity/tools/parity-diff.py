#!/usr/bin/env python3
"""
parity-diff.py — the "find the difference" report.

Compares ios.md and android.md against the feature SPEC, per requirement ID, and
prints every ID where the two platforms DON'T agree (missing on one side, one
MATCH while the other is TODO/DIVERGE, etc.). This is the mechanical answer to
"how do iOS and Android differ on this feature?"

Usage:
    python3 tools/parity-diff.py features/<feature-key>
Exit code 0 = platforms agree on all must-match requirements, 1 = differences.
"""
import os
import re
import sys

ID_RE = re.compile(r'^[A-Z][A-Z0-9]*-[A-Z]+-\d+$')


def read(path):
    with open(path, encoding="utf-8") as f:
        return f.read()


def table_rows(md, section):
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
            if cells and ID_RE.match(cells[0]):
                rows.append(cells)
    return rows


def spec_map(feature_dir):
    md = read(os.path.join(feature_dir, "SPEC.md"))
    out = {}
    for r in table_rows(md, "Requirements"):
        out[r[0]] = {"req": r[1] if len(r) > 1 else "",
                     "must": (r[2].lower() if len(r) > 2 else "yes")}
    return out


def conf_map(feature_dir, platform):
    path = os.path.join(feature_dir, f"{platform}.md")
    if not os.path.exists(path):
        return None
    out = {}
    for r in table_rows(read(path), "Conformance"):
        out[r[0]] = {"status": (r[1].upper() if len(r) > 1 else ""),
                     "ref": r[2] if len(r) > 2 else ""}
    return out


def main():
    if len(sys.argv) < 2:
        print("usage: parity-diff.py features/<feature-key>")
        sys.exit(2)
    feature_dir = sys.argv[1]
    spec = spec_map(feature_dir)
    ios = conf_map(feature_dir, "ios")
    android = conf_map(feature_dir, "android")

    if ios is None or android is None:
        missing = "ios.md" if ios is None else "android.md"
        print(f"ℹ️  {missing} not present yet — cannot diff (fill both to compare).")
        sys.exit(0)

    diffs, blocking = [], 0
    for rid, meta in spec.items():
        i = ios.get(rid, {"status": "MISSING", "ref": ""})
        a = android.get(rid, {"status": "MISSING", "ref": ""})
        agree = i["status"] == a["status"] and i["status"] not in ("MISSING", "")
        # Both intentionally diverging is acceptable but worth a look.
        if agree and i["status"] == "DIVERGE":
            diffs.append((rid, meta, i, a, "review"))
            continue
        if not agree:
            severity = "BLOCK" if meta["must"] == "yes" else "info"
            if severity == "BLOCK":
                blocking += 1
            diffs.append((rid, meta, i, a, severity))

    name = os.path.basename(feature_dir.rstrip("/"))
    if not diffs:
        print(f"✅ {name}: iOS and Android agree on all {len(spec)} requirements.")
        sys.exit(0)

    print(f"Parity diff — {name}\n")
    print(f"{'ID':<18}{'must':<10}{'iOS':<10}{'Android':<10}{'':<6}")
    print("-" * 60)
    for rid, meta, i, a, sev in diffs:
        flag = {"BLOCK": "❌", "info": "•", "review": "👀"}[sev]
        print(f"{rid:<18}{meta['must']:<10}{i['status']:<10}{a['status']:<10}{flag}")
    print("\nLegend: ❌ must-match difference (resolve) · 👀 both DIVERGE (confirm same intent) · • platform-idiomatic")
    print(f"\n{blocking} must-match difference(s).")
    sys.exit(1 if blocking else 0)


if __name__ == "__main__":
    main()
