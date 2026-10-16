#!/usr/bin/env python3
"""Google Play web search results per query/country: ordered package ids (+titles when parsable),
Buzzend position. Live public data, not a volume source."""
import re, json, time, urllib.request, urllib.parse, sys, html
OUT=sys.argv[1]; RAW=sys.argv[2]
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
Q=["squat counter","push up counter","pushup counter","sit up counter","rep counter","ai rep counter","exercise counter","workout counter","camera workout","ai workout","workout with friends","fitness challenge","fitness challenge with friends","workout challenge","fitness competition","workout streak","fitness streak","home workout","bodyweight workout","social fitness","fitness with friends","step challenge","squat challenge","push up challenge","burpee counter","high knees","jumping jack counter","lunge counter","ai fitness coach","buzzend","workout with friends app","fitness accountability","gamified fitness","compete with friends fitness"]
BZ="com.inventechgroup.buzzend"
out={}
for gl in ["US","NP","GB","IN"]:
    out[gl]={}
    for q in Q:
        url="https://play.google.com/store/search?q=%s&c=apps&hl=en&gl=%s"%(urllib.parse.quote(q),gl)
        try:
            h=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA,"Accept-Language":"en-US,en;q=0.9"}),timeout=30).read().decode("utf-8","replace")
        except Exception as e:
            out[gl][q]={"error":str(e)[:100]}; time.sleep(2); continue
        open(f"{RAW}/play_search_{gl}_{re.sub(r'[^a-z0-9]+','_',q)}.html","w").write(h)
        ids=[]; 
        for m in re.finditer(r'/store/apps/details\?id=([A-Za-z0-9_.]+)',h):
            if m.group(1) not in ids: ids.append(m.group(1))
        titles=[html.unescape(t) for t in re.findall(r'<span class="DdYX5">([^<]+)</span>',h)]
        if not titles: titles=[html.unescape(t) for t in re.findall(r'<div class="Epkrse">([^<]+)</div>',h)]
        pos=(ids.index(BZ)+1) if BZ in ids else None
        out[gl][q]={"count":len(ids),"buzzend_pos":pos,"ids":ids[:30],"titles":titles[:30]}
        time.sleep(1.5)
    print("done",gl,flush=True)
json.dump(out,open(OUT,"w"),indent=1)
for gl in out:
    print(f"\n===== {gl}")
    for q,v in out[gl].items():
        if "error" in v: print(f"  {q:34} ERROR {v['error']}"); continue
        print(f"  {q:34} n={v['count']:>3} buzzend_pos={v['buzzend_pos']}  top: {' | '.join(v['titles'][:6]) if v['titles'] else ' | '.join(v['ids'][:6])}")
