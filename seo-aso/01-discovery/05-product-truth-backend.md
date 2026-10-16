> Produced 2026-10-15 by a read-only code audit of the Java backend (java-itg-gochall). Every claim cites file:line. Verified independently: live store versions 3.1.14 (burpees/high knees gate) and the absence of any web-serving code.

# Buzzend backend — product truth and web-facing surfaces

Source: `/Users/avinayaacharya/Development/Inventech Projects/Java/java-itg-gochall` (read-only audit, 15 Oct 2026, branch `main`, HEAD `d5faa1c` "Full Body routines"). All paths below are relative to that repo; `api/` = `src/main/java/com/itg/gochall/api/`.

Stack facts that frame everything: Spring Boot 3.5.6 on Java 25 (`build.gradle:2,13`), MySQL on RDS us-east-2, Firebase Admin 9.11 (auth + Firestore chat), AWS S3 us-east-2 + one CloudFront distribution for content, deployed to Elastic Beanstalk as `gochall-eb.zip` with an nginx override (`build_and_package.sh`, `.platform/nginx/conf.d/proxy.conf`). Every controller is a `@RestController` returning JSON; there is no template engine, no HTML view, no redirect handler. The code base still calls itself "Gochall" (`api/config/SwaggerConfig.java:17`) and the Firebase project defaults to `winjee-dev` (`application.properties:25`) — the product was renamed twice.

Hygiene flags noticed in passing (not reproduced here): `application.properties:6-8,24` ships a default DB password and a base64 Firebase service-account key as fallback values; `monitoring.properties:15-16` ships weak default Basic-auth credentials. `WebSecurityConfig.java:60` logs request headers (including `Authorization`) at DEBUG with a "Needs to set false later" comment.

---

## 1. Workout types — registry, active vs soft-deleted, camera vs steps

**The registry the code knows** (`api/enums/WorkoutType.java:13-21`; thresholds in `api/common/Constants.java:42-49`):

| Enum | DB/challenge code | Streak threshold / local day | Gate |
|---|---|---|---|
| STEPS | `WLS` | 3000 | none (every app) |
| PUSHUPS | `PUSHP` | 10 | none |
| SQUATS | `SQUAT` | 10 | none |
| SITUPS | `SITUP` | 10 | none |
| JUMPING_JACKS | `JJACK` | 20 | none |
| LUNGES | `LUNGE` | 10 | none |
| BURPEES | `BURPE` | 10 | `ClientFeature.BURPEES_HIGH_KNEES` |
| HIGH_KNEES | `HKNEE` | 20 | `ClientFeature.BURPEES_HIGH_KNEES` |

The catalog served to apps is the `workout` table (`api/entity/Workout.java`: name, description, code ≤5 chars, `deleted` bit, `assetName` SVG path, `displayOrder`, units) via `GET /v1/workouts` → `findAllByDeletedFalseOrderByDisplayOrderAsc` (`api/repository/WorkoutRepository.java:18`), then filtered per app version by `api/util/SupportedWorkouts.java`. Catalog seed SQL: JJACK (id 21), SITUP (22), LUNGE (23) added 2026-05-28 (`Readme.md:238-240`); BURPE/HKNEE added by `db-manual-migrations/2026-10-07__workout__burpees_high_knees.sql` with marketing descriptions ("Burpees are a full-body exercise…", "High knees are a cardio exercise…" — reusable web copy).

**Soft-deleted legacy types** (`Readme.md:24`): `YOG, RUN, CYC, SWM, SLP, SNG, MEDTN, HIK, WGTLS, COOK, NWSKL, WRUN` → `deleted = 1`. Their display names live only in the DB, not the repo; the codes read as yoga, running, cycling, swimming, sleep, singing(?), meditation, hiking, weight-loss, cooking, new-skill, walk/run. The display-order SQL (`Readme.md:252-273`) shows the table once held ids 1–23; only ids 11 and 15 were promoted to positions 2–3 (almost certainly PUSHP and SQUAT) and the rest pushed to the tail. Residue of the old world: `api/enums/ChallengeUnit.java` still offers `KM, MILE, SEC, MIN, HOUR, KG, LB, TIMES` alongside `STEPS`; `MemberServiceImpl` guards with a `SUPPORTED_WORKOUT_CODES` set and returns 404 "challenge type is not supported" for legacy codes (`api/service/MemberServiceImpl.java:131-132`).

