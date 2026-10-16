#!/usr/bin/env python3
"""Generate Playwright jobs for every store slot from one storyboard."""
import json, sys, os
from urllib.parse import urlencode
T="/Users/avinayaacharya/Development/buzzend-content/store-assets/templates"
OUT=sys.argv[1]  # output root
PH="../../assets/workout-landmark/"; SC="../../assets/screens-clean/"
# storyboard: (kind, kicker, title, sub, asset)
SHOTS=[
 ("photo","AI REP COUNTER","Your camera counts *your reps.*","Squats, push-ups, sit-ups and more, out loud",PH+"squats.jpg"),
 ("grid","CAMERA COUNTED","Seven exercises, *one\u00a0app.*","Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees",""),
 ("screen","CHALLENGES","Challenge *your friends.*","Create or join with a code. Live leaderboard.",SC+"v6-challenge.png"),
 ("photo","FORM CUES","Coaching *while you move.*","Hear why a rep didn't count",PH+"squat-side-wise.jpg"),
 ("screen","STREAKS","Keep your *streak.*","One quick set a day. Restore it if you slip.",SC+"v6-streak.png"),
 ("screen","COMMUNITY","Post your set. *Cheer theirs.*","Every counted set shows up for your friends",SC+"v6-community.png"),
 ("screen","DAILY GOAL","Steps *count too.*","Daily step goal, top activities, calories",SC+"v6-home.png"),
 ("screen","DISCOVER","Join with a *code or link.*","Public challenges, or private with approval",SC+"v6-discover.png"),
 ("photo","PUSH-UP COUNTER","Push-ups, *counted.*","Phone on the floor, camera facing you",PH+"pushup.jpg"),
 ("screen","STATISTICS","See your *progress.*","Best day, pace and daily trend per challenge",SC+"v6-stats.png"),
]
# extra per-exercise shots for custom product pages (iOS only)
CPP=[
 ("photo","SIT-UP COUNTER","Sit-ups, *counted.*","Side-on at floor level, two steps back",PH+"situp.jpg","situps"),
 ("photo","LUNGE COUNTER","Lunges, *counted.*","Side-on, chest up, full body in frame",PH+"lunge.jpg","lunges"),
 ("photo","JUMPING JACK COUNTER","Jumping jacks, *counted.*","Arms overhead, feet apart, or it doesn't count",PH+"jumping-jacks.jpg","jumping-jacks"),
 ("photo","HIGH KNEES COUNTER","High knees, *counted.*","Knee to hip height, every rep spoken",PH+"high-knee.jpg","high-knees"),
 ("photo","BURPEE COUNTER","Burpees, *counted.*","Facing the camera, whole body in frame",PH+"burpee.jpg","burpees"),
]
# sizes: (folder, width, height, count, params per kind)
SIZES=[
 ("ios/01-iphone-dynamic-island-medium-display",1206,2622,10,{"photo":{"pw":"90","h1":"8.6","gap":"8.5"},"screen":{"pw":"86","h1":"8.6","gap":"8.5"},"grid":{"tile":"29","h1":"8.6","gap":"8.5"}}),
 ("ios/_extra-sizes-not-offered-in-asc/iphone-medium-1179x2556",1179,2556,10,{"photo":{"pw":"90","h1":"8.6","gap":"8.5"},"screen":{"pw":"86","h1":"8.6","gap":"8.5"},"grid":{"tile":"29","h1":"8.6","gap":"8.5"}}),
 ("ios/_extra-sizes-not-offered-in-asc/iphone-6.9-1320x2868",1320,2868,10,{"photo":{"pw":"90","h1":"8.6","gap":"8.5"},"screen":{"pw":"86","h1":"8.6","gap":"8.5"},"grid":{"tile":"29","h1":"8.6","gap":"8.5"}}),
 ("ios/_extra-sizes-not-offered-in-asc/iphone-6.5-1284x2778",1284,2778,10,{"photo":{"pw":"90","h1":"8.6","gap":"8.5"},"screen":{"pw":"86","h1":"8.6","gap":"8.5"},"grid":{"tile":"29","h1":"8.6","gap":"8.5"}}),
 ("ios/02-ipad-13-inch",2064,2752,10,{"photo":{"pw":"52","h1":"6.4","gap":"6"},"screen":{"pw":"50","h1":"6.4","gap":"6"},"grid":{"tile":"20","h1":"6.4","gap":"6"}}),
 ("android/phone-1080x1920",1080,1920,8,{"photo":{"pw":"74","h1":"8.2","gap":"7"},"screen":{"pw":"78","h1":"8.2","gap":"7"},"grid":{"tile":"26","h1":"8.2","gap":"7"}}),
 ("android/tablet-7-1080x1920",1080,1920,8,{"photo":{"pw":"74","h1":"8.2","gap":"7"},"screen":{"pw":"78","h1":"8.2","gap":"7"},"grid":{"tile":"26","h1":"8.2","gap":"7"}}),
 ("android/tablet-10-1440x2560",1440,2560,8,{"photo":{"pw":"74","h1":"8.2","gap":"7"},"screen":{"pw":"78","h1":"8.2","gap":"7"},"grid":{"tile":"26","h1":"8.2","gap":"7"}}),
]
def url(kind, kicker, title, sub, asset, params):
    tpl={"photo":"v7-photo-shot.html","screen":"v7-screen-shot.html","grid":"v7-grid-shot.html"}[kind]
    q={"theme":"dark" if kind!="screen" else "cream","kicker":kicker,"title":title,"sub":sub, **params}
    if kind=="photo": q["photo"]=asset
    if kind=="screen": q["screen"]=asset
    return f"file://{T}/{tpl}?{urlencode(q)}"
