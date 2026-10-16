#!/usr/bin/env python3
"""Apple App Store keyword evidence: (1) autocomplete hints = demand proxy (Apple's own suggestions),
(2) search API top results = competition + Buzzend's live rank. US + NP + GB storefronts."""
import json, time, urllib.request, urllib.parse, xml.etree.ElementTree as ET, sys
OUT=sys.argv[1]
BUZZEND_ID=1658683882
STOREFRONTS={"us":"143441-1,29","gb":"143444-1,29","np":"143484-1,29"}
SEEDS=["ai workout","ai fitness","ai coach","rep counter","rep count","squat counter","squat","push up counter","pushup counter","push up","sit up counter","situp","lunge counter","jumping jack","burpee counter","high knees","exercise counter","workout counter","camera workout","workout with friends","fitness with friends","fitness challenge","workout challenge","challenge friends","fitness competition","workout competition","fitness leaderboard","workout streak","fitness streak","streak","home workout","bodyweight workout","no equipment workout","daily workout","workout motivation","fitness accountability","accountability partner","fitness social","social fitness","gamified fitness","fitness game","step challenge","step counter","30 day challenge","squat challenge","push up challenge","plank","hiit","calisthenics","workout tracker","fitness tracker","exercise tracker","form check","pose","motion tracking","buzzend"]
def hints(term, sf):
    url=("https://search.itunes.apple.com/WebObjects/MZSearchHints.woa/wa/hints?clientApplication=Software&term="+urllib.parse.quote(term))
    try:
        req=urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0","X-Apple-Store-Front":sf})
        xml=urllib.request.urlopen(req,timeout=20).read(); root=ET.fromstring(xml); out=[]
        for d in root.iter("dict"):
            kids=list(d)
            for i,el in enumerate(kids):
                if el.tag=="key" and el.text=="term" and i+1<len(kids): out.append(kids[i+1].text)
        return out
    except Exception as e: return ["__ERR__:"+str(e)[:60]]
def search(term, country, limit=200):
    url=("https://itunes.apple.com/search?entity=software&country=%s&limit=%d&term=%s"%(country,limit,urllib.parse.quote(term)))
    try:
        req=urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        return json.load(urllib.request.urlopen(req,timeout=25)).get("results",[])
    except Exception as e: return []
res={"hints":{}, "search":{}}
for sf_name, sf in STOREFRONTS.items():
    res["hints"][sf_name]={}
    for s in SEEDS:
        res["hints"][sf_name][s]=hints(s,sf); time.sleep(0.3)
    print(f"hints done for {sf_name}", flush=True)
# candidate terms: seeds + all US hint suggestions
cands=set(SEEDS)
for s,h in res["hints"]["us"].items():
    for t in h:
        if t and not t.startswith("__ERR__"): cands.add(t.lower().strip())
KEEP=("rep","squat","push","sit up","situp","jumping","lunge","burpee","knee","counter","count","workout","fitness","exercise","challenge","streak","friend","home","ai","leaderboard","camera","pose","form","accountab","social","compet","step","calisthen","bodyweight","motivat","habit","buzzend")
DROP=("watch","garmin","fitbit","kids","dog","bike","cycling","run","yoga","diet","calorie","weight loss","music","homework","solver","study","math","essay","chat","writer","photo","art","image","video editor","face","girl","hair")
cands=[c for c in cands if any(k in c for k in KEEP) and not any(d in c for d in DROP)]
print(f"{len(cands)} candidate terms for competition check", flush=True)
for country in ["us","np"]:
    res["search"][country]={}
    for i,t in enumerate(sorted(cands)):
        r=search(t,country)
        pos=next((k+1 for k,x in enumerate(r) if x.get("trackId")==BUZZEND_ID),None)
        top10=[{"name":x.get("trackName"),"id":x.get("trackId"),"ratings":x.get("userRatingCount"),"rating":x.get("averageUserRating"),"genre":x.get("primaryGenreName"),"seller":x.get("sellerName")} for x in r[:10]]
        res["search"][country][t]={"total_returned":len(r),"buzzend_pos":pos,"big10k_in_top10":sum(1 for x in r[:10] if (x.get("userRatingCount") or 0)>10000),"big1k_in_top10":sum(1 for x in r[:10] if (x.get("userRatingCount") or 0)>1000),"top10":top10}
        time.sleep(0.35)
        if i%25==0: print(f"  {country}: {i}/{len(cands)}", flush=True)
json.dump(res, open(OUT,"w"), indent=1)
print("saved", OUT)