**Camera/pose-counted vs steps vs manual.** The backend has one axis: `STEPS` vs "rep types". STEPS is the phone step counter (legacy `daily_steps` table migrated into `workout_stats` as `'STEPS'`, `Readme.md:139-149`; `DailyStepsController` is `@Deprecated`, `api/controller/DailyStepsController.java:4`); STEPS rows never carry a duration, are excluded from the daily activity card (`WorkoutStatsServiceImpl.java:168`) and are rejected inside routines (`docs/FULL_BODY_ROUTINES_API.md`, exercises table). All seven rep types are what the apps' AI rep counter produces — evidence: `POST /v1/rep-logs` uploads "the raw AI rep-counting JSON" per session to S3 (`api/controller/RepLogController.java:7-10`), `docs/WORKOUT_DURATION_API.md:17-18` defines active time "from the first detected rep", Beat-It attempts are "video + score" (`api/entity/CompetitionAttempt.java:1-4`). The backend does **not** distinguish camera reps from manual entry: `docs/WORKOUT_DURATION_API.md:23` says "Omit the field when there is no timer (manual entry)", so manual rep logging exists in the apps.

**Full Body routines** (new, 14 Oct 2026): server allow-list `total-body` "Total Body", `lower-power` "Lower Power", `cardio-blast` "Cardio Blast" (`api/routine/RoutineCatalog.java:13-16`), levels BEGINNER/INTERMEDIATE/EXPERT (`api/routine/RoutineLevel.java`), reps flow into the same per-type day totals.

**Verdict for the website:** hiking, running, cycling, swimming, meditation, yoga/pranayama, cooking, sleep are all retired product surfaces. The live product is: steps/walking, push-ups, squats, sit-ups, jumping jacks, lunges, burpees, high knees, three full-body routines, challenges (standard/elimination/Beat-It), streaks, leaderboards. Legacy blog topics only match the product if reframed around walking/steps challenges.

---

## 2. Public, unauthenticated surfaces and share links

**Auth boundary** (`api/filter/JwtFilter.java:36-37,89-98`): requests whose URI contains `/v1/public/`, `swagger-ui` or `v3/api-docs`, equals `/` or `/health`, or starts with `/actuator` skip the filter. Everything else needs `Authorization: Bearer <Firebase ID token>` (`JwtFilter.java:60-61`). `WebSecurityConfig.java:28-29` is `permitAll` (the filter does the gating); CORS allows every origin pattern with credentials (`WebSecurityConfig.java:44-46`).

**Unauthenticated endpoints (all JSON):**

| Endpoint | File | What leaks without auth |
|---|---|---|
| `POST /v1/public/challenge/filter-by?pageNumber=` | `api/controller/pub/PublicChallengeController.java:22-26` | Public challenges (forced `AccessLevel.PUBLIC`, no user context; `ChallengeServiceImpl.java:204-214`). Full `ChallengeResponse` incl. title, description, dates, workout, prizes, owner, member counts, cover images, and the invitation code (public challenges always expose it, `ChallengeServiceHelper.java:441-449`). 10 per page. |
| `GET /v1/public/posts/{postId}` | `pub/PublicContentController.java:27-30` → `PostContentServiceImpl.java:439-444` | `PublicContentResponse` (`api/dto/PublicContentResponse.java`): media list (entityId, fileName, mimeType, created, `previewUrl`, duration, width, height), poster `userResponse` (name, username, firebaseUserId, profileUrl, follower/following/challenge counts…), postId, likeCount, viewCount, created. Posts older than 60 days are refused (`Constants.POST_CONTENT_EXPIRATION_DAYS`). Both native apps use this for deep links (`docs/QUERY_AUDIT.md:1474,1758`). |
| `GET /v1/public/contents/{contentId}` | same controller `:22-25` | One media item + same poster payload. |
| `GET /v1/public/user/exists?countryCode=&number=` | `pub/PublicUserController.java:18-23` | Boolean — a phone-number enumeration oracle. |
| `POST /v1/public/version-upgrade` | `api/controller/VersionController.java` | `{force, recommend}` |
| `GET /` → "Hello There!", `GET /health` → "Ok!" | `HealthController.java` | EB health check |
| `GET /actuator/health` | `monitoring.properties`, `ManagementSecurityConfig.java` | `{"status":"UP"}` |
| `/swagger-ui/**`, `/v3/api-docs/**` | `SwaggerConfig.java`; `application.properties:3-4` default **true** | Full OpenAPI of the authenticated API unless `SWAGGER_DOC`/`SWAGGER_UI` are set false in the EB env. |

**Authenticated "share" endpoints (not public):** `POST /v1/invite/generate`, `GET /v1/invite/accept?token=`, `GET /v1/invite/status` (`api/controller/InviteController.java`); `POST /v1/posts/{postId}?challengeId=` → `{code, challengeInvitationCode?}` and `GET /v1/posts/{shareCode}` (`api/controller/PostShareController.java`, "Legacy Flutter only" per `docs/QUERY_AUDIT.md:1759`).