jobs=[]; manifest=[]
slug=lambda s: s.lower().replace("\u00a0"," ").replace("*","").replace(".","").replace(",","").replace("'","").replace(" ","-")
for folder,w,h,n,P in SIZES:
    for i,(kind,kicker,title,sub,asset) in enumerate(SHOTS[:n],1):
        out=f"{OUT}/{folder}/{i:02d}-{slug(title)}-{w}x{h}.png"
        jobs.append({"url":url(kind,kicker,title,sub,asset,P[kind]),"out":out,"width":w,"height":h,"scale":1,"settle":1500})
        manifest.append({"slot":folder,"order":i,"kind":kind,"headline":title.replace("*",""),"sub":sub,"asset":asset.split("/")[-1] or "grid","file":out})
# CPP extras (per-exercise shots): medium-display size goes to the custom-product-pages folder; large sizes to the archive
CPP_TARGETS=[("ios/03-custom-product-pages-extras",SIZES[0]),("ios/_extra-sizes-not-offered-in-asc/cpp-extras-iphone-6.9-1320x2868",SIZES[2]),("ios/_extra-sizes-not-offered-in-asc/cpp-extras-iphone-6.5-1284x2778",SIZES[3])]
for target,(folder,w,h,_,P) in CPP_TARGETS:
    for kind,kicker,title,sub,asset,name in CPP:
        out=f"{OUT}/{target}/{name}-{w}x{h}.png"
        jobs.append({"url":url(kind,kicker,title,sub,asset,P[kind]),"out":out,"width":w,"height":h,"scale":1,"settle":1500})
        manifest.append({"slot":target,"order":0,"kind":kind,"headline":title.replace("*",""),"sub":sub,"asset":asset.split("/")[-1],"file":out})
# feature graphic
jobs.append({"url":f"file://{T}/v7-feature-graphic.html","out":f"{OUT}/android/feature-graphic-1024x500/feature-graphic-1024x500.png","width":1024,"height":500,"scale":1,"settle":1500})
manifest.append({"slot":"android/feature-graphic-1024x500","order":1,"kind":"feature","headline":"Your camera counts your reps.","sub":"Squats · Push-ups · Sit-ups · Lunges · Jumping jacks · Burpees · High knees","asset":"squats.jpg","file":jobs[-1]["out"]})
for j in jobs: os.makedirs(os.path.dirname(j["out"]),exist_ok=True)
json.dump(jobs,open(f"{OUT}/_source/jobs.json","w"),indent=1); json.dump(manifest,open(f"{OUT}/_source/manifest.json","w"),indent=1)
print(len(jobs),"jobs")
