#!/usr/bin/env python3
"""Turn the fresh Apple harvest + Google/Play evidence into the keyword-evidence notes (markdown)."""
import json, sys, collections, re
K=sys.argv[1]; OUT=sys.argv[2]; DATE="2026-10-15"
A=json.load(open(f"{K}/apple_keywords.json")); G=json.load(open(f"{K}/google_suggest.json")); P=json.load(open(f"{K}/play_results_parsed.json"))
L=[f"# Keyword evidence notes (observed {DATE})\n",
"Sources: Apple App Store autocomplete (search-hints endpoint, storefronts US/GB/NP) and the iTunes Search API (top 200 results per term, US and NP) run 2026-10-15; Google autocomplete (6 countries) run 2026-10-15; Google Play web search results (US/NP/GB/IN) run 2026-10-15. **No search volumes exist in this data.** Hint rank = position of the term in Apple's suggestion list for a seed (lower = Apple surfaces it earlier = stronger demand proxy). 'Big' = apps with >10,000 ratings in the top 10 (competition proxy). Master table: `../data/master-keyword-evidence.csv`.\n"]
# 1. Buzzend live ranks
L.append("## 1. Where Buzzend ranks in App Store search today (title 'Buzzend: Fitness Challenges' / subtitle 'AI Workout Rep Counter', live since 2026-10-11)\n")
for c in ["us","np"]:
    hits={t:v["buzzend_pos"] for t,v in A["search"][c].items() if v["buzzend_pos"]}
    L.append(f"- **{c.upper()}** storefront, {len(A['search'][c])} terms checked (top 200 each): " + (", ".join(f"`{t}` #{p}" for t,p in sorted(hits.items(), key=lambda x:x[1])) if hits else "not in the top 200 for any term"))
L.append("")
L.append("**Reading these ranks.** The live subtitle already wins the exact phrase `ai rep counter` (#1 US, #2 NP) and the title wins `group fitness challenge` (#15 US, #2 NP) — both phrases are fully covered by name + subtitle words. The exercise-specific counter terms do not rank in the US (`squat counter`, `push up counter`, `sit up counter` absent from the top 200; `rep counter` #131) because the exercise words are not in the name or subtitle and either are not in the hidden keyword field or carry too little weight there. Nepal ranks are higher across the board (fewer competing apps indexed on that storefront), but NP results for rare terms are noisy (Facebook/WhatsApp appear), so treat NP positions above ~#30 as soft evidence.")
L.append("")
# 2. opportunity table
L.append("## 2. Opportunity shortlist — Apple hint rank ≤ 3 in US and ≤ 2 big apps in the US top 10\n")
L.append("| Term | US hint rank | GB | NP | Big (>10k) in US top 10 | >1k in US top 10 | US top 3 today | NP top 3 today | Buzzend US / NP |")
L.append("|---|---|---|---|---|---|---|---|---|")
hint={}
for sf,seeds in A["hints"].items():
    for seed,hs in seeds.items():
        for i,h in enumerate(hs or []):
            if h and not h.startswith("__ERR__"):
                k=h.lower().strip(); hint.setdefault(k,{}); hint[k][sf]=min(hint[k].get(sf,99),i+1)
rows=[]
for t,v in A["search"]["us"].items():
    hr=hint.get(t,{}).get("us")
    if hr is not None and hr<=3 and v["big10k_in_top10"]<=2 and not re.search(r"[:!–—]| - ", t):
        npv=A["search"]["np"].get(t,{})
        rows.append((hr,v["big10k_in_top10"],t,v,npv))
for hr,big,t,v,npv in sorted(rows, key=lambda r:(r[0],r[1],r[2])):
    L.append(f"| {t} | {hr} | {hint.get(t,{}).get('gb','—')} | {hint.get(t,{}).get('np','—')} | {big} | {v['big1k_in_top10']} | {' · '.join((x['name'] or '')[:28] for x in v['top10'][:3])} | {' · '.join((x['name'] or '')[:28] for x in npv.get('top10',[])[:3])} | {v['buzzend_pos'] or '—'} / {npv.get('buzzend_pos') or '—'} |")