**What share links look like.** The only URL the backend ever builds is the streak-invite link: `"%s/invite/accept?token=%s"` with `app.base-url` defaulting to `https://buzzend.com` (`api/service/InviteService.java:51-52,257-259`; `application.properties:37-38`, commented "Buzzend Dynamic link URL"; env `BUZZEND_API_BASE_URL`). Token = 32-hex UUID, one active link per user (`api/entity/InviteLink.java:9-13`). Post shares return only a UUID `code` (`PostShareServiceImpl.java:70`), challenge invites a 6-hex-digit code regenerated by "Reset link" (`ChallengeServiceHelper.java:281-285`, `api/entity/ChallengeInvitation.java:25-27`); the apps assemble those URLs. A code join works even with a placeholder id: `POST /v1/challenge/demo/join-requests?code=` (`docs/CHALLENGE_JOIN_REQUESTS.md:23`). **No `buzzend.com/link/{posts|challenges|invite}/{id}` pattern exists anywhere in the repo** (grep for `/link/`, `page.link`, `dynamic link`, `deep link`, `universal link`, `branch.io`, `appsflyer`, `onelink` found only prose in the notification docs).

**HTML / Open Graph / store redirects:** none. Zero hits for `og:`, `opengraph`, `assetlinks`, `apple-app-site-association`, `well-known`, `play.google`, `apps.apple`, `market://`, `itms-apps` across `*.java|md|properties|sql|json|conf|sh|html`. The App Store id `1658683882` appears once, in `docs/RELEASE_1.1_FORCE_UPDATE.md:23` (iOS "Update Buzzend" button); Android opens the Play listing via `openPlayListing` (`:29`). So **this backend does not serve `/.well-known/assetlinks.json` or `apple-app-site-association`** — whatever answers on `buzzend.com` is another host (website/CloudFront/S3), outside this repo.

**Hosts seen:** `https://io-stage.buzzend.com` (Swagger server, `SwaggerConfig.java:26`); `https://buzzend.com` (base-url default); prod media `https://d21ho8qsn272oh.cloudfront.net/<key>` (`api/util/FileUtil.java:17-25`, `BucketServiceHelper.java:14`); profile images `https://buzz-profile-content-2765-prod.s3.amazonaws.com/<key>`; stage media `itg-event-post-image-stage-resized.s3.amazonaws.com`. Media URLs are unsigned and stable, so the public post JSON could feed `og:image` if a web layer existed.

---

## 3. Challenge / competition model

**Types.** `ChallengeType` = `STANDARD | ELIMINATION` (`api/enums/ChallengeType.java`; column default STANDARD, type never changes). "Beat-It" is a separate `Competition` aggregate (post-anchored, `api/entity/Competition.java`, `/v1/competitions`). There is no rep/step/daily enum: a challenge is `workoutCode` (`WLS` = steps challenge, anything else = rep challenge; `docs/MEMBER_STATISTICS_V2.md:39`) × `Frequency` (`DAILY, EVERY_OTHER_DAY, TWICE_A_WEEK, WEEKLY, ONE_TIME`, `api/enums/Frequency.java`) × optional `ChallengeUnit` × `WinnerType` (`NO_WINNER, NORMAL_WINNER, RANDOM_WINNER, POINT_SYSTEM`) × free-text prizes 1st/2nd/3rd (`api/entity/Challenge.java`). `ChallengeDay` rows are generated per frequency period (`ChallengeServiceImpl.java:137-190`).

**Visibility.** `AccessLevel` = `PRIVATE(0), PUBLIC(1), FRIEND(2), FRIEND_OF_FRIEND(3)` (`api/enums/AccessLevel.java`). Creating anything non-PUBLIC requires a server-side `PrivateChallengeGrant` row — fail-closed, support-managed by SQL, optional cap on live private challenges and expiry (`api/entity/PrivateChallengeGrant.java`, `api/util/PrivateChallengeGateHelper.java`, `docs/PRIVATE_CHALLENGE_GATE.md`). Own profile carries `canCreatePrivateChallenge`. **Private challenges are effectively an allow-listed beta, not a general feature.**

**Joining.** Public join `POST /v1/challenge/{id}/members`; invite-code join `?code=` (any access level; `MemberServiceImpl.java:633-654`); per-challenge `joinApproval` toggle turns both into join requests (`PENDING, APPROVED, REJECTED, CANCELLED, EXPIRED`, `api/enums/JoinRequestStatus.java`; `/v1/challenge/{id}/join-requests` CRUD + approve/reject, `api/controller/JoinRequestController.java`); turning approval off auto-approves the queue. Invitation code is sent only to the creator on non-public challenges (`docs/CHALLENGE_JOIN_REQUESTS.md:65-70`). Joining is open until `endDate` for standard, until end of day 1 for elimination (`EliminationService.assertJoinOpen`). **No participant cap** exists (`MEMBER_LIST_FETCH_SIZE=100` is paging only, `Constants.java:39`). Creator cannot leave or be removed; only the creator deletes.

