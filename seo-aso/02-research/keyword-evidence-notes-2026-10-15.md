# Keyword evidence notes (observed 2026-10-15)

Sources: Apple App Store autocomplete (search-hints endpoint, storefronts US/GB/NP) and the iTunes Search API (top 200 results per term, US and NP) run 2026-10-15; Google autocomplete (6 countries) run 2026-10-15; Google Play web search results (US/NP/GB/IN) run 2026-10-15. **No search volumes exist in this data.** Hint rank = position of the term in Apple's suggestion list for a seed (lower = Apple surfaces it earlier = stronger demand proxy). 'Big' = apps with >10,000 ratings in the top 10 (competition proxy). Master table: `../data/master-keyword-evidence.csv`.

## 1. Where Buzzend ranks in App Store search today (title 'Buzzend: Fitness Challenges' / subtitle 'AI Workout Rep Counter', live since 2026-10-11)

- **US** storefront, 378 terms checked (top 200 each): `ai rep counter` #1, `buzzend` #1, `buzzend: fitness challenges` #1, `group fitness challenge` #15, `apps for group step challenges` #28, `fitness challenge with friends` #52, `step challenge with friends` #57, `fitness leaderboard` #74, `the fitness streak - 2026` #93, `ryval fitness social app` #96, `sweater: fitness with friends` #98, `challenge friends` #101, `fitness streak` #105, `orbit: workout with friends` #114, `squat tracker` #115, `wefit - fitness with friends` #115, `maxr: social fitness streaks` #118, `loop: fitness with friends` #124, `rep counter` #131, `beast up: social fitness` #133, `squat challenge` #142, `apex: fitness streak tracker` #145, `fitness streaks` #150, `step counter with friends` #163, `beactive*: fitness social app` #166
- **NP** storefront, 378 terms checked (top 200 each): `buzzend` #1, `buzzend: fitness challenges` #1, `ai rep counter` #2, `group fitness challenge` #2, `fitness leaderboard` #5, `squat counter: daily reps` #5, `squat counter: daily squats` #9, `squat tracker` #12, `rep counter: voice workout` #14, `fitness streak` #21, `push-up counter: daily reps` #24, `rep counter free` #30, `fitness streaks` #31, `workout motivation` #35, `30 day ab & squat challenge` #36, `situp` #36, `squat challenge` #36, `squat counter` #37, `rep counter` #40, `the squat challenge` #41, `workout streak` #41, `30 day - squat challenge` #42, `situps` #42, `30 day squat challenge` #43, `push up counter golden pushups` #43, `push up counter - 100 pushups` #47, `workout challenge` #52, `streaks workout` #56, `exercise counter` #73, `squat` #78, `streak tracker free` #82, `fitness challenge` #84, `streak tracker` #86, `step challenge with friends` #99, `fitness challenge with friends` #139, `body workout: exercise tracker` #154

