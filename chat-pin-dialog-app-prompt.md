# Prompt (iOS + Android): Chat PIN becomes a small dialog. UI/UX change only

The chat PIN prompt (the E2EE chat-key backup PIN) is a tall bottom sheet with our own 3×4 keypad. Replace it with a **small dialog in the centre of the screen**. The PIN is typed on **the phone's own number keyboard**, and the dialog sits centred just above that keyboard.

Do this on **iOS (SwiftUI)** and **Android (Jetpack Compose)**. The two apps should look and behave the same.

## The one rule: change the UI, not what it does

Everything below the view stays exactly as it is:

- **View models.** iOS `ChatKeyGuardViewModel` and Android `ChatKeyGuardViewModel` keep:
  - their modes (restore / setup / update / reset);
  - `submit()`, `startForgotReset()` / `forgotReset()`, `skip()` / `dismiss()`, `dontShowAgain()`, `markDismissed()`;
  - the send-time restore (`requestRestoreToSend` / `requireKeyForSending`);
  - the loading and `checkFailed` handling;
  - the "restore first" switch;
  - `lastBackupAnswer`.
- **PIN rules.** Digits only, 4–8 digits, and the same sanitising on every change.
- **What is called when.** The same repository and backup calls happen, in the same order.
- **Every message the view model produces stays word for word:**
  - "Wrong PIN. Try again."
  - "PINs don't match."
  - "Use at least 4 digits."
  - "Couldn't save. Check your connection."
  - "Couldn't reset. Check your connection."
  - "Couldn't check your chat PIN. Check your connection."
  - "Enter your existing chat PIN first."
  - "Enter your chat PIN to send to {names}."
