# Prompt (iOS + Android): Winner card update, plus the Trophy case

Both apps already draw the automatic challenge-win post (`CommunityWinCard`) and the "Share your win" image. They were built from the first version of the design. That design has changed in four ways:

1. The card's header is now the **challenge**, not the winner.
2. The winner reads **"You"** on their own card.
3. **Bronze** is a darker copper with light text.
4. The **Trophy case** tiles show a gold, silver or bronze **trophy** instead of a 1 / 2 / 3 number.

Make these changes on **iOS (SwiftUI)** and **Android (Compose)**, so the two apps look and behave the same. Find the files yourself.

## Design reference

- **Prototype:** `/Users/avinayaacharya/Development/Buzzend Design/docs/screens/home/winner-card.html`. Open it in a browser.
  - **Tabs:**
    - **In the feed**
    - **Winner card · 8 samples** (each sample in light and dark)
    - **"You won!" sheet**
    - **Share your win**
    - **Trophy case**
    - **Build spec** (all sizes and colours)
  - **Viewing as → The winner** shows the "You" version of the card.
  - **Deep links:** `?tab=samples`, `?tab=trophy`, `?tab=spec`.
- **Code:** `docs/js/screens/winner-card.js` and `docs/css/screens/winner-card.css` hold the exact values when the spec tab isn't enough.
- **Feature spec** (unchanged by this update): `ios/Buzzend/docs/CHALLENGE_WINNER_RECOGNITION.md`, sections 3.2–3.7.

## Rules

- **UI only.** No API or backend change, and no new fields: everything below comes from data the post already carries.
  - **The challenge** comes from `winSummary` (title, cover, workout, mode, access level).
  - **The winner** is the post's author.
  - **"Is this my card?"** is simply `post.author.id == current user id`.
- **What does not change:**
  - **Behaviour:**
    - likes;
    - the shared action bar (♡ + count, ↗, "who loved" circle, no view count);
    - the ··· menu rules: the winner sees Change audience / Delete (Delete only on a private challenge), and everyone else sees Report post;
    - Share opens the "Share your win" image.
  - **Panel content:** confetti, ribbon, crown (1st only, not draws), trophy badge, stats, prize, chips (Multi workouts, Full Body, Elimination, Tied).
- Both apps must match the prototype in light and dark mode at 375 and 430 pt widths.

---

## 1. Feed card header: the challenge, not the winner

The post is made automatically. With the winner's name and photo as the author, the winner saw "their" post and thought they had posted something they never posted. The header now presents the post as coming from the **challenge**.

**Before:** `[winner avatar] Asha Rai / 2h ◍ · won a challenge   ···`
**After:** `[challenge cover] 30-Day Squat Sprint / 2h ◍ · Challenge results   ···`

| Part | Spec |
|---|---|
| Layout | Same as today: 18 left padding, gap 10, ··· (17 icon in a 44 target) on the right. |
| Cover | **38 × 38 rounded square, radius 10**. Not a circle, so it never reads as a person. It shows the challenge cover photo. With no cover: the workout's artwork (30) on surface-alt for a single-workout challenge, or a trophy icon (18, primary) on surface-alt for Multi / Full Body. |
| Line 1 | The **challenge title**: 13.5 / 800, textPrimary, 1 line, truncates at the end. |
| Line 2 | 11.5 / 700, textTertiary: `2h` + audience glyph (11) + ` · Challenge results`. Truncates at the end. |
| Line 2, private challenge | `2h` + lock glyph (11) + ` Challenge members`. No "Challenge results"; no emoji, the lock is the icon. |
| Random draw | Line 2 is the same `· Challenge results`. The draw shows on the ribbon (`DRAWN WINNER`), as today. |
| Taps | The header, like the rest of the card, opens the **challenge**. ··· opens the menu. The header no longer opens a profile. |

- **Remove the "View challenge ›" row** below the panel. The header does that job now. The action bar sits **10 below the panel**, as on the media card.
- Drop the old header subtitle strings (`won a challenge`, `was drawn as a winner`) wherever they were only used by the header.

## 2. Panel: "You" on the winner's own card

The panel's text under the 72 avatar changes only for the winner viewing their own card:

