#!/usr/bin/env python3
"""Build the master keyword evidence CSV from harvested public data.
Columns are evidence-only: no invented volumes. Blank = not available."""
import json, csv, os, sys, re
K=sys.argv[1]; OUT=sys.argv[2]
def load(p):
    try: return json.load(open(p))
    except Exception: return None
apple=load(os.path.join(K,"apple_keywords.json")); gsug=load(os.path.join(K,"google_suggest.json")); play=load(os.path.join(K,"play_results_parsed.json"))
rows={}
def row(kw):
    kw=kw.lower().strip()
    return rows.setdefault(kw,{"keyword":kw})
# Apple hints: rank of suggestion for seed (lower = stronger demand proxy)
if apple:
    for sf,seeds in apple["hints"].items():
        for seed,hs in seeds.items():
            for i,h in enumerate(hs or []):
                if not h or h.startswith("__ERR__"): continue
                r=row(h); key=f"apple_hint_rank_{sf}"
                r[key]=min(r.get(key,99),i+1); r.setdefault("apple_hint_seed",seed)
    for country,terms in apple["search"].items():
        for t,v in terms.items():
            r=row(t)
            r[f"apple_results_{country}"]=v["total_returned"]; r[f"buzzend_pos_appstore_{country}"]=v["buzzend_pos"] or ""
            r[f"apple_top10_big10k_{country}"]=v["big10k_in_top10"]; r[f"apple_top10_big1k_{country}"]=v["big1k_in_top10"]
            r[f"apple_top3_{country}"]=" | ".join((x["name"] or "")[:30] for x in v["top10"][:3])
if gsug:
    for gl,seeds in gsug["by_country"].items():
        for seed,sugs in seeds.items():
            r=row(seed); r[f"google_suggest_count_{gl}"]=len([s for s in sugs if not str(s).startswith("__ERR__")])
            for i,s in enumerate(sugs or []):
                if str(s).startswith("__ERR__"): continue
                rr=row(s); k=f"google_suggest_rank_{gl}"; rr[k]=min(rr.get(k,99),i+1); rr.setdefault("google_suggest_seed",seed)
    for seed,exp in gsug["alpha_expansion_us"].items():
        for q,sugs in exp.items():
            for s in sugs or []:
                if str(s).startswith("__ERR__"): continue
                rr=row(s); rr.setdefault("google_alpha_seed",seed)
if play:
    for gl,qs in play["search"].items():
        for q,v in qs.items():
            r=row(q); r[f"play_results_{gl}"]=len(v["ids"]); r[f"buzzend_pos_play_{gl}"]=v["pos"] or ""; r[f"play_top3_{gl}"]=" | ".join(v["titles"][:3])
# classification helpers
def cat(k):
    if "buzzend" in k: return "brand"
    if re.search(r"count|counter|rep ",k): return "rep-counting"
    if re.search(r"friend|social|compet|leaderboard|challenge|accountab|group|team",k): return "social-challenge"
    if re.search(r"streak|habit|motivat|consisten|gamif",k): return "motivation-streak"
    if re.search(r"\bai\b|camera|pose|vision|smart|automatic|auto ",k): return "ai-camera"
    if re.search(r"home|bodyweight|no equipment|daily|beginner",k): return "home-workout"
    return "other"
def intent(k):
    if re.search(r"how to|why|what|benefit|vs|reddit|review|best",k): return "informational/commercial-investigation"
    if re.search(r"app|download|apk|free|online",k): return "transactional/app-seeking"
    if "buzzend" in k: return "navigational"
    return "mixed"
cols=["keyword","category","intent_guess","apple_hint_seed","apple_hint_rank_us","apple_hint_rank_gb","apple_hint_rank_np","apple_results_us","apple_top10_big10k_us","apple_top10_big1k_us","buzzend_pos_appstore_us","apple_top3_us","apple_results_np","apple_top10_big10k_np","buzzend_pos_appstore_np","apple_top3_np","google_suggest_seed","google_suggest_rank_us","google_suggest_rank_gb","google_suggest_rank_ca","google_suggest_rank_au","google_suggest_rank_np","google_suggest_rank_in","google_suggest_count_us","google_alpha_seed","play_results_US","buzzend_pos_play_US","play_top3_US","play_results_NP","buzzend_pos_play_NP","play_top3_NP","play_results_GB","buzzend_pos_play_GB","play_results_IN","buzzend_pos_play_IN","google_monthly_volume","volume_source_date","keyword_difficulty","difficulty_source","relevance_to_buzzend","priority","confidence","recommended_placement","notes"]
with open(OUT,"w",newline="") as f:
    w=csv.DictWriter(f,fieldnames=cols,extrasaction="ignore"); w.writeheader()
    for k in sorted(rows):
        r=rows[k]; r["category"]=cat(k); r["intent_guess"]=intent(k)
        w.writerow(r)
print("rows:",len(rows),"->",OUT)
