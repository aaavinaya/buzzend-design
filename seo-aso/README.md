# Buzzend SEO + ASO audit — working folder

Started 2026-10-15. Research-backed audit and strategy for Google Search, Apple App Store and Google Play. Nothing in this folder has been published or applied to any live listing; every change needs explicit approval.

> Location: `Buzzend Design/seo-aso/` (moved here from the buzzend-content repo on 2026-10-15 at your request). Note that this repo also publishes GitHub Pages (`docs/` prototype); keep this folder out of any Pages deployment.

## Start here

`03-plan/00-USER-GROWTH-ACTION-PLAN.md` — what to do to raise user flow, in order, with the decisions you made on 2026-10-15. The other files are the evidence and the detailed packages behind it.

## Stage map (per the master prompt)

| Stage | Status | Files |
|---|---|---|
| 1 Discovery | done 2026-10-15 | `01-discovery/` |
| 2 Research | done for public sources; volume columns await your exports | `02-research/`, `data/` |
| 3 Audit | done | `01-discovery/01…07` |
| 4 Strategy | done (decisions recorded in the action plan) | `03-plan/00` |
| 5 Content production | done: store metadata, website metadata and outlines, disclosures, runbook | `03-plan/01…05` |
| 6 Validation | programmatic counts and policy checks in `data/metadata-workbook.csv`; legal review of disclosures pending | `tools/build_metadata.py` |
| 7 Handover | roadmap, checklist, measurement plan, reusable scripts | `03-plan/06…08`, `tools/` |

## How the files map to the ten required deliverables

| Deliverable | Where |
|---|---|
| 1 Executive summary | `03-plan/00-USER-GROWTH-ACTION-PLAN.md` (short version + decisions) and `01-discovery/00-discovery-summary-and-questions.md` |
| 2 Repository + existing listing audit | `01-discovery/01…07` |
| 3 Competitor research report | `02-research/competitors-web-2026-10-15.md`, `competitors-store-data-2026-10-15.md` |
| 4 Master keyword spreadsheet | `data/master-keyword-evidence.csv` + `02-research/keyword-evidence-notes-2026-10-15.md` |
| 5 Google SEO implementation package | `03-plan/04-website-seo-package.md` + `01-website-deploy-runbook.md` |
| 6 Apple ASO package | `03-plan/02-apple-app-store-metadata.md` |
| 7 Google Play ASO package | `03-plan/03-google-play-metadata.md` |
| 8 Roadmap | `03-plan/07-roadmap.md` |
| 9 Copy-paste metadata workbook | `data/metadata-workbook.csv` |
| 10 Publication checklist | `03-plan/08-publication-checklist.md` |

## Evidence conventions
- Every number carries its source and observation date. "not observable" means the field exists only inside App Store Connect / Play Console / Search Console and must be exported by the account owner.
- No keyword search volumes are invented. Demand proxies used so far: Apple App Store autocomplete rank, Google autocomplete presence/rank, Google Play search result sets. Volume columns stay empty until Keyword Planner / Search Console / an ASO tool export is supplied.
- Product claims are tagged IMPLEMENTED-PROD / STAGE-FLAG / PLANNED from source code, not from marketing documents.
