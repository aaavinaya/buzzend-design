import json, re, sys, os, urllib.request, urllib.error, http.client, ssl, time
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

OUT_RAW = sys.argv[1]; OUT_JSON = sys.argv[2]
UA_BROWSER = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
UA_GOOGLE = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"

class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title=None; self._in_title=False; self.metas=[]; self.links=[]; self.h=[]; self._h=None
        self.jsonld=[]; self._in_ld=False; self.lang=None; self.imgs=[]; self.scripts=[]; self.anchors=[]
        self._skip=0; self.text=[]; self.noscript=False
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang')
        if tag=='title': self._in_title=True
        if tag=='meta': self.metas.append(a)
        if tag=='link': self.links.append(a)
        if tag in ('h1','h2','h3'): self._h=(tag,[])
        if tag=='script':
            if a.get('type')=='application/ld+json': self._in_ld=True
            else:
                self.scripts.append(a.get('src','inline')); self._skip+=1
        if tag=='style': self._skip+=1
        if tag=='img': self.imgs.append(a)
        if tag=='a': self.anchors.append(a.get('href',''))
        if tag=='noscript': self.noscript=True
    def handle_endtag(self, tag):
        if tag=='title': self._in_title=False
        if tag in ('h1','h2','h3') and self._h: self.h.append((self._h[0],' '.join(''.join(self._h[1]).split()))); self._h=None
        if tag=='script':
            if self._in_ld: self._in_ld=False
            elif self._skip>0: self._skip-=1
        if tag=='style' and self._skip>0: self._skip-=1
    def handle_data(self, d):
        if self._in_title: self.title=(self.title or '')+d
        if self._in_ld: self.jsonld.append(d)
        if self._h: self._h[1].append(d)
        if self._skip==0 and not self._in_ld: self.text.append(d)

def fetch(url, ua):
    chain=[]; cur=url
    for _ in range(6):
        req=urllib.request.Request(cur, headers={"User-Agent":ua,"Accept":"text/html,*/*"})
        try:
            r=urllib.request.urlopen(req, timeout=25)
            body=r.read(); hdr={k.lower():v for k,v in r.headers.items()}
            return {"chain":chain,"final":r.geturl(),"status":r.status,"headers":hdr,"body":body}
        except urllib.error.HTTPError as e:
            loc=e.headers.get('Location')
            if e.code in (301,302,303,307,308) and loc:
                chain.append((cur,e.code,loc)); cur=urljoin(cur,loc); continue
            return {"chain":chain,"final":cur,"status":e.code,"headers":{k.lower():v for k,v in e.headers.items()},"body":e.read()}
        except Exception as ex:
            return {"chain":chain,"final":cur,"status":None,"error":str(ex),"headers":{},"body":b""}
    return {"chain":chain,"final":cur,"status":"too-many-redirects","headers":{},"body":b""}

