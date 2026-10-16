# Research and build scripts (Python 3, standard library only)

Run from this folder with `python3 -I <script> …`. All sources are public endpoints; none needs credentials.

| Script | What it does | Output |
|---|---|---|
| `apple_keywords.py <out.json>` | Apple App Store autocomplete (US/GB/NP) + iTunes Search top-200 per candidate term (US, NP): Buzzend's rank, big-app counts, top 10 | JSON (≈25 min) |
| `google_suggest.py <out.json>` | Google autocomplete for seed terms in 6 countries + a–z expansions | JSON |
| `play_search.py <out.json> <rawdir>` then `play_results_parse.py <rawdir> <out.json>` | Google Play search result order per query/country, Buzzend position, top competitors' listings | JSON |
| `build_keyword_db.py <keywords dir> <out.csv>` | merges the three into the master evidence CSV | CSV |
| `keyword_notes.py <keywords dir> <out.md>` | the keyword evidence notes | Markdown |
| `variant_coverage.py <apple_keywords.json>` | scores name/subtitle/keyword variants by covered search terms | stdout |
| `build_metadata.py <seo-aso dir>` | regenerates the Apple and Play metadata packages and the CSV workbook from the source of truth in the script, with counts and policy checks | Markdown + CSV |
| `site_crawl.py <rawdir> <out.json> <urls.txt>` | fetches each URL, records status, title, description, canonical, H1, schema, analytics ids | JSON |

Re-run `apple_keywords.py`, `google_suggest.py` and the Play pair monthly and keep the dated outputs in `../data/`.