| Viewer | Name line (18 / 900) | Title line (13.5 / 700, title in 900) |
|---|---|---|
| Everyone else | `Asha Rai` | `won “30-Day Squat Sprint”` |
| Everyone else, random draw | `Liam O'Neill` | `drawn in “Jumping Jack January”` |
| **The winner** | **`You`** | `won “30-Day Squat Sprint”` |
| **The winner, random draw** | **`You`** | `were drawn in “Jumping Jack January”` |

- **Taps:** tapping the **winner's photo or name in the panel** opens the winner's profile. It used to be the header that did this. The winner's own card opens their own profile.
- **Accessibility:** update the card's summary so the challenge is read first. Examples: "30-Day Squat Sprint, challenge results. Asha Rai won 1st place…" and, for the winner, "…You won 1st place…".
- **The "Share your win" image keeps the winner's real name.** It's an image sent to other people, so "You" would be wrong there.

## 3. Bronze: a darker copper that can't be mistaken for gold

The old bronze, `#E6A769 → #C17E40`, sat right next to gold's darker stop and read as gold in the feed. Bronze is now a **dark copper**.
- Dark text can't pass 4.5:1 on a bronze this dark, so **bronze switches to light text**.
- It also gets a **cream ribbon** and **dark-glass strips**.
- Gold and silver keep their values. They just move onto the same set of tokens.

Give the tier style these tokens. Some are new; today's style only has top, bottom, ink, ribbonText and ring.

| Token | Gold (1st, draw) | Silver (2nd) | **Bronze (3rd), new** |
|---|---|---|---|
| Gradient top → bottom (160°) | `#F6C651 → #DD992A` | `#E3E8EE → #AEB7C1` | **`#9E6038 → #5E3216`** |
| Ink: all text on the panel | `#4A3300` | `#2B323B` | **`#FFF1E2`** (cream) |
| Ribbon fill | `#4A3300` | `#2B323B` | **`#FFE2C6`** |
| Ribbon text | `#FFE7A6` | `#EEF1F5` | **`#4A2208`** |
| Trophy badge on the avatar | ribbon fill + ribbon-text icon | same | same, so a cream disc with a dark-brown trophy |
| Avatar ring (outside the 3 white gap) | `#B7791A` | `#77808C` | **`#E6A769`** |
| Glass: stats strip and prize row | white 42% | white 42% | **black 20%** |
| Chips (Tied, workouts, Full Body, Elimination) | white 55% | white 55% | **black 20%** |
| Light bloom behind the avatar (radial, 220 wide, 30 from the top) | white 55%, 150 tall | white 55%, 150 tall | **`#FFD6AA` at 20%, 110 tall** (shorter, so it stays off the name) |
| Initials avatar (no photo) | ink on white 75% | ink on white 75% | **`#4A2208` on `#FFE2C6`** |
| Confetti | white dots and bars + ink dots at 14–16% | same | same tokens. The "ink" dots become cream. |

**Where bronze changes:** every place the tier colours are drawn.
- the feed card panel;
- the **"Share your win" image** (header gradient, ribbon, trophy disc, avatar ring);
- the **"You won!" sheet**'s trophy disc, when that sheet is built;
- the **Trophy case**, below.

The panel keeps the same colours in dark mode.

## 4. Trophy case tiles: a trophy in the metal, not a number

**Placement:**
- **Profile only**, between the stats and the tabs (as in the spec).
- Newest first, scrolling sideways, loading more at the end with a spinner tile.
- Hidden at 0 wins, on blocked profiles and on the brand page.
- Tapping a tile opens the challenge.
- If it isn't built yet, build it to this design. If it exists, restyle it.

**Title row:**
- trophy icon 17 in `#DD992A`;
- `Trophy case` 15 / 900;
- the **count in a small grey pill**: 11.5 / 800, textSecondary on surface-alt, padding 2 / 8, fully rounded. This replaces "· 3".