**Durations.** `days` 1..365, `endDate = startDate + days` (`api/dto/ChallengeRequest.java:14-16`, `ChallengeServiceImpl.java:347-348`); duration must be ≥ the frequency period (`:400-401`); challenge starts at 00:00 in the creator's zone. Challenges stay visible 60 days after ending (`Constants.CHALLENGE_EXPIRATION_DAYS`). Status is computed, never stored: `ACTIVE, EXPIRED, INACTIVE, FUTURE`. Elimination: 2–30 days, 1–3 winners, one round per calendar day, geometric daily cut target `active × (winners/active)^(1/daysLeft)`, ties advance, zero-score eliminated when anyone scored, finalized 1 h after the day ends, withdrawn members can never rejoin (`api/elimination/EliminationRules.java:6-16,26-36,55-79`; `docs/ELIMINATION_CHALLENGE_PLAN.md` §1).

**Leaderboards.** Challenge: `MemberRepository.findRankedMemberIds` sums `workout_stats.count` for the challenge's type over the window (local dates in the challenge zone), `ORDER BY total DESC, name ASC` (`api/repository/MemberRepository.java:94-99`); dense rank in statistics v2 (`docs/MEMBER_STATISTICS_V2.md`). Winners are computed and persisted on first read after the end; `NORMAL_WINNER` only works for `WLS` (`MemberServiceImpl.java:356`), max 3 (`Constants.java:36`). Top Activities boards: total reps DESC → best single rep workout → steps → id; viewer is ranked; blocked users excluded (`api/repository/WorkoutRankingRepository.java:13-20,97-101`; `docs/TOP_ACTIVITIES_API.md`). Beat-It: `RANK() OVER (ORDER BY score DESC, duration ASC, created ASC)`, only attempts with a posted video rank (`api/repository/CompetitionAttemptRepository.java:132-137,313-315`), 60-day expiry (`Constants.java:14`).

**How reps are recorded and whether anything verifies them.** `POST /v1/workouts` takes `[{workoutType, count, workoutDate, durationSeconds?}]` and *adds* the count to the single `workout_stats` row per (user, type, local day) (`api/entity/WorkoutStats.java:7-10,28-38`; `WorkoutStatsServiceImpl.persistWorkoutBatch`). Validation is shape-only: duration 0..86400 (`WorkoutStatsServiceImpl.java:292-302`), no upper bound on `count`. `POST /v1/rep-logs` (multipart, up to 150 MB, `Constants.java:30`, nginx `client_max_body_size 160M`) stores the raw AI rep-counting JSON at `ai-rep-logs/<userId>/<date>/<entityId>.json` with `repCount`, `appVersion`, `platform` — documented as "Internal debugging/analysis only — never returned to app users… no retrieval API" (`api/entity/WorkoutRepLog.java:1-5`). **Nothing parses it or reconciles it against the counts; there is no server-side rep verification.** The only integrity rules are elimination's future-date guard (rows created >14 h before the day are ignored, `EliminationRules.java:16`) and routine idempotency by `clientSessionId` with a server-recomputed score (`docs/FULL_BODY_ROUTINES_API.md`). The elimination plan explicitly defers "double-counted retries" (`docs/ELIMINATION_CHALLENGE_PLAN.md`, Integrity row).

---

## 4. Streaks, restore, daily steps, notifications — engagement loops

**Streak rules** (`api/service/StreakService.java`; design `docs/STREAK_AUDIT_AND_REDESIGN.md` §6, §F): one streak per user; a day credits when **any one** type reaches its threshold within the user's local day (3000 steps, 10 push-ups/squats/sit-ups/lunges/burpees, 20 jacks/high knees — cross-type mixing never qualifies); `streakExpiresUtc = today + 2 days at 00:00` local (`:164,213`); broken when `now(userZone) > streakExpiresUtc` (`:356-360`). Restore window `MAX_RESTORE_DAYS = 7` (`Constants.java:52`) via (a) a workout dated on the missed day (step backfill) or (b) a friend accepting the invite link within 24 h (`INVITE_THRESHOLD = 1`, `InviteService.java:38-39`), which bridges the whole gap once per break. Behind `streak.fix.referral-qualification` the referral must be a ≤7-day-old account that logs a qualifying day within 72 h (`InviteService.java:40-42,170-206`). `POST /v1/streaks/reset` keeps the longest streak. Rollout flags, all env-driven (`api/config/StreakFixFlags.java`): `ledger-recompute` **true**, `future-date-guard` false, `restore-lifecycle` **true**, `reset-keeps-history` false, `referral-qualification` false, `profile-longest-streak` false (when on, profile "Day streak" shows the personal best).

