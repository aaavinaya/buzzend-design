import re, sys, os, html, json, urllib.request, time
RAW=sys.argv[1]; OUT=sys.argv[2]
BZ="com.inventechgroup.buzzend"
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
res={}
for f in sorted(os.listdir(RAW)):
    if not f.startswith("play_search_"): continue
    gl=f.split("_")[2]; q=f[len("play_search_")+len(gl)+1:-5].replace("_"," ")
    h=open(os.path.join(RAW,f),encoding="utf-8",errors="replace").read()
    ids=[]
    for m in re.finditer(r'/store/apps/details\?id=([A-Za-z0-9_.]+)',h):
        if m.group(1) not in ids: ids.append(m.group(1))
    titles=[html.unescape(t) for t in re.findall(r'<span class="DdYX5">([^<]+)</span>',h)]
    res.setdefault(gl,{})[q]={"ids":ids,"titles":titles,"pos":(ids.index(BZ)+1 if BZ in ids else None)}
for gl in res:
    print(f"\n===== Play search {gl} (first 6 titles; n=result count) =====")
    for q,v in sorted(res[gl].items()):
        print(f"  {q:36} n={len(v['ids']):>3} buzzend_pos={str(v['pos']):>4} | {' | '.join(v['titles'][:6])}")
# competitor pick: apps in top-5 for the core queries in US
core=["squat counter","push up counter","rep counter","ai rep counter","workout with friends","fitness challenge with friends","fitness challenge","workout streak","camera workout","exercise counter"]
picks=[]
for q in core:
    v=res.get("US",{}).get(q)
    if v:
        for i,(pid,t) in enumerate(zip(v["ids"][:5],v["titles"][:5])):
            if pid not in [p[0] for p in picks]: picks.append((pid,t,q,i+1))
print(f"\n{len(picks)} competitor listings to fetch")
comp={}
def clean(s): return html.unescape(re.sub(r'<[^>]+>',' ',s)).strip()
for pid,t,q,pos in picks[:28]:
    url=f"https://play.google.com/store/apps/details?id={pid}&hl=en&gl=US"
    try:
        p=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":UA}),timeout=30).read().decode("utf-8","replace")
    except Exception as e:
        comp[pid]={"title":t,"error":str(e)[:80]}; continue
    title=clean((re.findall(r'<title[^>]*>(.*?)</title>',p,re.S) or [""])[0]).replace(" - Apps on Google Play","")
    short=(re.findall(r'<meta name="description" property="og:description" content="([^"]*)"',p) or [""])[0]
    installs=(re.findall(r'>([\d,.]+\+?)</div><div class="g1rdde">Downloads',p) or [""])[0]
    rating=(re.findall(r'<div class="TT9eCd" aria-label="[^"]*">([\d.]+)',p) or re.findall(r'([\d.]) star',p) or [""])[0]
    reviews=(re.findall(r'>([\d.,]+[KM]?)\s*reviews<',p) or re.findall(r'([\d.,]+[KM]?) reviews',p) or [""])[0]
    m=re.search(r'data-g-id="description"[^>]*>(.*?)</div>',p,re.S)
    desc=clean(re.sub(r'<br\s*/?>','\n',m.group(1))) if m else ""
    dev=(re.findall(r'/store/apps/dev(?:eloper)?\?id=[^"]*"[^>]*>(.*?)</a>',p,re.S) or [""])[0]
    comp[pid]={"title":title,"short":html.unescape(short),"installs":installs,"rating":rating,"reviews":reviews,"dev":clean(dev),"desc_head":desc[:400],"found_for":q,"pos":pos,"camera_ai":bool(re.search(r'camera|AI|pose|computer vision|motion',desc,re.I))}
    time.sleep(1.2)
json.dump({"search":res,"competitors":comp},open(OUT,"w"),indent=1)
print("\n===== Competitor Play listings (US) =====")
for pid,v in comp.items():
    if "error" in v: print(f"\n## {pid}: ERROR {v['error']}"); continue
    print(f"\n## {v['title']}  [{pid}]  found for '{v['found_for']}' #{v['pos']}\n   dev={v['dev']} installs={v['installs']} rating={v['rating']} reviews={v['reviews']} camera/AI mention={v['camera_ai']}\n   SHORT({len(v['short'])}): {v['short']}\n   DESC: {v['desc_head'][:300].replace(chr(10),' ')}")
