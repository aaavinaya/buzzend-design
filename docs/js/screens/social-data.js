/* Shared data for the home-linked screens (Profile · Challenges · Activity).
   Grounded in the old Figma + the existing backend model — UI/UX only, no
   backend change. Activities = steps + the 5 AI-counted exercises. People carry
   per-activity weekly reps + steps so leaderboards, profiles and challenges all
   read from one source. Category colors match the old stacked-bar legend. */
window.Social = (function () {
  // activity types (steps + 5 exercises) — icon + legend color (category, not palette)
  const ACT = [
    { key: "steps",   n: "Steps",         i: "footprints", c: "#22c993" },
    { key: "squat",   n: "Squats",        i: "squat",      c: "#9b6cff" },
    { key: "pushup",  n: "Push-ups",      i: "pushup",     c: "#ffa828" },
    { key: "situp",   n: "Sit-ups",       i: "situp",      c: "#3b6eff" },
    { key: "jumping", n: "Jumping Jacks", i: "jumping",    c: "#ec4899" },
    { key: "lunge",   n: "Lunges",        i: "lunge",      c: "#ef4444" },
  ];
  const EX = ACT.filter((a) => a.key !== "steps");   // just the rep exercises

  // people — me + friends + others. reps are this-week totals; steps weekly.
  const P = (name, av, o) => Object.assign({ name, av, initials: name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() }, o);
  const ME = P("Ema William", "#6a8caf,#33566f", {
    me: true, handle: "@ema", online: true, following: 1, followers: 0, joinedChallenges: 14, streak: 47, best: 60,
    steps: 21400, squat: 612, pushup: 430, situp: 388, jumping: 540, lunge: 196, friend: true });

  const PEOPLE = [
    ME,
    P("Anita Malan",   "#b8c6d1,#8aa0b3", { friend: true,  steps: 38200, squat: 980, pushup: 720, situp: 640, jumping: 910, lunge: 410 }),
    P("Ravi Thapa",    "#c9a6a6,#a87766", { friend: true,  steps: 31900, squat: 540, pushup: 880, situp: 300, jumping: 600, lunge: 250 }),
    P("Sita Rai",      "#a6c9b5,#5e996f", { friend: true,  steps: 28800, squat: 720, pushup: 410, situp: 520, jumping: 470, lunge: 330 }),
    P("Kiran Shah",    "#c9c19b,#9a8c5e", { friend: true,  steps: 24500, squat: 1150, pushup: 360, situp: 280, jumping: 520, lunge: 180 }),
    P("Adesh Pokhrel", "#9bb7c9,#5e7d99", { friend: false, steps: 41200, squat: 860, pushup: 940, situp: 700, jumping: 1020, lunge: 480 }),
    P("Maya Gurung",   "#caa6c9,#9a5e96", { friend: false, steps: 19800, squat: 410, pushup: 1180, situp: 360, jumping: 430, lunge: 210 }),
    P("Lauren Gabs",   "#c9b59b,#9a7d5e", { friend: false, steps: 17600, squat: 300, pushup: 260, situp: 220, jumping: 280, lunge: 140 }),
    P("Drake Parker",  "#9b9bc9,#5e5e9a", { friend: false, steps: 15200, squat: 260, pushup: 230, situp: 180, jumping: 240, lunge: 120 }),
    P("Joseph Owl",    "#9bc9c1,#5e9a8c", { friend: false, steps: 12900, squat: 210, pushup: 180, situp: 160, jumping: 200, lunge: 90 }),
  ];
  const totalReps = (p) => EX.reduce((a, e) => a + (p[e.key] || 0), 0);

  // rank PEOPLE by a metric ('steps' or an exercise key or 'reps' for all-rep total)
  function rankBy(metric, scope) {
    let list = PEOPLE.slice();
    if (scope === "friends") list = list.filter((p) => p.friend);
    const val = (p) => (metric === "reps" ? totalReps(p) : p[metric] || 0);
    return list.map((p) => ({ p, v: val(p) })).sort((a, b) => b.v - a.v).map((r, i) => ({ ...r, rank: i + 1 }));
  }

  // challenges — creator, exercise, schedule, visibility, status, members, your progress
  const CHALLENGES = [
    { id: "sq30",  n: "30-Day Squats",   ex: "squat",  by: "Adesh Pokhrel", byAv: "#9bb7c9,#5e7d99",
      range: "1–30 Jun", freq: "Daily", vis: "Public", status: "active", joined: true, loggedToday: false,
      day: 12, days: 30, myReps: 240, goal: 600, members: 245, cover: "linear-gradient(135deg,#1f6e5f,#2a9d8f)",
      desc: "Hit your squat count every day for 30 days. Reps are counted automatically by the camera." },
    { id: "pp",    n: "Push-up Power",   ex: "pushup", by: "Maya Gurung",   byAv: "#caa6c9,#9a5e96",
      range: "4–18 Jun", freq: "Daily", vis: "Public", status: "active", joined: true, loggedToday: false,
      day: 13, days: 14, myReps: 560, goal: 700, members: 132, cover: "linear-gradient(135deg,#8a5a1a,#e0922a)",
      desc: "Two weeks of push-ups. Beat the reference attempt and climb the board." },
    { id: "morn",  n: "Morning Movers · Squats", ex: "squat", by: "Sita Rai", byAv: "#a6c9b5,#5e996f",
      range: "1–21 Jul", freq: "Daily", vis: "Public", status: "upcoming", joined: true, loggedToday: false,
      day: 0, days: 21, startsIn: 3, myReps: 0, goal: 630, members: 54, cover: "linear-gradient(135deg,#155e63,#22a39a)",
      desc: "Kickstart each morning with squats. Starts soon — get ready." },
    { id: "mine",  n: "Squad Squats",   ex: "squat",  by: "Ema William", byAv: "#6a8caf,#33566f",
      range: "5–25 Jun", freq: "Daily", vis: "Private", status: "active", joined: true, createdByMe: true, loggedToday: true,
      day: 9, days: 21, myReps: 380, goal: 420, members: 23, cover: "linear-gradient(135deg,#155e63,#22a39a)",
      desc: "My private squad squat challenge — invite-only with close friends." },
    { id: "jj",    n: "Jumping Jack Blast", ex: "jumping", by: "Anita Malan", byAv: "#b8c6d1,#8aa0b3",
      range: "10–24 Jun", freq: "Daily", vis: "Public", status: "open", joined: false, full: true,
      day: 0, days: 14, myReps: 0, goal: 1400, members: 12400, cover: "linear-gradient(135deg,#7a2a6a,#c0398e)",
      desc: "Get your heart rate up — most jumping jacks over two weeks wins." },
    { id: "core",  n: "Core Crusher · Sit-ups", ex: "situp", by: "Sita Rai", byAv: "#a6c9b5,#5e996f",
      range: "1–15 Jul", freq: "Daily", vis: "Private", status: "open", joined: false,
      day: 0, days: 15, myReps: 0, goal: 750, members: 50, cover: "linear-gradient(135deg,#1e3a5a,#3b6eff)",
      desc: "A friends-only sit-up sprint. Invite only — compete with your circle." },
    { id: "wk",    n: "Weekend Push-up Sprint", ex: "pushup", by: "Ravi Thapa", byAv: "#c9a6a6,#a87766",
      range: "14–16 Jun", freq: "Daily", vis: "Public", status: "open", joined: false,
      day: 0, days: 3, myReps: 0, goal: 300, members: 640, cover: "linear-gradient(135deg,#5a3a8a,#7c5ce0)",
      desc: "A quick weekend push-up sprint — jump in, no pressure." },
    { id: "lng",   n: "Leg Day Lunges",  ex: "lunge",  by: "Kiran Shah",    byAv: "#c9c19b,#9a8c5e",
      range: "20 May–20 Jun", freq: "Daily", vis: "Public", status: "ended", joined: true, loggedToday: true,
      day: 30, days: 30, myReps: 196, goal: 600, members: 167, cover: "linear-gradient(135deg,#7a1f2a,#ef4444)",
      desc: "A full month of lunges. Now ended — check where you finished." },
  ];
  const todayTarget = (c) => Math.max(1, Math.round(c.goal / c.days));
  const daysLeft = (c) => Math.max(0, c.days - c.day);

  // members of a challenge ranked by reps (reuses PEOPLE, scaled up for a cumulative board)
  function challengeBoard(c) {
    const base = rankBy(c.ex, "all").map(({ p }, i) => ({ p, v: Math.round((p[c.ex] || 0) * (c.day ? c.day / 4 : 6) + 60 * (8 - i)) }));
    return base.sort((a, b) => b.v - a.v).map((r, i) => ({ ...r, rank: i + 1 }));
  }

  const fmt = (v) => (v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : "" + v);
  const grad = (av) => `linear-gradient(135deg,${av})`;

  return { ACT, EX, ME, PEOPLE, CHALLENGES, totalReps, rankBy, challengeBoard, todayTarget, daysLeft, fmt, grad };
})();