**Daily steps / goals.** Default goal 5000 (`Constants.java:21`; `UserSetting.stepGoal`, `PATCH /v1/settings/step-goal`); steps sync through `/v1/workouts` as `STEPS`; `/v1/daily-steps` is deprecated.

**Notification system** (`api/enums/NotificationKind.java`, categories `SOCIAL, CHALLENGE, REMINDER, REENGAGEMENT, CHAT` as a preference bitmask; `NotificationDispatcher.java:66-73`: daily push cap 3, weekly 10, 30-min cooldown, quiet hours on, re-engagement paused after 5 ignored pushes; per-kind kill switch `notification.kind.<KIND>.enabled`). In-app rows + FCM push via Firebase; group/1:1 chat lives in Firestore `chatsV1`/`usersV1` (`api/firestore/*.java`). Templates are hard-coded English (`api/common/NotificationConstants.java`, `NotificationTypeName.getChallengeRelatedMessage`).

**Engagement / re-engagement loops that exist today** (`docs/NOTIFICATIONS_API.md:218-270`, `api/util/ReminderJobHandlers.java`, `api/scheduler/NotificationSweeps.java`, `api/service/OnboardingScheduler.java`):

1. Social: `FOLLOW`, `FOLLOW_BACK`, `CHALLENGE_CREATED` to followers (public challenges only). `CONTENT_UPLOADED`/`CONTENT_LIKED` are defined but never sent (`NOTIFICATION_AUDIT.md:14`).
2. Challenge lifecycle: `CHALLENGE_STARTING` 2 h before start, `CHALLENGE_ENDING` 24 h before end, `CHALLENGE_UPDATED`, `MEMBER_JOINED`, `MEMBER_REMOVED`, join request/approve/reject, `JOIN_REQUEST_REMINDER` at 24 h and 72 h.
3. `CHALLENGE_NUDGE`: member with no workout 24 h after joining/start, once more 48 h later.
4. Elimination daily results: `ELIMINATION_ADVANCED / ELIMINATED / WON / FINISHED`.
5. `ONBOARDING`: new accounts with no activity, day 1/3/7 at 18:00 local (`OnboardingScheduler.java:27`).
6. `STREAK_BROKEN`: 19:00 local when the streak ended two full days ago and is still restorable, once per break.
7. `REENGAGE`: established users (>14 days) inactive 3 days → day 3/7/14/30/90 at 18:00 local, deep-linking to their running challenge (`ReminderJobHandlers.java:64-65`).
8. Streak-restore-by-invite = the referral loop (`buzzend.com/invite/accept?token=`).
9. Auto-posted daily activity cards on the community feed (`PostKind.ACTIVITY`, bump-to-top; `docs/COMMUNITY_FEED_V2_API.md`).
10. Top Activities Friends/Global boards with "Your rank globally #7 of 2,480" card.
11. Beat-It competitions (video + score, 60 days).
12. Follow suggestions ranked by activity recency (`FollowerRepository.java:98-106`).
13. Store-review ask after 3+ completed workouts, state kept per account (`api/controller/ReviewStateController.java:2-4`).
14. Chat pushes (1:1 and challenge group). Retention: read rows deleted after 90 days, all after 180 (`docs/NOTIFICATIONS_API.md:52`).

Activity signal for 5/7 is `user.first_active_at/last_active_at` written by `ActivityTracker` (workout, steps, post, challenge create/join, competition attempt; opening the app is not activity, `api/service/ActivityTracker.java:9-11`).

---

## 5. client-features.properties and VersionController — flags and gates

**Per-feature minimum app versions** (`src/main/resources/client-features.properties:14-22`, read once at startup, section chosen by `BUZZEND_API_ENVIRONMENT` default `stage`; empty/missing = hidden from every app):

| Feature | stage iOS/Android | prod iOS/Android |
|---|---|---|
| `BURPEES_HIGH_KNEES` | 1.2 / 1.2 | 3.1.14 / 3.1.14 |
| `ELIMINATION_CHALLENGE` | 1.2 / 1.2 | 3.1.15 / 3.1.15 |

Judged per request from `X-App-Version` + `X-Platform` (`api/dto/ClientInfo.java:11-13`); missing headers = old app = not supported; background jobs see everything (`api/util/ClientFeatures.java`). Gated content is hidden end-to-end (catalog, stats, rankings, feed, challenges, competitions, posts, notifications) via `SupportedWorkouts`. Full Body routines are *not* gated (additive). `X-Notif-Contract: 2` selects the new notification payload (`ClientInfo.java:14-16`).

