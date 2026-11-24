/* Buzzend · Full Body Workout — configuration & logic (NO UI here).
   Config-driven: routines + their Beginner/Intermediate/Expert variants, the flat
   session sequence builder, time/rep estimates, and the transparent scoring model.
   Each routine stays in ONE camera framing (single-framing design) so the user never
   repositions mid-session. Exercise keys match the app's workout types + artwork keys. */
window.FullBody = (function () {

  /* Per-exercise camera framing, lifted from the pose engine's gates (aiflow GUIDE).
     Every routine runs the front-on cardio moves first, then the side-on moves, so the user
     repositions the phone once and is cued at that change.
     c = the exercise's identity colour (timer ring, progress segments, list tints). */
  const EX = {
    squat:    { n: "Squats",        i: "squat",     frame: "Side-on · phone at knee height", kcal: 0.45, c: "#C56DE2" },
    burpee:   { n: "Burpees",       i: "burpee",    frame: "Side-on · phone low, angled up",  kcal: 0.75, c: "#2F80ED" },
    pushup:   { n: "Push-ups",      i: "pushup",    frame: "Side-on · phone on the floor",    kcal: 0.35, c: "#F5A623" },
    jumping:  { n: "Jumping Jacks", i: "jumping",   frame: "Front-on · phone propped up",     kcal: 0.25, c: "#166E7A" },
    highknee: { n: "High Knees",    i: "high-knee", frame: "Front-on · phone propped up",     kcal: 0.22, c: "#A1663A" },
  };
  // the rest countdown is neutral slate so it never reads as an exercise (Jumping Jacks owns teal)
  const REST_COLOR = "#64748B";

  const LEVELS = [
    { id: "beginner",     n: "Easy",   d: "Accessible reps · longer rest" },
    { id: "intermediate", n: "Medium", d: "Moderate reps · balanced pace" },
    { id: "expert",       n: "Hard",   d: "High reps · short rest · faster pace" },
  ];

  /* reps = target per exercise · sec = pacing target (seconds for that set, used for the
     "within pace" score and the soft time guide) · rest = seconds between sets · rounds = circuits. */
  const ROUTINES = [
    {
      id: "basics", icon: "fb-basics", name: "Trio", focus: "Beginner friendly", setup: "mixed",
      frame: "Front-on + side-on", grad: "linear-gradient(135deg,#F5A623,#C56DE2 55%,#166E7A)",
      desc: "Jumping jacks, high knees and squats — a simple full-body start.",
      steps: ["jumping", "highknee", "squat"],
      levels: {
        beginner:     { reps: { jumping: 20, highknee: 20, squat: 15 }, rest: 25, rounds: 1, sec: { jumping: 30, highknee: 35, squat: 40 } },
        intermediate: { reps: { jumping: 30, highknee: 35, squat: 20 }, rest: 20, rounds: 1, sec: { jumping: 40, highknee: 50, squat: 45 } },
        expert:       { reps: { jumping: 50, highknee: 55, squat: 40 }, rest: 15, rounds: 1, sec: { jumping: 65, highknee: 65, squat: 80 } },
      },
    },
    {
      id: "power", icon: "fb-strength", name: "Quad", focus: "Strength + cardio", setup: "mixed",
      frame: "Front-on + side-on", grad: "linear-gradient(135deg,#166E7A,#C56DE2 55%,#F5A623)",
      desc: "Cardio to warm up, then squats and push-ups for strength.",
      steps: ["jumping", "highknee", "squat", "pushup"],
      levels: {
        beginner:     { reps: { jumping: 20, highknee: 25, squat: 15, pushup: 10 }, rest: 25, rounds: 1, sec: { jumping: 30, highknee: 45, squat: 40, pushup: 30 } },
        intermediate: { reps: { jumping: 40, highknee: 40, squat: 30, pushup: 15 }, rest: 20, rounds: 1, sec: { jumping: 55, highknee: 55, squat: 70, pushup: 45 } },
        expert:       { reps: { jumping: 50, highknee: 55, squat: 40, pushup: 25 }, rest: 15, rounds: 1, sec: { jumping: 65, highknee: 65, squat: 80, pushup: 65 } },
      },
    },
    {
      id: "total-body", icon: "fb-max", name: "Penta", focus: "All-out", setup: "mixed",
      frame: "Front-on + side-on", grad: "linear-gradient(135deg,#C56DE2,#2F80ED 55%,#166E7A)",
      desc: "Every move in one circuit — cardio, legs, push and a burpee finish.",
      steps: ["jumping", "highknee", "squat", "pushup", "burpee"],
      levels: {
        beginner:     { reps: { jumping: 20, highknee: 25, squat: 15, pushup: 10, burpee: 10 }, rest: 25, rounds: 1, sec: { jumping: 30, highknee: 45, squat: 40, pushup: 30, burpee: 40 } },
        intermediate: { reps: { jumping: 40, highknee: 40, squat: 30, pushup: 20, burpee: 15 }, rest: 20, rounds: 1, sec: { jumping: 55, highknee: 55, squat: 70, pushup: 60, burpee: 55 } },
        expert:       { reps: { jumping: 60, highknee: 60, squat: 50, pushup: 30, burpee: 25 }, rest: 15, rounds: 1, sec: { jumping: 75, highknee: 70, squat: 100, pushup: 80, burpee: 85 } },
      },
    },
  ];

  const routine = (id) => ROUTINES.find((r) => r.id === id) || ROUTINES[0];

  /* Flatten (rounds × exercises) into an ordered run list, interleaving rest between
     every set except the last. Each exercise item carries its 1-based index / total. */
  function buildSequence(rt, levelId) {
    const lv = rt.levels[levelId];
    const totalEx = rt.steps.length * lv.rounds;
    const seq = [];
    let idx = 0;
    for (let r = 0; r < lv.rounds; r++) {
      rt.steps.forEach((k, si) => {
        idx++;
        seq.push({ type: "exercise", ex: k, reps: lv.reps[k], sec: lv.sec[k], idx, total: totalEx, round: r + 1, rounds: lv.rounds });
        const isLast = r === lv.rounds - 1 && si === rt.steps.length - 1;
        if (!isLast) seq.push({ type: "rest", sec: lv.rest });
      });
    }
    // link each rest to the next exercise for the "next up" preview
    seq.forEach((s, i) => {
      if (s.type === "rest") {
        const nx = seq.slice(i + 1).find((x) => x.type === "exercise");
        s.nextEx = nx ? nx.ex : null;
        s.nextIdx = nx ? nx.idx : null;
      }
    });
    return seq;
  }

  const totalExercises = (rt, levelId) => rt.steps.length * rt.levels[levelId].rounds;
  function totalReps(rt, levelId) {
    const lv = rt.levels[levelId];
    return rt.steps.reduce((a, k) => a + lv.reps[k], 0) * lv.rounds;
  }
  function estSeconds(rt, levelId) {
    return buildSequence(rt, levelId).reduce((a, x) => a + x.sec, 0);
  }
  const estMinutes = (rt, levelId) => Math.max(1, Math.round(estSeconds(rt, levelId) / 60));

  /* Transparent, effort-weighted score.
     results: [{ ex, target, done, sec, targetSec }] — one row per completed/attempted set.
     55% reps completed · 25% exercises fully done · 20% done within a fair pace window. */
  function score(results) {
    const sumTarget = results.reduce((a, r) => a + r.target, 0);
    const sumDone = results.reduce((a, r) => a + Math.min(r.done, r.target), 0);
    const repScore = sumTarget ? sumDone / sumTarget : 0;
    const exFull = results.filter((r) => r.done >= r.target).length;
    const exScore = results.length ? exFull / results.length : 0;
    const paced = results.filter((r) => r.done >= r.target && r.sec <= r.targetSec * 1.15).length;
    const paceScore = results.length ? paced / results.length : 0;
    const total = Math.round(100 * (0.55 * repScore + 0.25 * exScore + 0.20 * paceScore));
    const repsDone = results.reduce((a, r) => a + r.done, 0);
    return { total, repScore, exScore, paceScore, exFull, repsDone, repsTarget: sumTarget };
  }

  const stars = (s) => (s >= 90 ? 5 : s >= 75 ? 4 : s >= 60 ? 3 : s >= 40 ? 2 : 1);
  const band = (s) => (s >= 90 ? "Outstanding" : s >= 75 ? "Strong effort" : s >= 60 ? "Solid work" : s >= 40 ? "Keep building" : "Good start");

  /* status from the per-set results + whether the user ended early. */
  function status(results, planned, ended) {
    if (ended) return { key: "ended", label: "Ended early" };
    const allDone = results.length >= planned && results.every((r) => r.done >= r.target);
    if (allDone) return { key: "completed", label: "Completed" };
    return { key: "partial", label: "Partially completed" };
  }

  const cheer = (st) => ({
    completed: "Every target met — that's a clean sweep. Strong work! 💪",
    partial: "You showed up and put in real work. Chip away at those targets next time. 🙌",
    ended: "Something came up — no worries. The work you did still counts. 👍",
  }[st]);

  return { EX, REST_COLOR, LEVELS, ROUTINES, routine, buildSequence, totalExercises, totalReps, estSeconds, estMinutes, score, stars, band, status, cheer };
})();