- **Every way of closing still goes through the same code, exactly once.** This includes:
  - ✕;
  - Not now;
  - tapping the scrim;
  - Android back;
  - Don't show again;
  - success.
  - **iOS:** the sheet's `onDismiss` ran `markDismissed()` on every close. That includes the programmatic closes after success and after Don't show again. The new presentation must do the same: whenever `isPresented` goes from true to false, call `markDismissed()` once.
  - **Android:** an outside tap or back still calls `viewModel.dismiss()`, as `onDismissRequest` does today. The buttons still animate out first and then call the view model (keep today's `closeThen` idea), so a quick reopen never races a half-closed dialog.
- **On success the dialog just closes, as today.** Don't add a success dialog. The prototype has one, but it is **out of scope**.
- **Error behaviour stays the same:**
  - shake, then red;
  - a wrong PIN or a mismatch clears the entry after the 420 ms shake;
  - a connection error keeps the digits;
  - the error stays on screen until the next key press.
- **Tests:**
  - All behaviour tests must pass unchanged: `ChatKeyGuard*`, `ChatPinShare*`, `ShareSend*`, `ShareToChat*`, `ChatShareNeverAsksPin*`, `ChatLockedHistory*`, and so on.
  - Only update tests that check the removed keypad or sheet, or the copy that changes below.

## Design reference

- **Prototype:** `/Users/avinayaacharya/Development/Buzzend Design/docs/screens/home/chat-pin.html`. Open it in a browser. The **Case** switch at the top, or `?s=set|update|enter|wrong|mismatch|done`, jumps to each case.
- **Tokens** come from the app theme (surface, surfaceAlt, primary, onPrimary, success, danger, text*, border; radius lg/md/btn). Never hard-code colours. It must work in all palettes and in light and dark mode.
- **Where this prompt and the prototype differ, this prompt wins.** The differences are listed at the end.

## Where it lives today (find the rest yourself)

- **iOS:**
  - `Features/Chat/Presentation/ChatPinPad.swift`: `ChatPinCopy`, `PinDots`, `PinKeypad`.
  - `Features/Chat/Presentation/ChatKeyGuard.swift`: `ChatKeyGuardView`.
  - It is presented with `.sheet(isPresented:onDismiss:)` in `ChatListView.swift` and `ChatDetailView.swift`.
  - Reuse the shared dialog parts in `Core/DesignSystem/Components/BZDialog.swift`: `BZDialogBackdrop`, `BZDialogCard`, `BZDialogTitle`, `BZDialogCloseButton`, and so on.
- **Android:**
  - `feature/chat/ui/ChatKeyGuard.kt`: `ChatKeyGuardSheet` (a `ModalBottomSheet`), `chatPinCopy`, `PinDots`, `PinKeypad`.
  - Reuse `core/designsystem/component/BuzzendDialog.kt` (`BuzzendDialogCloseButton`, `BuzzendDialogIconTile`) and `DialogScrim.kt` (`BuzzendDialogScrim`). Every other Buzzend dialog uses our own scrim, not the platform dim, and so should this one.

## Layout (sizes in pt / dp)

**Presentation**
- A full-screen dimmed scrim (the existing dialog scrim) covers everything, including the tab bar and navigation bar.
- On top of it is one card, centred in the space **between the top safe area and the top of the keyboard**. It moves smoothly when the keyboard appears or changes height.
- The card scales and fades in like the other Buzzend dialogs. Remove the drag handle, the detents and the sheet height memory.

**Card**
- Max width **312**, full width minus 24 margins on small phones.
- Surface background, radius **lg**, padding **20 top / 20 sides / 16 bottom**, standard dialog shadow, content centred.
- **✕** top-right: a 28 circle in surfaceAlt with a 14 icon in textTertiary, 10 from the top and right edges. Accessibility label "Close".

**Top to bottom:**

1. **Icon tile:** 44 × 44, corner radius 13, primary at 14% opacity behind a primary **lock** icon (21). 2 above, 10 below.
2. **Title:** 18, weight black (900), textPrimary, centred, one line.
3. **Subtitle:**
   - 13, semibold, textSecondary, line height about 1.45, max width 252, 5 above, centred, wraps.
   - In the check-failed state it is **danger** coloured.
4. **PIN field:** one tappable box, 16 above and 6 below, full card width, **50 tall**, radius **md**.
   - **Normal:** 1.5 border in primary, plus a 4 outer focus ring in primary at 12%.
   - **Error:** the border and ring turn danger (ring at 12%), filled dots turn danger, and the box **shakes** once (0.38 s, as today).
   - **Disabled** (loading or check failed): border colour, no ring, no caret.
   - **Dots:**
     - 11 across, 11 apart, centred;
     - an empty dot is a 2-pt ring in the border colour, a filled dot is solid textPrimary;
     - **keep today's dot count rule** (`clamp(length, 4, 8)`).
   - **Caret:** 2 × 20, primary, blinking (1 s), placed after the last filled dot or at the start when empty. It is hidden on error, at 8 digits and when disabled.
   - **Tap target:** a tap anywhere on the box focuses it.
5. **Hint line:** min height 16, 11.5 bold, textTertiary, centred.
   - **Set / Update:** "4–8 digits". It turns **success** coloured with a leading "✓ " once 4 or more digits are entered.
   - **Restore:** empty, but the height is kept.
   - **Error:** the error text in **danger**, weight 800, replacing the hint.
   - **Loading:** a small spinner here, with no text.
6. **Buttons:** one row, 14 above, two **equal-width** buttons, 46 tall, 10 apart, radius **btn**, text 14.5 extra-bold.
   - **Left (ghost):** surfaceAlt background, textSecondary text.
   - **Right (primary):** primary background, onPrimary text, button shadow.
   - **Disabled primary:** 45% opacity, no shadow. **Busy:** a spinner in place of the label, same size.
   - **No icons in either button.** Drop today's lock, chevron and check glyphs; the lock tile already says what this is.
7. **Links** (centred text buttons with a comfortable touch area, not cramped):
   - **"Forgot PIN?"** (restore only): 13 extra-bold, primary, 10 above. It calls the existing forgot-reset.
   - **"Don't show again"** (auto-prompt only, never when opened by hand from ⋮ → Chat PIN): 12.5 semibold, textTertiary, under "Forgot PIN?" (or directly under the buttons when there is no "Forgot PIN?"). It calls the existing `dontShowAgain()`.

**Small phones / large text:** the card must never be cut off.
- If the card plus the keyboard don't fit (iPhone SE, the largest Dynamic Type / font scale), the card's content scrolls inside the card.
- The PIN field and the button row stay reachable.

## Keyboard (replaces the custom keypad)

- **Delete `PinKeypad`** (both apps) and its key style. The digits come from the system **number pad**.
- **A hidden real text field** sits over the PIN box and is bound to the current entry (`pin` on step 1 or restore, `confirmPin` / `confirm` on the confirm step). It goes through the existing sanitise (digits only, at most 8). Pasting is fine; sanitise handles it.
  - **iOS:** an invisible `TextField` that is still in the hierarchy and focusable.
    - `.keyboardType(.numberPad)`, no `textContentType` (no password or SMS-code autofill bar), autocorrection off.
    - `@FocusState` focuses it when the dialog opens and on every step change.
    - The number pad has no return key; the primary button submits.
  - **Android:** a `BasicTextField` with `KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done, autoCorrectEnabled = false)`.
    - `onDone` runs the primary action only when it is enabled.
    - A `FocusRequester` requests focus on open and on step change.
    - The `decorationBox` draws the box, dots and caret.
    - Host it in a `Dialog(DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false))` with `imePadding()`, so the card centres above the IME.
    - Remove today's `keyboard?.hide()` on open; focusing the PIN field swaps a composer keyboard to the number pad by itself.
- **Keep the keyboard up across steps, errors and busy.**
  - Don't disable the field while **busy**: on iOS that drops focus, the keyboard closes and the card jumps. Ignore edits while busy instead.
  - Only **loading** and **check failed** disable the field, and the keyboard stays down then. When the backup answer arrives (not check failed), focus the field.
- **Accessibility:** the field reads "Chat PIN, N of M digits entered" and **never** the digits.

## Copy (titles, subtitles and buttons change; the view model's messages don't)

| State | Title | Subtitle | Left button | Right button | Below |
|---|---|---|---|---|---|
| Set, step 1 | Set a chat PIN | Use it to restore your chats when you switch or reinstall. | Not now | Next | — |
| Set, step 2 | Confirm your PIN | Enter the same PIN again. | Back | Set PIN | — |
| Update, step 1 (⋮ → Chat PIN, a PIN exists) | Update chat PIN | Choose a new PIN. It replaces your current one. | Not now | Next | — |
| Update, step 2 | Confirm new PIN | Enter the same PIN again. | Back | Update | — |
| Restore | Enter chat PIN | Enter your PIN to restore your messages on this device. | Not now | Unlock | Forgot PIN? |
| Restore before a send | Enter chat PIN | Enter your chat PIN to send to {names}. *(existing)* | Not now | Unlock | Forgot PIN? |
| After "Forgot PIN?" (reset) | Set copy, step 1 then step 2, exactly as today's variant picks it | | | | |
| Loading (backup check running) | *(blank: hold one line, no placeholder heading, as today)* | Checking your chat PIN… | Not now | today's label, disabled | spinner in the hint line; field disabled |
| Check failed | *(blank, held)* | Couldn't check your chat PIN. Check your connection. *(danger)* | Not now | disabled | field disabled |
| Auto-prompt (any of the above) | | | | | **+ Don't show again** |

- **Back** (step 2 only) is local UI. It returns to step 1 with both entries cleared and calls nothing in the view model. On step 2 the dialog closes only with ✕.
- **"Restore first"** (setting a PIN found a backup this device hasn't restored): the view model already switches to restore with "Enter your existing chat PIN first." The dialog simply shows the Restore copy with that message in red.

## Remove (sheet-only code)

- **Both apps:** the bottom sheet, the drag indicator and the custom keypad.
- **iOS:** the detents, the sheet height measuring and the sheet height memory (`sheetHeights`). Keep `lastBackupAnswer`.
- **Android:**
  - the `ModalBottomSheet`, `sheetState` and the "re-settle the sheet" fix;
  - the invisible "Forgot PIN?" height reservation during loading. A centred card may grow when the answer lands; animate that size change (about 0.2 s) instead.

## Differences from the prototype (this prompt wins)

1. The left button says **"Not now"** (the prototype says "Cancel"). It keeps today's meaning: when the auto-prompt is dismissed, it comes back next launch.
2. **"Don't show again"** is kept on the auto-prompt. The prototype doesn't draw it.
3. **Loading, Check failed, Restore before a send and Restore first** are app states the prototype doesn't draw. Style them as described above.
4. **No success dialog.** Success closes the dialog, as today.
5. The **error messages** stay the app's exact strings, for example "PINs don't match." (the prototype adds "Try again.").
6. **The dot count stays as today:** `clamp(length, 4, 8)`.

## Done when

- [ ] Both apps show the small centred dialog above the number pad in every state in the table, in light and dark mode and in every palette.
- [ ] No custom keypad and no bottom sheet are left.
- [ ] Every close path runs today's close logic exactly once:
  - **iOS:** `markDismissed()`, including after success and Don't show again.
  - **Android:** `dismiss()` / `dontShowAgain()`.
- [ ] Set, update, restore, forgot → reset, send-time restore, restore-first, wrong PIN, mismatch, connection error, loading and check failed all behave exactly as before.
- [ ] Nothing is cut off on iPhone SE / small Android phones with the largest text size.
- [ ] Rotating on Android keeps the step and the entry, as today.
- [ ] Behaviour tests pass unchanged. Only copy and keypad tests are updated.