**Force / recommend update** (`api/service/VersionUpgradeServiceImpl.java`; `application.properties:32-36`): `app.version` default `{"ios":"1.2","android":"1.2"}` (env `APP_VERSION`), `app.version.upgrade` `{"ios":true,"android":true}` (`APP_VERSION_UPGRADE`, true = force), optional `app.version.recommend` (`APP_VERSION_RECOMMEND`). `POST /v1/public/version-upgrade {os, currentVersion}` → `{force, recommend}`; segment-wise numeric compare; unknown platform → no prompt. Apps fail open after 5 s (`docs/RELEASE_1.1_FORCE_UPDATE.md:36-43`). Note the default floor (1.2) is far below the prod app train (3.1.14+), so prod must override `APP_VERSION` in the EB env.

**Other switches and defaults:** `moderation.enabled=${MODERATION_ENABLED:true}` in the (uncommitted-modified) `application.properties:39-40` whose own comment says "Off by default", vs `ModerationProperties.enabled = false` (`api/moderation/ModerationProperties.java:11`) and docs saying off — inconsistent. Streak flags (§4). Notification: `notification.push.daily-cap` 3, `weekly-cap` 10, `cooldown-minutes` 30, `quiet-hours.enabled` true, `lifecycle.starting-lead-hours` 2, `notification.kind.<KIND>.enabled`. Swagger `SWAGGER_DOC`/`SWAGGER_UI` default true. `ENTITY_PAGE_SIZE` 10. Actuator exposure health/info/metrics only.

---

## 6. ContactUs, UserFeedback, ReviewState, Abuse/moderation, BlockedUser

- **ContactUs** (`api/controller/ContactUsController.java`, `api/entity/ContactUs.java`): `POST /v1/contact-us/users/cases` (osVersion + deviceInformation as JSON, `caseCategory`), `GET /v1/contact-us/categories` → `ACCOUNT_ISSUES, TECHNICAL_ISSUES, CONTENT_ISSUES, PRIVACY_ISSUES, GENERAL_FEEDBACK` (`api/enums/CaseCategory.java`), `PUT …/users/cases/{caseId}` flips `OPEN → RESOLVED`. Stored in MySQL only; no email/ticketing integration (no mail dependency in `build.gradle`).
- **UserFeedback** (`api/controller/UserFeedbackController.java`, `api/entity/UserFeedback.java`; migration `2026-09-29__user_feedback.sql`): `POST /v1/feedback` — `type COMPLAINT|SUGGESTION`, message ≤500, optional email, `source SETTINGS|WORKOUT`, platform/appVersion/osVersion/deviceModel, `supportChatId` (Firestore support chat), triage `status NEW|REVIEWED|RESOLVED`; 429 above 20 per 24 h.
- **ReviewState** (`api/controller/ReviewStateController.java`; columns on `user_setting`, migration `2026-09-28__user_setting__review_request.sql`): `GET /v1/settings/review-state`, `POST …/workout-completed`, `POST …/review-requested {appVersion, platform}`; apps request the native App Store / Play review only after 3+ completed workouts and throttle — the ASO ratings loop.
- **Abuse** (`api/controller/AbuseController.java`, `api/entity/Abuse.java`): `POST /v1/abuse` with `AbuseType USER_ACCOUNT, CHALLENGE, CHALLENGE_CONTENT, CHALLENGE_COVER, STORY`, description, reporter/reported, optional challengeId/contentId. Write-only; no review workflow or auto-action.
- **BlockedUser** (`api/controller/BlockedUserController.java`, `BlockedUserControllerV2.java`): list, toggle block by Firebase id, pair check; v2 paged list. Blocks exclude users from rankings, suggestions, feeds and engagement.
- **Text moderation** (`api/moderation/*`, `docs/TEXT_MODERATION_PLAN.md`, `docs/MODERATION_APP_ERROR_HANDLING.md`): in-process lexicon `src/main/resources/moderation/lexicon.tsv` — 1,104 terms: 799 English, 171 romanized Nepali/Hindi, 134 Devanagari; severity 3: 904, 2: 151, 1 (context words, never rejected): 49; 111-word allow-list; 33 Nepali postposition suffixes; sources PG-Momik/no-nepali-profanity-go and dsojevic/profanity-list (MIT, `THIRD_PARTY_NOTICES.md`). Moderated fields: challenge title/description/prizes, post caption, username (also digit-stripped), display name; sign-up name falls back to "Buzzend user" (`api/moderation/ModeratedField.java`, `Constants.java:78`). `POST /v1/moderation/check` (≤20 fields, ≤5000 chars); rejection = HTTP 422 `ITG0010` + `field`. Audit table `moderation_event` (`2026-10-06__moderation_event.sql`). No image/video moderation anywhere.

---

## 7. Auth providers, phone OTP, locales

