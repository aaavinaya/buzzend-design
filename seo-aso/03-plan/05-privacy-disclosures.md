# Privacy disclosures to publish before the new listings (drafts, 2026-10-15)

Decision Q4: draft the disclosures with the marketing copy. These are drafts for your legal/product owner to approve; nothing is filed. They make the truthful on-device message usable: counting happens on the phone, video is uploaded only when the user posts, and movement data is collected to improve counting.

## What the code does today (04-product-truth-mobile.md §2, §8)

| Data | Leaves the device? | Linked to the user? | Disclosed today? |
|---|---|---|---|
| Camera frames / video during counting | No (processed on device by MediaPipe) | — | implied by permission strings |
| Workout clip + audio | Only when the user taps Post | Yes | partly (permission strings) |
| Pose-landmark trace (33 points per frame, every production set) | Yes, uploaded after each set to `/v1/rep-logs` | Yes (user id in the S3 key) | **No** |
| Analytics events with Firebase user id | Yes | Yes | **No** (privacy policy mentions Crashlytics only) |
| Step counts, rep counts, streaks | Yes | Yes | partly |
| Chat messages | Yes (Firestore; 1:1 encrypted) | Yes | partly |
| Contacts (find friends) | Yes, when the user allows | Yes | check |
| Name, email, phone, photo | Yes | Yes | yes |

## 1. Privacy policy — paragraph to add (plain English)

> **Movement data from the camera.** When you do a camera-counted workout, Buzzend analyses the camera picture on your phone to find the position of your body joints and count your reps. The camera picture itself is not uploaded. After each set, the app uploads a record of those joint positions (a list of points, not an image), the exercise, the count and basic device and app-version information. We use this record to check and improve how counting works and to investigate reported miscounts. It is stored with your account, kept for [retention period], and deleted when you delete your account. You can ask us to delete it earlier at hello@buzzend.com.
>
> **Workout videos.** During a set the app records a video on your phone. It stays on your phone unless you choose to post it or save a copy. Posted videos are uploaded and shown to the people you share them with.
>
> **Analytics.** We use Firebase Analytics and Crashlytics to understand how the app is used (for example that a workout was started or completed) and to fix crashes. These events are linked to your account identifier. We do not sell this data or use it for third-party advertising.

Also update: the Terms (if the "data covered by the terms" clause is relied on), the "Last updated" date, and the in-app camera explainer (keep "Uploads your video unless you post it" and add "sends joint-position data after a set to improve counting").

## 2. Google Play Data safety — answers to change (verified category names, Play Console Help 2026-10-15)

| Category → type | Collected | Shared | Required or optional | Purpose | Linked to user |
|---|---|---|---|---|---|
| Health and fitness → **Fitness info** (pose landmarks, reps, steps) | Yes | No | Required (counting uploads automatically) | App functionality, Analytics | Yes |
| Photos and videos → **Videos** (posted clips) | Yes | No | Optional (user-initiated post) | App functionality | Yes |
| Audio files → **Other audio files** (audio inside posted clips) | Yes | No | Optional | App functionality | Yes |
| Personal info → **Name, Email address, Phone number, User IDs** | Yes | No | Required for account | Account management | Yes |
| Messages → **Other in-app messages** | Yes | No | Optional | App functionality | Yes |
| App activity → **App interactions** (analytics events) | Yes | No | Required | Analytics | Yes |
| App info and performance → **Crash logs, Diagnostics** | Yes | No | Required | Analytics | Yes |
| Device or other IDs (Firebase installation id) | Yes | No | Required | Analytics | Yes |
| Contacts (only if the user uses find-friends) | Yes | No | Optional | App functionality | Yes |

Form-level answers: data encrypted in transit — yes (HTTPS everywhere; confirm the S3 presigned uploads and Firestore); deletion mechanism — yes, via in-app account deletion (the app has one) and the email contact. Advertising ID is not collected (manifest removes it); do not tick it.

## 3. Apple App Privacy labels — answers to check or change (definitions verified at developer.apple.com/app-store/app-privacy-details 2026-10-15)

| Apple data type | Status to declare | Linked to the user | Used for tracking |
|---|---|---|---|
| Health & Fitness → **Fitness** (pose landmarks, reps, steps via HealthKit) | Collected | Yes | No |
| User Content → **Photos or Videos**, **Audio Data** (posted clips) | Collected | Yes | No |
| User Content → **Other User Content** (posts, challenge text) | Collected | Yes | No |
| Identifiers → **User ID** | Collected | Yes | No |
| Usage Data → **Product Interaction** | Collected | Yes | No |
| Diagnostics → **Crash Data** | Collected | Yes or No per Crashlytics config | No |
| Contact Info → **Name, Email Address, Phone Number** | Collected | Yes | No |
| Contacts (if the user allows) | Collected | Yes | No |

Apple's optional-disclosure exemption does not apply to the pose trace: it is collected on an ongoing basis after the initial camera permission, so it must be declared. Labels can be updated in App Store Connect without a new build. Whether pose landmarks count as "Sensitive Info → biometric data" is a legal question: they are body-position coordinates, not an identity template, but have counsel confirm before choosing the category.

## 4. What marketing may say once this is live

- Allowed: "Counting happens on your phone." "Your video is never uploaded unless you post it." "No wearable, no manual counting."
- Not allowed: "Nothing leaves your phone", "we collect no data", "100 % private", any accuracy percentage, "verified reps".
- Optional product recommendation (not in scope unless you want it): a settings toggle for movement-data collection would make "you control what's shared" available as a message.