def analyze(url, ua, tag):
    r=fetch(url, ua); body=r.get("body",b"")
    name=re.sub(r'[^A-Za-z0-9]+','_',url)[:80]+("_gbot" if ua==UA_GOOGLE else "")
    open(os.path.join(OUT_RAW,name+".html"),"wb").write(body)
    res={"url":url,"ua":tag,"status":r["status"],"final":r["final"],"redirects":r["chain"],
         "ctype":r["headers"].get("content-type"),"bytes":len(body),
         "server":r["headers"].get("server"),"cache":r["headers"].get("cache-control"),"hsts":r["headers"].get("strict-transport-security"),
         "xcache":r["headers"].get("x-cache"),"enc":r["headers"].get("content-encoding"),"error":r.get("error")}
    if body and (res["ctype"] or "").startswith("text/html"):
        p=P()
        try: p.feed(body.decode("utf-8","replace"))
        except Exception as e: res["parse_error"]=str(e)
        m=lambda **kw: [x.get('content') for x in p.metas if all(x.get(k)==v for k,v in kw.items())]
        res.update({
          "title":(p.title or '').strip(),"meta_desc":m(name="description"),"robots":m(name="robots"),
          "canonical":[l.get('href') for l in p.links if l.get('rel')=='canonical'],
          "hreflang":[(l.get('hreflang'),l.get('href')) for l in p.links if l.get('rel')=='alternate' and l.get('hreflang')],
          "og":{x.get('property'):x.get('content') for x in p.metas if (x.get('property') or '').startswith('og:')},
          "twitter":{x.get('name'):x.get('content') for x in p.metas if (x.get('name') or '').startswith('twitter:')},
          "viewport":m(name="viewport"),"gsv":m(name="google-site-verification"),"lang":p.lang,
          "h1":[t for k,t in p.h if k=='h1'],"h2":[t for k,t in p.h if k=='h2'][:12],"h3_count":len([1 for k,t in p.h if k=='h3']),
          "jsonld_types":[], "jsonld_raw":[s.strip()[:1500] for s in p.jsonld],
          "words":len(' '.join(p.text).split()),
          "imgs":len(p.imgs),"imgs_no_alt":len([i for i in p.imgs if not (i.get('alt') or '').strip()]),
          "store_links":sorted(set(a for a in p.anchors if 'apps.apple.com' in a or 'play.google.com' in a or '/dl' in a)),
          "social_links":sorted(set(a for a in p.anchors if any(s in a for s in ('instagram.com','facebook.com','tiktok.com','x.com','twitter.com','youtube.com','linkedin.com')))),
          "internal_links":len([a for a in p.anchors if a.startswith('/') or 'buzzend.com' in a]),
          "scripts":sorted(set(s for s in p.scripts if s!='inline'))[:15],
          "analytics_hits":sorted(set(re.findall(r'(googletagmanager\.com/gtag/js\?id=[A-Z0-9-]+|googletagmanager\.com/gtm\.js\?id=[A-Z0-9-]+|G-[A-Z0-9]{6,}|GTM-[A-Z0-9]+|UA-\d+-\d+|fbq\(|connect\.facebook\.net|clarity\.ms|hotjar)', body.decode('utf-8','replace'))))[:10],
          "noscript":p.noscript,
        })
        for s in p.jsonld:
            try:
                j=json.loads(s); j=j if isinstance(j,list) else [j]
                for o in j: res["jsonld_types"].append(o.get('@type'))
            except Exception: res["jsonld_types"].append("INVALID_JSON")
    return res

urls=[l.strip() for l in open(sys.argv[3]) if l.strip()]
out=[]
for u in urls:
    out.append(analyze(u, UA_BROWSER, "browser")); time.sleep(0.3)
# Googlebot comparison for a few key pages
for u in ["https://buzzend.com/","https://buzzend.com/challenges","https://buzzend.com/blogs/hiking"]:
    out.append(analyze(u, UA_GOOGLE, "googlebot")); time.sleep(0.3)
json.dump(out, open(OUT_JSON,"w"), indent=1, default=str)
for r in out:
    print(f"\n### {r['url']}  [{r['ua']}]")
    print(f"  status={r['status']} final={r['final']} redirects={r['redirects']} bytes={r['bytes']} ctype={r['ctype']}")
    print(f"  server={r['server']} cache={r['cache']} hsts={r['hsts']} xcache={r['xcache']} enc={r['enc']} err={r.get('error')}")
    if 'title' in r:
        print(f"  TITLE: {r['title']!r} ({len(r['title'])} chars)")
        print(f"  DESC: {r['meta_desc']} (len {[len(d or '') for d in r['meta_desc']]})")
        print(f"  ROBOTS: {r['robots']} CANON: {r['canonical']} LANG: {r['lang']} HREFLANG: {r['hreflang']} GSV: {r['gsv']}")
        print(f"  OG: {r['og']}")
        print(f"  TW: {r['twitter']}")
        print(f"  H1: {r['h1']}  H2s: {r['h2']}  h3s={r['h3_count']}")
        print(f"  JSONLD types: {r['jsonld_types']}")
        print(f"  words={r['words']} imgs={r['imgs']} no_alt={r['imgs_no_alt']} internal_links={r['internal_links']} noscript={r['noscript']}")
        print(f"  STORE: {r['store_links']}")
        print(f"  SOCIAL: {r['social_links']}")
        print(f"  SCRIPTS: {r['scripts']}")
        print(f"  ANALYTICS: {r['analytics_hits']}")