- **Firebase Authentication** verifies ID tokens (`JwtFilter.java:60-61`); users are created on first token (`api/service/UserDetailsServiceImpl.java:70-146`). Providers: `PHONE ("phone")`, `GOOGLE ("google.com")`, `APPLE ("apple.com")` (`api/enums/AuthProvider.java`); Apple's missing name falls back to the email prefix (`api/util/UserUtil.java:131-144`).
- **Phone OTP is Firebase Phone Auth**, not a backend SMS provider — no Twilio/SNS/OTP code exists. The backend parses the E.164 claim with libphonenumber using an empty default region (`UserUtil.java:59-63`), so any country works; stores `countryCode` (≤5) + `mobile` (≤15) (`api/entity/User.java:58-63`). **No country/region restriction anywhere.** Address-book matching by raw mobile number (`UserServiceImpl.java:176-188`).
- **Locales/i18n: none.** No `Accept-Language`, no resource bundles, all strings English (`NotificationConstants.java`, `ReminderJobHandlers.java`, `Constants.java:66,75`). Only non-English awareness is the Nepali/Hindi moderation lexicon.
- User timezone defaults to `Asia/Kathmandu` and is refreshed from the `timeZone` request header (`Constants.java:22`, `User.java:89-93`, `JwtFilter.java:127-147`); the Firebase project id default is `winjee-dev`; the iOS bundle is `com.inventechgroup.winjeet` (`docs/RELEASE_1.1_FORCE_UPDATE.md:56`).

---

## 8. docs/ folder — titles, and what touches links/public pages/SEO/hosting

| File | Title (date) |
|---|---|
| `docs/CHALLENGE_JOIN_REQUESTS.md` | Challenge join approval — API contract (23 Sep 2026) |
| `docs/COMMUNITY_FEED_V2_API.md` | Community Feed V2 — API contract (15 Sep 2026) |
| `docs/ELIMINATION_CHALLENGE_APP_GUIDE.md` | Elimination Challenge: app integration and UI/UX guide |
| `docs/ELIMINATION_CHALLENGE_PLAN.md` | Elimination Challenge: implementation plan (12 Oct 2026) |
| `docs/FULL_BODY_ROUTINES_API.md` | Full Body routines — API contract (14 Oct 2026) |
| `docs/MEMBER_STATISTICS_V2.md` | Member Statistics v2 — API contract (23 Sep 2026) |
| `docs/MODERATION_APP_ERROR_HANDLING.md` | App error handling for text moderation |
| `docs/MONITORING.md` | Monitoring: Spring Boot Actuator + Micrometer |
| `docs/NOTIFICATIONS_API.md` | Notifications — overhaul, read-all & v2 list (21–28 Sep 2026, Phases 1–3) |
| `docs/PRIVATE_CHALLENGE_GATE.md` | Private challenge gate — server-side grants (16 Sep 2026) |
| `docs/QUERY_AUDIT.md` / `QUERY_AUDIT_IMPLEMENTATION.md` | Buzzend API — Query Audit & Mobile Compatibility Review (25 Aug 2026) |
| `docs/RELEASE_1.1_FORCE_UPDATE.md` | Release 1.1 — paged v2 endpoints, forced update (25 Aug 2026) |
| `docs/STREAK_AUDIT_AND_REDESIGN.md` | Buzzend streak — audit and redesign (29–30 Sep 2026) |
| `docs/TEXT_MODERATION_PLAN.md` | Buzzend: Text moderation (word list, in-process) |
| `docs/TOP_ACTIVITIES_API.md` | Top activities — ranked feeds (v2) (25 Aug 2026) |
| `docs/WORKOUT_DURATION_API.md` | Workout duration (time taken) — API contract (22 Sep 2026) |
| `docs/notification-stage-test/`, `streak-stage-test/`, `top-activities-stage-test/` | SQL fixtures for stage verification (T01–T16 cover each notification kind) |
| Root: `NOTIFICATION_AUDIT.md`, `NOTIFICATION_BACKEND_IMPLEMENTATION.md`, `NOTIFICATION_MOBILE_IMPLEMENTATION.md`, `MOBILE_VERIFICATION_CHECKLIST.md`, `Readme.md` (prod SQL runbook), `HELP.md` (Spring boilerplate) | |

Link/deep-link/public-page content: `NOTIFICATION_AUDIT.md:13,47` — no stored deep link; apps build it from `type + entity id`; push `type=challenge` opens the challenge, chat types open chat, anything else opens the app. `QUERY_AUDIT.md:1474,1758` — deep links hit `GET /v1/public/posts/{postId}`. `CHALLENGE_JOIN_REQUESTS.md:58-63` — "Reset link" invalidates every shared challenge link. `ELIMINATION_CHALLENGE_APP_GUIDE.md:264` — old builds show not-found for a deep link to an elimination challenge. `MONITORING.md:63-65` — custom domain over HTTPS/ACM; "If CloudFront or another proxy is added in front, it must forward the `Authorization` header." **No doc covers SEO, website hosting, the marketing site, AASA/assetlinks, or app-store metadata.** `COMMUNITY_FEED_V2_API.md:3` references the design repo (`Buzzend Design/docs/screens/home/community-v2.html`).

