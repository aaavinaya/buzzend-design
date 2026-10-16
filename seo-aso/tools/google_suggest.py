#!/usr/bin/env python3
"""Google Search autocomplete harvest (public suggest endpoint) as a demand/intent proxy per country.
NOT a volume source — presence/ordering of suggestions only."""
import json, time, urllib.request, urllib.parse, sys, string
OUT=sys.argv[1]
SEEDS=["squat counter","push up counter","pushup counter","sit up counter","rep counter","rep counter app","exercise counter app","ai rep counter","camera rep counter","ai workout counter","workout with friends","workout with friends app","fitness challenge app","fitness challenges with friends","workout competition app","fitness leaderboard app","workout streak app","fitness streak app","fitness accountability app","social fitness app","gamified fitness app","exercise habit tracker","home workout app","bodyweight workout app","ai fitness coach","ai workout coach","ai exercise tracker","camera based workout tracking","automatic rep counter","how to count push ups","how to track squats at home","fitness challenges to do with friends","how to stay motivated to work out","buzzend","buzzend app","squat challenge app","push up challenge app","30 day squat challenge app","daily workout challenge app","workout app that counts reps","app that counts push ups","app that counts squats","phone camera workout app"]
COUNTRIES=["us","gb","ca","au","np","in"]
def suggest(q, gl):
    url="https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=%s&q=%s"%(gl,urllib.parse.quote(q))
    try:
        req=urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        return json.load(urllib.request.urlopen(req,timeout=15))[1]
    except Exception as e: return ["__ERR__:"+str(e)[:60]]
out={"by_country":{}, "alpha_expansion_us":{}}
for gl in COUNTRIES:
    out["by_country"][gl]={}
    for s in SEEDS:
        out["by_country"][gl][s]=suggest(s,gl); time.sleep(0.25)
    print("done",gl,flush=True)
for s in ["squat counter","push up counter","rep counter","workout with friends","fitness challenge app","ai workout","app that counts"]:
    out["alpha_expansion_us"][s]={}
    for ch in [" "+c for c in string.ascii_lowercase]:
        out["alpha_expansion_us"][s][s+ch]=suggest(s+ch,"us"); time.sleep(0.2)
    print("alpha done",s,flush=True)
json.dump(out, open(OUT,"w"), indent=1)
print("saved",OUT)