**Tile:**
- **Box:** 104 wide; surface; 1px border; radius 16; card shadow; padding 12 / 9 / 11; **content centred**; 10 between tiles; 16 edge padding.
- **From top to bottom:**
  1. **Trophy medallion:** a **60 circle** filled with a radial tint of the metal (lighter in the middle), with a **filled trophy (46) on top** and a soft drop shadow (0, 2, blur 2, black 18%).
     - **Tints:** gold `#FCEBC2`, silver `#E4E8EE`, bronze `#F4DCC8`.
     - **Dark mode:** use the tint at about 22% → 12% over the surface.
     - **A random draw uses the gold trophy.**
  2. **Title:** 12.5 / 800, textPrimary, 2 lines max. Always reserve 2 lines' height so the tiles line up.
  3. **Place, in words:** 11 / 900, **5 below the title**, in the metal's dark tone.

     | Place | Text | Light mode | Dark mode |
     |---|---|---|---|
     | 1st | `1st place` | `#8A5A0C` | `#F3C766` |
     | 2nd | `2nd place` | `#5B6470` | `#C9D0D8` |
     | 3rd | `3rd place` | `#8A4B22` | `#E6A769` |
     | Random draw | `Drawn winner` | gold tone | gold tone |

  4. **Month:** `Nov 2026`, 11 / 700, textTertiary.
- **No 1 / 2 / 3 discs and no separate "Draw" pill.**

**The trophy:**
- It's drawn from simple shapes, so it can be a vector asset (PDF / SVG on iOS, VectorDrawable on Android) or drawn in code. It sits on a **48 × 48 viewBox** and is scaled to 46.
- **Each metal has its own gradient**, top-left → bottom-right, with three stops at 0, 50% and 100%. The fourth colour is the "deep" tone used for the star and the plate.

| Metal | Light | Mid | Dark (also the handles) | Deep |
|---|---|---|---|---|
| Gold | `#FFE594` | `#F3BC3A` | `#C98912` | `#7A4E06` |
| Silver | `#FBFCFD` | `#CDD4DC` | `#929CA8` | `#4E5661` |
| Bronze | `#F0B98F` | `#B97340` | `#7A421D` | `#4A2208` |

**Shapes** (path data in the 48 viewBox):
```
handles  stroke "dark" 3.4, round caps, no fill:
         M13.5 12 H9.5 a4.6 4.6 0 0 0 0 9.2 h4.5   M34.5 12 h4 a4.6 4.6 0 0 1 0 9.2 H34
cup      fill gradient:   M12.5 7 h23 v11.5 a11.5 11.5 0 0 1 -23 0 z
shine    stroke white 60%, 2.2, round caps, no fill:   M17 11 v7.2 a7 7 0 0 0 3.2 5.9
star     fill "deep" 38%: polygon 24,12.6 25.18,15.58 28.37,15.78 25.9,17.82 26.7,20.92 24,19.2 21.3,20.92 22.1,17.82 19.63,15.78 22.82,15.58
stem     fill gradient:   M21.2 29.6 h5.6 l1.1 5.2 h-7.8 z
base     fill gradient:   rect x14.5 y34.6 w19 h6.6 radius 2
plate    fill "deep" 35%: rect x19.5 y36.8 w9 h2.2 radius 1.1
```

## 5. Copy (exact strings)

| Where | Text |
|---|---|
| Header line 2 | `2h ◍ · Challenge results` (◍ = the post's audience glyph) |
| Header line 2, private challenge | `2h 🔒 Challenge members` (lock icon, not an emoji) |
| Panel name, winner's own card | `You` |
| Panel title line, winner, random draw | `were drawn in “…”` |
| Trophy case places | `1st place` · `2nd place` · `3rd place` · `Drawn winner` |

## Done when

- [ ] No Winner card shows the winner as its author: the header is the challenge cover, title and `Challenge results`.
- [ ] The "View challenge" row is gone. The header and the card body open the challenge, and the panel's photo and name open the profile.
- [ ] The winner sees `You` on their own card. Everyone else sees the name. The share image always shows the name.
- [ ] Bronze is the new dark copper with cream text in the feed card and the share image, and gold and silver are unchanged. All panel text is at least 4.5:1, and bronze is never mistaken for gold side by side.
- [ ] Trophy case tiles show the gold, silver or bronze trophy with the place in words. There is no 1 / 2 / 3 disc, and the count sits in a grey pill.
- [ ] Light and dark match the prototype on both platforms.
- [ ] Nothing else in the post behaves differently.
- [ ] Existing tests pass. Update only the tests that pin the old header strings, the "View challenge" row or the old bronze values.