---

## 9. Analytics / event logging on the backend

None to GA, BigQuery, Firebase Analytics, Mixpanel, Amplitude, Segment or CloudWatch (grep over `src/main`, `docs`, `build.gradle`). What exists: Micrometer/Actuator metrics behind Basic auth (`docs/MONITORING.md`, "No Prometheus, Grafana or CloudWatch"); request logging filter at DEBUG (`WebSecurityConfig.java:53-64`); raw AI rep logs in S3 for offline analysis (`WorkoutRepLog`); `notification_delivery` log and `moderation_event` audit tables; `user.last_login_at / first_active_at / last_active_at`; `POST /v1/notifications/opened` only resets the ignored-push counter (`api/service/IgnoredPushes.java`). An "open-tracking analytics endpoint" is listed as low-priority backlog (`NOTIFICATION_AUDIT.md:273`). Any product analytics must therefore live in the mobile apps (Firebase project) — not visible from here.

---

## 10. Supported countries / markets indicators

- Default user timezone `Asia/Kathmandu` (`Constants.java:22`, `User.java:89-93`); comments reason about "US evening vs Nepal morning" and UTC+14 (`WorkoutStatsServiceImpl.java:685`, `EliminationRules.java:12-16`) — a Nepal-first product with diaspora/US users in mind.
- Moderation lexicon is English + romanized Nepali/Hindi + Devanagari; plan says the product owner is a native Nepali speaker (`docs/TEXT_MODERATION_PLAN.md:4`).
- Phone sign-in accepts any country (libphonenumber, empty region); no SMS provider, no currency anywhere (prizes are free text); no country allow/deny lists; English-only strings.
- Infrastructure in AWS us-east-2 (Ohio): RDS host in `application.properties:6`, S3/presigner region `Region.US_EAST_2` (`api/awssdk/AwsS3Objects.java:24`, `AwsPreSignedUrl.java:22`); prod buckets `buzz-profile-content-2765-prod`, `buzz-challenge-content-8976-prod`, `buzz-content-6463-prod` (`api/util/BucketServiceHelper.java:10-14`).
- Company: Inventech Group (`com.inventechgroup.*` bundle ids, `ITG` error codes, repo prefix `java-itg-`).

---

## Top uncertainties

1. **Who serves `buzzend.com`** (the `/invite/accept?token=` landing, AASA, assetlinks, any OG page). Nothing in this repo does; the API is JSON-only at `io-stage.buzzend.com` (prod API host not in repo). Needs the website repo / DNS / CloudFront config.
2. **Post and challenge share-URL formats are app-side.** Backend returns only a UUID `code` / 6-hex invitation code. Need `DeepLinkHandler.kt` / `NotificationRouter.swift` in the native repos, and whether Firebase Dynamic Links (deprecated by Google) is still in use ("Buzzend Dynamic link URL" comment).
3. **Legacy workout names** (YOG, RUN, CYC, …) exist only as DB rows; the 12-code soft-delete list may not be the full legacy set (ids 2–20 existed; a test references a non-enum catalog code `CYCLE`). Confirm with `SELECT code,name,deleted FROM workout` on prod.
4. **Prod environment overrides are unknown**: `APP_VERSION` (default 1.2 vs prod apps 3.1.14+), `MODERATION_ENABLED` (properties say true, class/docs say false; `application.properties` is modified and uncommitted), `SWAGGER_UI`/`SWAGGER_DOC` (default true = public API docs), `BUZZEND_API_BASE_URL`, `BUZZEND_API_ENVIRONMENT`.
5. **Camera vs manual reps** is an app-side truth; the backend accepts any count and never verifies the AI rep log. Marketing claims about "verified" or "camera-counted" reps cannot be backed by the server.
6. **Private challenges are grant-gated** (support SQL allow-list). Whether grants are broadly issued decides if "private challenges with friends" is a shippable marketing claim.
7. **Release status of gated features**: Elimination (prod min 3.1.15) and Burpees/High Knees (3.1.14) — are those app versions live in the stores?
8. **Prod API hostname and CloudFront-in-front status** (MONITORING.md treats CloudFront as hypothetical for the API; content already uses `d21ho8qsn272oh.cloudfront.net`).
9. **Public phone-exists endpoint and public post/profile payloads** (`/v1/public/user/exists`, `/v1/public/posts/{id}` exposing name, username, firebaseUserId, avatar) — product may want to confirm these are intentional before any web layer links to them.
10. **Elimination/Full-Body docs say "not committed"** while `git log` shows them committed (`ac28056`, `d5faa1c`) — docs lag the code; treat doc status lines with caution.
