#!/usr/bin/env python3
"""Score App Store metadata variants by which harvested search terms their words fully cover.
Apple indexes name + subtitle + keyword field (+ category). A term counts as covered when every
content word of it (stopwords dropped, trailing 's' stripped) is present in the variant's word set."""
import json, re, sys
A=json.load(open(sys.argv[1]))
hint={}
for sf,seeds in A["hints"].items():
    for seed,hs in seeds.items():
        for i,h in enumerate(hs or []):
            if h and not h.startswith("__ERR__"):
                k=h.lower().strip(); hint.setdefault(k,{}); hint[k][sf]=min(hint[k].get(sf,99),i+1)
search=A["search"]["us"]
STOP={"with","for","the","a","an","and","&","w/","to","of","your","my","in","at","on","app","free"}
def norm(w):
    w=w.lower().strip(".,:!-—–'\"")
    w=w.replace("pushup","push up").replace("push-up","push up").replace("situp","sit up").replace("sit-up","sit up")
    return w
def words(text):
    out=set()
    for w in re.split(r"[\s,/&:.!]+", text):
        w=norm(w)
        if not w or w in STOP: continue
        for part in w.split():
            out.add(part[:-1] if part.endswith("s") and len(part)>3 else part)
    return out
def term_words(t):
    return {w[:-1] if w.endswith("s") and len(w)>3 else w for w in [norm(x) for x in re.split(r"[\s,/&:.!]+", t)] if w and w not in STOP for w in w.split()}
VARIANTS={
 "LIVE (Fitness Challenges / AI Workout Rep Counter / keywords unknown→assume none)":("Buzzend: Fitness Challenges","AI Workout Rep Counter",""),
 "V1 Buzzend: AI Rep Counter / Squat & Push Up Challenges":("Buzzend: AI Rep Counter","Squat & Push Up Challenges","sit up,jumping jack,lunge,burpee,high knees,fitness,workout,streak,leaderboard,friends,camera,home,exercise"),
 "V2 Buzzend: AI Squat Rep Counter / Workout Challenges w/ Friends":("Buzzend: AI Squat Rep Counter","Workout Challenges w/ Friends","push up,sit up,jumping jack,lunge,burpee,high knees,fitness,streak,leaderboard,camera,home,exercise,group"),
 "V3 Buzzend: Camera Rep Counter / Fitness Challenges & Friends":("Buzzend: Camera Rep Counter","Fitness Challenges & Friends","squat,push up,sit up,jumping jack,lunge,burpee,high knees,workout,streak,leaderboard,ai,home,exercise"),
 "V4 Buzzend: AI Rep Counter / Fitness Challenges w/ Friends":("Buzzend: AI Rep Counter","Fitness Challenges w/ Friends","squat,push up,sit up,jumping jack,lunge,burpee,high knees,workout,streak,leaderboard,camera,home,exercise"),
 "V5 Buzzend: Squat & Rep Counter / Workout Challenges w/ Friends":("Buzzend: Squat & Rep Counter","Workout Challenges w/ Friends","push up,sit up,jumping jack,lunge,burpee,high knees,ai,fitness,streak,leaderboard,camera,home,exercise"),
}
KEY=["squat counter","push up counter","pushup counter","sit up counter","rep counter","ai rep counter","exercise counter","camera workout","workout with friends","fitness challenge with friends","fitness challenge","group fitness challenge","workout challenge","fitness leaderboard","workout streak","fitness streak","squat challenge","push up challenge","jumping jack counter","burpee counter","lunge counter","home workout","ai workout","challenge friends","fitness with friends"]
print(f"{'variant':70} name sub kw | covered(all) | covered(hint≤3 & big≤2)")
for label,(name,sub,kw) in VARIANTS.items():
    ws=words(name)|words(sub)|words(kw)
    covered=[t for t in search if term_words(t)<=ws]
    good=[t for t in covered if hint.get(t,{}).get("us",99)<=3 and search[t]["big10k_in_top10"]<=2 and not re.search(r"[:!–—]| - ",t)]
    print(f"{label[:70]:70} {len(name):>4} {len(sub):>3} {len(kw.encode()):>3} | {len(covered):>12} | {len(good):>3}")
    print("    key terms covered:", [t for t in KEY if term_words(t)<=ws])
    print("    key terms MISSED :", [t for t in KEY if not term_words(t)<=ws])
    dup=set(words(name)|words(sub)) & words(kw)
    if dup: print("    WARNING duplicate words name/subtitle vs keywords:", dup)
