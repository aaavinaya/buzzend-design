# Copy: Private challenges up to 10 members

**The rule**
- **Public:** no member limit.
- **Private:** up to 10 members, the admin included.
- **More than 10:** the admin contacts Buzzend support; once support raises it, the challenge has no limit.

**Who sees it:** **only the challenge's admin** ever sees the limit, the "x / 10" counter or a support link. Everyone else sees a normal private challenge.

**Prototype pages**
- `docs/screens/home/create-challenge.html`, with these links:
  - `?step=2&private=1`
  - `?step=2&private=1&unlimited=1`
  - `?step=2&edit=1&members=14`
- `docs/screens/home/challenge-detail.html`, in the switcher group "Private · up to 10" and under Pop-ups.
- `docs/screens/home/support.html`, the pre-filled form.

**Wording rules**
- Always "up to 10 members, **including you**".
- Say "Contact Buzzend support", never "upgrade" or "buy". Nothing is paid.
- `{…}` marks a value the app fills in.

---

## 1. Create challenge: visibility step (admin)

| Where | Copy |
|---|---|
| Private card subtitle | Invite only · up to 10 members |
| Hint under the cards (Private selected) | Up to 10 members, including you. Need more? **Contact Buzzend support** (text link) |
| Hint when support already raised the limit | No member limit (no link; card subtitle back to "Invite only") |
| Public card | Unchanged: Anyone can join |

**Public → Private refused** (editing before the start, more than 10 members):

| Part | Copy |
|---|---|
| Title | Too many members for private |
| Message | A private challenge can have up to 10 members. This one has {14}. Keep it public, or contact support for more. |
| Buttons | **Contact Support** / Keep public |

## 2. Challenge detail: admin view

| State | Copy |
|---|---|
| Member count (Members cell + Members tab) | {7} / 10 members |
| Almost full (8–9) | {2} places left · Need more? **Contact support** |
| Full banner, title | Your private challenge is full |
| Full banner, text | {10} of 10 members. New people can still request to join, but you can't approve them until a place frees up. |
| Full banner, button | Contact support for more members |
| No limit | {23} members (no counter, no banner, no link) |

## 3. Join requests and invites: admin view

| Where | Copy |
|---|---|
| Request list header while full | Full · {3} waiting |
| Approve while full: dialog title | This challenge is full |
| Approve while full: dialog message | Remove a member or contact support to add more. |
| Approve while full: buttons | **Contact Support** / Not now. The request stays pending. |
| "Approve all" when only some fit (toast) | Approved {2}. The challenge is now full, so {3} requests are still waiting. |
| Invite / share sheet while full | Your challenge is full. New people can request to join, but can't get in until a place frees up. |

## 4. Everyone who isn't the admin

| Where | Copy |
|---|---|
| Member count | {10} members (no "/ 10", no banner, no support link) |
| Joining by invite link or code while full: title | This challenge is full |
| Joining by invite link or code while full: message | Ask the challenge admin to make room. |
| Joining by invite link or code while full: button | OK |
| Requesting to join while full | As usual: "Request sent", then "Requested — waiting for approval". Nothing about the limit. |

## 5. Support flow (every "Contact support" button)

Every "Contact support" button opens the existing Help & Support form, already filled in:

| Field | Value |
|---|---|
| Category | Private challenge |
| Subject | More members for my private challenge |
| Message (from a challenge) | Hi Buzzend, I'd like more than 10 members in my private challenge “{challenge name}”. Number of members I need: |
| Message (from the create flow) | Hi Buzzend, I'd like more than 10 members in my private challenge. Number of members I need: |
| After sending (toast) | Sent. Buzzend support will reply in your chat. |

After sending, the app opens the support chat thread, as today.