**Reading these ranks.** The live subtitle already wins the exact phrase `ai rep counter` (#1 US, #2 NP) and the title wins `group fitness challenge` (#15 US, #2 NP) — both phrases are fully covered by name + subtitle words. The exercise-specific counter terms do not rank in the US (`squat counter`, `push up counter`, `sit up counter` absent from the top 200; `rep counter` #131) because the exercise words are not in the name or subtitle and either are not in the hidden keyword field or carry too little weight there. Nepal ranks are higher across the board (fewer competing apps indexed on that storefront), but NP results for rare terms are noisy (Facebook/WhatsApp appear), so treat NP positions above ~#30 as soft evidence.

## 2. Opportunity shortlist — Apple hint rank ≤ 3 in US and ≤ 2 big apps in the US top 10

| Term | US hint rank | GB | NP | Big (>10k) in US top 10 | >1k in US top 10 | US top 3 today | NP top 3 today | Buzzend US / NP |
|---|---|---|---|---|---|---|---|---|
| 30 day challenge | 1 | 2 | — | 0 | 0 |  | 30 Day Challenge - LockIn30 · 30 Day - Ab Challenge · 30-Day Challenge: Streak | — / — |
| jumping jack counter | 1 | — | — | 0 | 4 | JumJac: Jumping Jacks Counte · JumRop - Jump Rope Rep Count · Counter≜ | Facebook · Offroad Car Simulator Games · Offline Music Player | — / — |
| push up arena | 1 | — | — | 0 | 2 | Push Up Arena - Fitness Game · Pushoff - Ranked Pushup · RepChamp: Fitness Duel | Push Up Arena - Fitness Game · Fit Arena - Push Up Battles · PUPG - Push Up PlayGround | — / — |
| push up counter & tracker | 1 | — | — | 0 | 4 | Push Up Counter & Tracker · PushFit · PushUpLock - Push Up Blocker | Push Up Counter and Tracker · Strava: Run, Bike, Walk · TikTok - Videos, Music & LIV | — / — |
| pushup counter and tracker | 1 | — | — | 0 | 4 | Push Up Counter & Tracker · Push-Ups · Push Up Counter GOLDEN PushU | Push Up Counter and Tracker · Push Ups Counter and Tracker · Push Up Counter GOLDEN PushU | — / — |
| situps | 1 | — | — | 0 | 4 | Abs Workout: 200 sit ups pro · Abs workout: 200 sit ups · sit-Ups | Abs Workout: 200 sit ups pro · Abs workout: 200 sit ups · Situps Coach | — / 42 |
| squat counter | 1 | 1 | 1 | 0 | 1 | Squat Counter - Auto countin · Squat Counter: Daily Reps · Squats Counter | Squat Counter - Auto countin · Squat Counter: Daily Reps · Butt workout: squat challeng | — / 37 |
| the push up challenge | 1 | — | — | 0 | 3 | 100 Push Ups: Just 6 Weeks · 30 Day - Push Up Challenge · Push For Better | The Push-Up Challenge · 30 Day Push Up Challenge · 30 Day - Push Up Challenge | — / — |
| fitness leaderboard | 1 | — | — | 1 | 5 | Challenges - Compete, Get Fi · MoveTogether: Fitness Compet · Liftoff - Ranked Gym Workout | Liftoff - Ranked Gym Workout · FitRank: Fitness Leaderboard · Pushup RPG: Fitness Quest | 74 / 5 |
| fitness social | 1 | — | — | 1 | 4 | Corecircle: Social Fitness · Uplift - Social Fitness · RYVAL Fitness Social App | X · Facebook · Kratos - Social Fitness | — / — |
| gamified fitness | 1 | — | — | 1 | 3 | SelfQuest · Arise: Level Up Workout Game · Walkr - Gamified Fitness Wal | Arise: Level Up Gym Workouts · Walkr - Gamified Fitness Wal · Workout Plan & Habit: Coolti | — / — |
| squat challenge | 1 | 1 | — | 1 | 3 | 30 Day - Squat Challenge · Butt workout: squat challeng · Butt Workout: Fitness at Hom | 30 Day - Squat Challenge · 30 Day Squat Challenge · Butt Workout: Fitness at Hom | 142 / 36 |
| workout with friends | 1 | — | — | 1 | 4 | Challenges - Compete, Get Fi · Proof: Health With Friends · GymRats · Fitness challenge | Strava: Run, Bike, Walk · Snapchat: Chat with friends · Orbit: Daily Workout Friends | — / — |
| fitness challenge with friends | 1 | — | — | 2 | 6 | Challenges - Compete, Get Fi · GymRats · Fitness challenge · WeFit - Fitness With Friends | Strava: Run, Bike, Walk · Challenges - Compete, Get Fi · Instagram | 52 / 139 |
| fitness with friends | 1 | — | — | 2 | 5 | Challenges - Compete, Get Fi · BetterTogether: Weight Loss · Stompers: Walking Step Count | Strava: Run, Bike, Walk · Snapchat: Chat with friends · Challenges - Compete, Get Fi | — / — |
| froker-challenge friends & win | 1 | 1 | 1 | 2 | 5 | Froker-Challenge Friends & W · Cheat Master for Words Frien · playus: Daily Group Challeng | Froker-Challenge Friends & W | — / — |
| home workout for men | 1 | 3 | 9 | 2 | 7 | Home Workout for Men · Home Workout - No Equipments · Six Pack in 30 Days: Core, A | Home Workout for Men · Home Workout - No Equipments · Six Pack in 30 Days: Core, A | — / — |
| sit up counter | 1 | 1 | — | 2 | 4 | sit-Ups · Sit Up Counter! - Auto Count · 100 Push Ups: Just 6 Weeks | 100 Push Ups: Just 6 Weeks · Abs Workout: 200 sit ups pro · Google Maps | — / — |
| 100 sit-ups challenge | 2 | 1 | 8 | 0 | 4 | 100 Sit-Ups Challenge · 100 Push Ups: Just 6 Weeks · 0-200 Situps Trainer Challen | 100 Push Ups: Just 6 Weeks · 30 Day - Ab Challenge · Abs Workout: 200 sit ups pro | — / — |
| 30 day challenge free | 2 | 1 | — | 0 | 0 |  | 30 Day - Ab Challenge · 30 Day Fitness at Home · 30 Day Fitness - Home Workou | — / — |
| plank challenge | 2 | 2 | 7 | 0 | 2 | 30 Day Plank Challenge! · Plank Workout 30 day challen · At Home Plank Workouts | Plank Challenge 30 day worko · 30 Day Plank Challenge · Plank 30 Days Challenge | — / — |
| push up counter free | 2 | — | — | 0 | 4 | Push Up Counter & Tracker · Push Up Counter GOLDEN PushU · Push Up Counter: Arena | Push Up Counter and Tracker · Push Up Counter: Arena · Push Up Counter GOLDEN PushU | — / — |
| pushup counter | 2 | 1 | — | 0 | 3 | Push Up Counter & Tracker · Push Up Counter GOLDEN PushU · Push-Ups | Push Up Counter GOLDEN PushU · Push Up Counter and Tracker · Push Up Counter: Arena | — / — |
| the push-up challenge | 2 | 1 | 2 | 0 | 5 | Push ups: 100 pushups traine · Push For Better · 100 Push Ups: Just 6 Weeks | 30 Day - Push Up Challenge · The Push-Up Challenge · Push For Better | — / — |
| 30 day squat challenge free | 2 | — | — | 1 | 1 | 30 Day - Squat Challenge · 30 Day Squat Fitness Challen · 30 Day Squat Challenge! | 30 Day - Squat Challenge · 30 Day Ab & Squat Challenge · 30 Day Squat Challenge | — / — |
| pose maker | 2 | 3 | — | 1 | 3 | Magic Poser - Art Pose Tool · Easy Pose -Best Posing App · Poseit | Magic Poser - Art Pose Tool · Easy Pose -Best Posing App · Pose Maker Pro - Art poser a | — / — |
| push workout counter | 2 | — | — | 1 | 5 | Push Up Counter & Tracker · pushr – push-up workouts · PushFit | pushr – push-up workouts · Push Up Counter and Tracker · Home Workout - No Equipments | — / — |
| calisthenics men | 2 | — | — | 2 | 4 | Military Calisthenics Max · Home Workout - No Equipments · Thenx: Calisthenics Training | Thenx: Calisthenics Training · Home Workout - No Equipments · Military Calisthenics Max | — / — |
| lift card social fitness app | 2 | 2 | — | 2 | 5 | Lift Card: Track & Share · Planet Fitness · Fitbod: Gym & Fitness Planne | Lift Card: Track & Share · Facebook · TikTok - Videos, Music & LIV | — / — |
| rep counter free | 2 | 1 | — | 2 | 4 | RepCount - Gym Workout Track · Simple Tap Counter · Counter - Simply Count Thing | Rep Counter with rest timer · RepCount - Gym Workout Track · Set & Rep Counter Workout Lo | — / 30 |
| 30 day squat challenge | 3 | 1 | 4 | 0 | 0 |  | 30 Day - Squat Challenge · 30 Day Squat Challenge · 30 Day Squat Challenge - Leg | — / 43 |
| plank workout | 3 | 3 | 10 | 0 | 2 | At Home Plank Workouts · Plank Workout 30 day challen · Plank Workout & Fitness App | Plank Workout Challenge · At Home Plank Workouts · Plank Challenge 30 day worko | — / — |
| push up counter app | 3 | — | — | 0 | 3 | Push Up Counter & Tracker · Push Up Counter GOLDEN PushU · Push-Ups | Push Up Counter GOLDEN PushU · Push Up Counter and Tracker · Push Up Counter: Arena | — / — |
| squat tracker | 3 | — | — | 0 | 2 | Squat Tracker · Squats - Tracker & Counter · Butt workout: squat challeng | Squat Tracker · Butt workout: squat challeng · 30 Day Squat Challenge | 115 / 12 |
| daily pushup counter | 3 | — | — | 1 | 5 | Push Up Counter & Tracker · Pushups Counter · Pushup Counter App | Push Up Counter and Tracker · PushUp App Blocker - PushBlo · Push Ups Counter and Tracker | — / — |
| 7 minute workout challenge | 3 | 2 | — | 2 | 4 | 7 Minute Workout Challenge · Seven: 7 Minute Workout · 7 minute workout challenge. | 7 Minute Workout Challenge · 7 minute workout challenge. · Seven: 7 Minute Workout | — / — |
| ai form check | 3 | — | — | 2 | 3 | Gym Assistant - AI Form Chec · Form Fix: AI Form Check Coac · FormLens: AI Form Check Coac | Canva: AI Video & Photo Edit · DeepSeek - AI Assistant · Suno: Songs & Music Maker | — / — |
| pose | 3 | 6 | — | 2 | 3 | Pose: AI Photo Video Generat · Easy Pose -Best Posing App · Photogenik: Pose & Photo Coa | PosePal: AI Photo Pose Guide · PoseRef: Pose Easily · Posera: Camera Pose Guide | — / — |

App-name suggestions (terms containing ':', '!' or ' - ') are excluded here but kept in the CSV. 38 generic terms qualify. Terms with hint rank 1 and zero big apps are the most winnable for a small app; terms with 2 big apps need the exact phrase in name/subtitle to compete.

## 3. High-demand but crowded (hint rank ≤ 2, ≥ 4 big apps) — use in description/keywords only, not as a title bet

- `30 day workout challenge` (hint 1, 5 big): 30 Day Fitness at Home · 30 Day Fitness - Home Workout · Six Pack in 30 Days: Core, Abs · Lose Weight at Home in 30 Days
- `ai coach` (hint 1, 4 big): Grok AI · Hapday - AI Life Coach · Fitness AI Gym Workout Planner · Simple: AI Weight Loss Coach
- `ai fitness app` (hint 1, 7 big): Fitness AI Gym Workout Planner · Cal AI - Calorie Tracker · Fitbod: Gym & Fitness Planner · Zing AI: Home & Gym Workouts
- `ai workout planner` (hint 1, 4 big): Fitness AI Gym Workout Planner · Fitbod: Gym & Fitness Planner · Planfit AI Gym Workout Planner · Thelo: AI Workout Planner
- `bodyweight workout` (hint 1, 6 big): Home Workout - No Equipments · 7 Minute Workout · Stark Bodyweight · Fitbod: Gym & Fitness Planner
- `calisthenics workout` (hint 1, 5 big): Military Calisthenics Workout · Home Workout - No Equipments · Thenx: Calisthenics Training · BetterMe Well-Being Coach
- `daily workout free` (hint 1, 8 big): Daily Workouts - Home Fitness · Home Workout - No Equipments · Seven: 7 Minute Workout · Workout for Women: Home & Gym
- `exercise counter` (hint 1, 6 big): Voice Counting · Exercise Sound Counter · RepCount - Gym Workout Tracker · Counter Tally Count
- `exercise tracker free` (hint 1, 8 big): Google Fit: Activity Tracker · Strong Workout Tracker Gym Log · RepCount - Gym Workout Tracker · Map My Walk: Walking Tracker
- `fitness game` (hint 1, 6 big): Liftoff - Ranked Gym Workouts · JustFit: Lazy Workout & Fit · Genopets: Move. Play. Create. · Fit the Fat 3
- `fitness tracker free` (hint 1, 8 big): Strong Workout Tracker Gym Log · ActivityTracker Pedometer · Apple Fitness · MyFitnessPal: Calorie Counter
- `no equipment workout` (hint 1, 4 big): Home Workout - No Equipments · Home Workout no Equipment :Men · Home Workout for Men · Home Workout · No Equipments
- `rep count` (hint 1, 4 big): RepCount - Gym Workout Tracker · RepCounter Pro · Strong Workout Tracker Gym Log · Hevy - Workout Tracker Gym Log
- `step counter: walk tracking` (hint 1, 9 big): StepsApp Pedometer · Pedometer α - Step Counter · Steps - Activity Tracker · Pacer Pedometer Step Counter
- `streak tracker` (hint 1, 6 big): Habit Builder - Flame · Habit Tracker · Days Since: Quit Habit Tracker · I Am Sober
- `workout counter` (hint 1, 4 big): Rep Counter: Voice Workout · RepCount - Gym Workout Tracker · Interval Timer □ HIIT Timer · RepCounta: AI Pushup Counter
- `workout motivation` (hint 1, 6 big): Habit Tracker · FitQuote — Motivation Quotes · Home Workout - No Equipments · Motivation - Daily quotes
- `workout tracker: gym log book` (hint 1, 5 big): Strong Workout Tracker Gym Log · RepCount - Gym Workout Tracker · Lyfta: Gym Workout Tracker Log · Hevy - Workout Tracker Gym Log
- `ai fitness trainer` (hint 2, 6 big): Fitness AI Gym Workout Planner · Fitbod: Gym & Fitness Planner · Zing AI: Home & Gym Workouts · SHRED: Gym & Home Workouts
- `ai workout coach` (hint 2, 4 big): Zing AI: Home & Gym Workouts · Fitbod: Gym & Fitness Planner · Fitness AI Gym Workout Planner · Form: AI Workout Coach
- `bodyweight workouts at home` (hint 2, 8 big): Home Workout - No Equipments · 7 Minute Workout · Workout for Women: Fit at Home · Bodyweight Workout Program
- `daily workout` (hint 2, 5 big): Daily Workouts - Home Fitness · Home Workout - No Equipments · 30 Day Fitness - Home Workout · Seven: 7 Minute Workout
- `exercise tracker` (hint 2, 8 big): Habit Tracker · Running Walking Tracker Goals · Strong Workout Tracker Gym Log · Activity Tracker・FitnessView
- `fitness tracker` (hint 2, 9 big): MyFitnessPal: Calorie Counter · Apple Fitness · Running Walking Tracker Goals · Strong Workout Tracker Gym Log
- `fitrank: fitness leaderboards` (hint 2, 4 big): FitRank: Fitness Leaderboards · ChallengeRunner · Challenges - Compete, Get Fit · Planet Fitness

## 4. Storefront differences in Apple autocomplete (US vs GB vs NP) for the core seeds

- **squat counter** — US: ['squat counter', 'squat counter! - auto count', 'squat counter - auto counting', 'squat counter: daily reps', 'the squat counter ar', 'squat counter: daily squats'] · GB: ['squat counter', 'the squat counter ar', 'squat counter - auto counting', 'squat counter: daily reps', 'squat counter: motionfit', 'dundun - squat counter'] · NP: ['squat counter', 'the squat counter ar', 'dundun - squat counter', 'squatstar: squat counter', 'squattrack - squat counter']
- **push up counter** — US: ['push up counter & tracker', 'push up counter free', 'push up counter app', 'push up counter & tracker free', 'pushup push up counter', 'ai push up counter'] · GB: ['push-up-counter', 'push up counter and tracker', 'push up counter: arena', 'push up counter golden pushups', 'push up counter trainer', 'push-up counter : ia tracker'] · NP: ['push up counter and tracker', 'push up counter: arena', 'push up counter golden pushups', 'push-up-counter', 'push-up counter: daily reps', 'push-up counter : ia tracker']
- **rep counter** — US: ['rep counter', 'rep counter free', 'repvana: auto rep counter', 'gym rep counter', 'ai rep counter', 'set and rep counter'] · GB: ['rep counter free', 'rep counter', 'rep counter with rest timer', 'repvana: auto rep counter', 'rep counter: workout tracker', 'rep counter: voice workout'] · NP: ['repvana: auto rep counter', 'rep counter with rest timer', 'rep counter, jump counter', 'auto rep counter: healthbuddy', 'fitnit: ai rep counter', 'form coach: camera rep counter']
- **workout with friends** — US: ['workout with friends', 'orbit: workout with friends', 'amiqo: workout with friends', 'grytt: workout with friends', 'gym buds: workout with friends', 'gymspot: workout with friends'] · GB: ['amiqo: workout with friends', 'grytt: workout with friends', 'gym buds: workout with friends', 'gymspot: workout with friends', 'kontest: workout with friends', 'mishep — workout with friends'] · NP: ['repsquad: workout with friends']
- **fitness challenge** — US: ['fitness challenge with friends', 'fitness challenge', 'sidekick: fitness challenges', '30-day fitness challenges', 'gymrats · fitness challenge', 'group fitness challenge'] · GB: ['fitness challenge', 'sidekick: fitness challenges', '30 day fitness challenge', 'gymrats · fitness challenge', 'fitness challenge 30 days', 'the fitness challenge'] · NP: ['sidekick: fitness challenges', 'fitness challenge 30 days', 'the fitness challenge', 'fitness challenge', '30 day ab fitness challenges ~ daily workout', '30 day back fitness challenges ~ daily workout']
- **workout streak** — US: ['workout streak', 'fitquest: workout streaks', 'fitstreak: workout streak', 'forge: daily workout streak', 'liftday – workout streak habit', 'oneset - workout streaks'] · GB: ['workout streak', 'fitquest: workout streaks', 'fitstreak: workout streak', 'forge: daily workout streak', 'liftday – workout streak habit', 'oneset - workout streaks'] · NP: []
- **ai workout** — US: ['ai workout planner', 'ai workout coach', 'ai workout', 'ai workout tracker', 'buffro: ai workout tracker', 'ai workout planner free'] · GB: ['ai workout', 'selfpeak: ai workout coach', 'setune: ai workout coach', 'motra ai workout fitness coach', 'buffro: ai workout tracker', 'ai workout planner apps ltd'] · NP: ['selfpeak: ai workout coach', 'setune: ai workout coach', 'next set: ai workout planner', 'ai workout tracker - trainingg', 'ai workout planner: connefi', 'ai workout coach & gym tracker']
- **home workout** — US: ['home workout for men', 'home workout for women', 'home workout', 'home workout for women free', 'home workout app free', 'home workout with dumbbells'] · GB: ['home workout', 'home workout: no equipment', 'home workout for men', 'home workout for women', 'home workout with dumbbells', 'home workout: no equipment free'] · NP: ['home workout free', 'home workout', 'menfit: home workout for men', 'auralift: gym & home workouts', 'full body home workout', 'befit: gym & home workout plan']
- **buzzend** — US: ['buzzend: fitness challenges'] · GB: ['buzzend: fitness challenges'] · NP: ['buzzend: fitness challenges']

## 5. Apps that appear most often in US top-10 results across all checked terms

- Home Workout - No Equipments — in 39 top-10 lists; 127091 ratings; Leap Health Fitness Limited
- PushFit — in 31 top-10 lists; 2360 ratings; Ben Humphries
- Fitness AI Gym Workout Planner — in 31 top-10 lists; 55968 ratings; FitnessAI Inc.
- Gym Workout Planner - Gym Plan — in 31 top-10 lists; 678 ratings; Gym Plan Limited
- Challenges - Compete, Get Fit — in 31 top-10 lists; 5728 ratings; FitNow, Inc.
- 30 Day Fitness at Home — in 28 top-10 lists; 28637 ratings; Leap Health Fitness Limited
- Zing AI: Home & Gym Workouts — in 27 top-10 lists; 30764 ratings; Zing Coach Inc.
- Push Up Counter & Tracker — in 27 top-10 lists; 3403 ratings; wsfu
- Gymverse: Gym Workout Planner — in 26 top-10 lists; 165313 ratings; FITNESS22 LTD
- Gentler Streak Workout Tracker — in 24 top-10 lists; 8826 ratings; Gentler Stories d.o.o.
- Corecircle: Social Fitness — in 23 top-10 lists; 2699 ratings; Connectful LLC
- Fitbod: Gym & Fitness Planner — in 23 top-10 lists; 287389 ratings; Fitbod Inc.
- RepCount - Gym Workout Tracker — in 23 top-10 lists; 13382 ratings; Siper Apps AB
- RYSE : Social Fitness App — in 22 top-10 lists; 249 ratings; AltruLife LLC
- Motra AI Workout Fitness Coach — in 22 top-10 lists; 3042 ratings; Train Fitness Inc.
- Workout for Women: Home & Gym — in 22 top-10 lists; 531918 ratings; Fast Builder Limited
- 100 Push Ups: Just 6 Weeks — in 21 top-10 lists; 9442 ratings; Aleksandr Lomakin
- 30 Day Fitness - Home Workout — in 20 top-10 lists; 58567 ratings; Mosaic S.r.l.
- Seven: 7 Minute Workout — in 20 top-10 lists; 137762 ratings; Perigee AB
- Muscle Booster Workout Tracker — in 20 top-10 lists; 138259 ratings; WELLTECH APPS LIMITED
- 30 Day - Squat Challenge — in 19 top-10 lists; 869 ratings; Jozic Productions Pty Ltd
- Flex AI Workout Trainer & Log — in 19 top-10 lists; 2411 ratings; Flex Artificial Intelligence Inc.
- Habit Tracker — in 19 top-10 lists; 147925 ratings; Inner Grow Limited
- Push Up Arena - Fitness Game — in 19 top-10 lists; 3411 ratings; Airix LLC
- Map My Fitness Workout Tracker — in 18 top-10 lists; 77889 ratings; Outside Television Inc

## 6. Google autocomplete highlights (US unless noted)

- `squat counter` → ['squat counter', 'squat counter app', 'squat counter online', 'squat counter app free', 'squat counterbalance', 'squat counter apple watch', 'squat counter ai', 'squat counterweight']
- `push up counter` → ['push up counter', 'push up counter app', 'push up counter device', 'push up counter and tracker', 'push up counter online', 'push up counter camera', 'push up counter ai', 'push up counter website']
- `rep counter app` → ['rep counter app', 'rep counter apple watch', 'rep counter app free', 'rep counter app reddit', 'repetition counter app', 'apple watch rep counting', 'rep tracker app', 'rep tracker apple watch']
- `workout with friends app` → ['workout with friends app', 'workout with friends app free', 'exercise with friends app', 'workout competition with friends app free', 'workout challenge with friends app', 'workout competition with friends app', 'workout accountability with friends app', 'workout with your friends app']
- `fitness challenge app` → ['fitness challenge app', 'fitness challenge app free', 'fitness challenge app with friends', 'fitness challenge apple watch', 'fitness challenge app with friends free', 'fitness challenge app for workplace', 'fitness challenge apple', 'fitness challenge apps for groups']
- `ai workout counter` → ['ai workout counter', 'ai workout tracker', 'ai workout tracker app', 'ai workout tracker free', 'overlo ai workout tracker', 'ai workout tracker reddit', 'ai workout rep.counter', 'istore ai workout counter']
- `app that counts push ups` → ['app that counts push ups', 'app that counts your push ups', 'is there an app that counts push ups', 'how to count push ups']
- `app that counts squats` → ['app that counts squats', 'do squats count as steps', 'app for counting reps']
- `workout app that counts reps` → ['fitness app that counts reps', 'app workout count reps', 'app for counting reps']
- `fitness challenges with friends` → ['fitness challenges with friends', 'fitness challenges with friends app', 'fitness challenge with friends apple watch', 'workout challenges with friends', 'fitness competition with friends', 'gym challenges with friends', 'fitness competition with friends app', 'fitness activities with friends']
- `how to count push ups` → ['how to count push ups', 'how to count push ups on apple watch', 'how to count push ups on garmin', 'how to calculate push ups', 'how to count push up reps', 'how to count archer push ups', 'how to count military push ups', 'how to count your push ups']
- `buzzend` → ['mark buzzoni', 'robert buzzendore']
- Seeds with **no** suggestions in the US: ['camera based workout tracking', 'how to track squats at home', 'buzzend app', 'phone camera workout app']
- Country comparison: suggestions for the counter/challenge seeds were identical or near-identical across US, GB, CA, AU, NP and IN (English queries); Nepal-specific terminology did not surface via autocomplete and needs Play Console country search data or Nepali-language queries.

## 7. Google Play search snapshot

- GB: Buzzend appears for {'buzzend': 1}
- IN: Buzzend appears for {'buzzend': 1}
- NP: Buzzend appears for {'buzzend': 1, 'fitness challenge with friends': 13}
- US: Buzzend appears for {'buzzend': 1, 'fitness challenge with friends': 11}
- Counter cluster on Play is held by small single-exercise apps (AI Rep Counter 100+, RepCam AI 500+, Repletic 100+, Gym Rep Counter 500+ installs); challenge cluster is held by Leap's 30 Day Fitness Challenge (550K reviews), GymRats (114K), Challenges – Compete (1.08K) and Stridekick; 'workout with friends' returns gym loggers (Hevy 278K, Liftoff 96.5K) — a different intent.

## 8. What this does NOT tell us
- Absolute search volume on any platform; conversion by keyword; Google SERP positions (no Search Console); App Store 'popularity' scores (no ASO tool). Fill the blank columns in the CSV when a volume source is available.