L.append(f"\nApp-name suggestions (terms containing ':', '!' or ' - ') are excluded here but kept in the CSV. {len(rows)} generic terms qualify. Terms with hint rank 1 and zero big apps are the most winnable for a small app; terms with 2 big apps need the exact phrase in name/subtitle to compete.\n")
# 3. high-demand but crowded
L.append("## 3. High-demand but crowded (hint rank ≤ 2, ≥ 4 big apps) — use in description/keywords only, not as a title bet\n")
crowded=[(hint[t]['us'],t,v) for t,v in A["search"]["us"].items() if hint.get(t,{}).get('us',99)<=2 and v["big10k_in_top10"]>=4]
for hr,t,v in sorted(crowded)[:25]: L.append(f"- `{t}` (hint {hr}, {v['big10k_in_top10']} big): {' · '.join((x['name'] or '')[:30] for x in v['top10'][:4])}")
# 4. storefront differences in hints
L.append("\n## 4. Storefront differences in Apple autocomplete (US vs GB vs NP) for the core seeds\n")
for seed in ["squat counter","push up counter","rep counter","workout with friends","fitness challenge","workout streak","ai workout","home workout","buzzend"]:
    L.append(f"- **{seed}** — US: {A['hints']['us'].get(seed,[])[:6]} · GB: {A['hints']['gb'].get(seed,[])[:6]} · NP: {A['hints']['np'].get(seed,[])[:6]}")
# 5. competitor frequency
L.append("\n## 5. Apps that appear most often in US top-10 results across all checked terms\n")
cnt=collections.Counter(); meta={}
for t,v in A["search"]["us"].items():
    for x in v["top10"]:
        cnt[x["name"]]+=1; meta[x["name"]]=x
for name,n in cnt.most_common(25): L.append(f"- {name} — in {n} top-10 lists; {meta[name]['ratings']} ratings; {meta[name]['seller']}")
# 6. Google autocomplete highlights
L.append("\n## 6. Google autocomplete highlights (US unless noted)\n")
bc=G["by_country"]["us"]
for s in ["squat counter","push up counter","rep counter app","workout with friends app","fitness challenge app","ai workout counter","app that counts push ups","app that counts squats","workout app that counts reps","fitness challenges with friends","how to count push ups","buzzend"]:
    L.append(f"- `{s}` → {bc.get(s,[])[:8]}")
zero=[s for s,v in bc.items() if not v or str(v[0]).startswith('__ERR__')]
L.append(f"- Seeds with **no** suggestions in the US: {zero}")
L.append("- Country comparison: suggestions for the counter/challenge seeds were identical or near-identical across US, GB, CA, AU, NP and IN (English queries); Nepal-specific terminology did not surface via autocomplete and needs Play Console country search data or Nepali-language queries.")
# 7. Play summary
L.append("\n## 7. Google Play search snapshot\n")
for gl,qs in P["search"].items():
    hits={q:v["pos"] for q,v in qs.items() if v["pos"]}
    L.append(f"- {gl}: Buzzend appears for {hits}")
L.append("- Counter cluster on Play is held by small single-exercise apps (AI Rep Counter 100+, RepCam AI 500+, Repletic 100+, Gym Rep Counter 500+ installs); challenge cluster is held by Leap's 30 Day Fitness Challenge (550K reviews), GymRats (114K), Challenges – Compete (1.08K) and Stridekick; 'workout with friends' returns gym loggers (Hevy 278K, Liftoff 96.5K) — a different intent.")
L.append("\n## 8. What this does NOT tell us\n- Absolute search volume on any platform; conversion by keyword; Google SERP positions (no Search Console); App Store 'popularity' scores (no ASO tool). Fill the blank columns in the CSV when a volume source is available.")
open(OUT,"w").write("\n".join(L)+"\n"); print("written",OUT, "shortlist rows:",len(rows))
