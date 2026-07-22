---
feature: <feature-key>
title: <Human Feature Name>
version: 1
last_updated: <YYYY-MM-DD>
owners: [ios, android]
design_ref: docs/<screen>.html            # where the visuals live (design is truth for pixels)
---

# <Human Feature Name> — SPEC (canonical contract)

One-paragraph summary: what the feature does and where it lives in the app.

## Requirements

> Canonical ID registry. `Must-match`: `yes` = iOS & Android identical · `platform`
> = may differ idiomatically. Keep the first three columns exactly as below.

| ID | Requirement | Must-match |
|----|-------------|------------|
| FEAT-DATA-01 | <one-line requirement> | yes |
| FEAT-STATE-01 | <one-line requirement> | yes |
| FEAT-RULE-01 | <one-line requirement> | yes |
| FEAT-EDGE-01 | <one-line requirement> | yes |
| FEAT-COPY-01 | <exact string> | yes |
| FEAT-API-01 | <endpoint + method + status codes> | yes |
| FEAT-UI-01 | <behavioral UI rule> | platform |

## Details

Add a subsection per ID that needs more than one line — exact copy, numbers, the
API request/response, the precise rule. Skip IDs that are self-explanatory.

### FEAT-RULE-01
<exact rule, with the numbers/conditions>

### FEAT-API-01
`METHOD /v1/...` — request, success code, and what each error code means to the user.

## Out of scope / deferred
- <things intentionally NOT in this feature>

## Changelog
- v1 (<date>): initial spec.
