/* Buzzend · Full Body Workout — configuration & logic (NO UI here).
   Config-driven: routines + their Beginner/Intermediate/Expert variants, the flat
   session sequence builder, time/rep estimates, and the transparent scoring model.
   Each routine stays in ONE camera framing (single-framing design) so the user never
   repositions mid-session. Exercise keys match the app's workout types + artwork keys. */
window.FullBody = (function () {

  /* Per-exercise camera framing, lifted from the pose engine's gates (aiflow GUIDE).
     Single-framing routines only mix exercises that share a framing; Total Body is the
     one mixed routine and cues the user whenever the framing changes.
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
    { id: "beginner",     n: "Beginner",     d: "Accessible reps · longer rest" },
    { id: "intermediate", n: "Intermediate", d: "Moderate reps · balanced pace" },
    { id: "expert",       n: "Expert",       d: "High reps · short rest · more rounds" },
  ];

  /* reps = target per exercise · sec = pacing target (seconds for that set, used for the
     "within pace" score and the soft time guide) · rest = seconds between sets · rounds = circuits. */
  const ROUTINES = [
    {
      id: "total-body", name: "Total Body", focus: "Full body", setup: "mixed",
      frame: "Side-on + front-on", grad: "linear-gradient(135deg,#C56DE2,#2F80ED 55%,#166E7A)",
      desc: "Every move in one circuit — legs, push, power and cardio, back to back.",
      steps: ["squat", "pushup", "burpee", "jumping", "highknee"],
      levels: {
        beginner:     { reps: { squat: 12, pushup: 8,  burpee: 6,  jumping: 20, highknee: 24 }, rest: 25, rounds: 1, sec: { squat: 30, pushup: 24, burpee: 24, jumping: 30, highknee: 28 } },
        intermediate: { reps: { squat: 18, pushup: 12, burpee: 10, jumping: 30, highknee: 40 }, rest: 18, rounds: 1, sec: { squat: 40, pushup: 34, burpee: 36, jumping: 40, highknee: 40 } },
        expert:       { reps: { squat: 25, pushup: 18, burpee: 15, jumping: 45, highknee: 60 }, rest: 12, rounds: 1, sec: { squat: 50, pushup: 46, burpee: 50, jumping: 55, highknee: 55 } },
      },
    },
    {
      id: "lower-power", name: "Lower Power", focus: "Legs + explosive", setup: "side",
      frame: "Side-on · knee height", grad: "linear-gradient(135deg,#C56DE2,#2F80ED)",
      desc: "A standing lower-body circuit: squats, then a burst of burpees.",
      steps: ["squat", "burpee"],
      levels: {
        beginner:     { reps: { squat: 12, burpee: 6 },  rest: 25, rounds: 1, sec: { squat: 30, burpee: 24 } },
        intermediate: { reps: { squat: 18, burpee: 10 }, rest: 18, rounds: 1, sec: { squat: 40, burpee: 36 } },
        expert:       { reps: { squat: 25, burpee: 15 }, rest: 12, rounds: 1, sec: { squat: 50, burpee: 50 } },
      },
    },
    {
      id: "cardio-blast", name: "Cardio Blast", focus: "Cardio", setup: "front",
      frame: "Front-on", grad: "linear-gradient(135deg,#166E7A,#A1663A)",
      desc: "Face-on cardio intervals to spike your heart rate and keep it there.",
      steps: ["jumping", "highknee"],
      levels: {
        beginner:     { reps: { jumping: 20, highknee: 24 }, rest: 20, rounds: 1, sec: { jumping: 30, highknee: 28 } },
        intermediate: { reps: { jumping: 30, highknee: 40 }, rest: 15, rounds: 1, sec: { jumping: 40, highknee: 40 } },
        expert:       { reps: { jumping: 45, highknee: 60 }, rest: 10, rounds: 1, sec: { jumping: 55, highknee: 55 } },
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
    if (ended) return { key: "interrupted", label: "Interrupted" };
    const allDone = results.length >= planned && results.every((r) => r.done >= r.target);
    if (allDone) return { key: "completed", label: "Completed" };
    return { key: "partial", label: "Partially completed" };
  }

  const cheer = (st) => ({
    completed: "Every target met — that's a clean sweep. Strong work! 💪",
    partial: "You showed up and put in real work. Chip away at those targets next time. 🙌",
    interrupted: "Something came up — no worries. The work you did still counts. 👍",
  }[st]);

  return { EX, REST_COLOR, LEVELS, ROUTINES, routine, buildSequence, totalExercises, totalReps, estSeconds, estMinutes, score, stars, band, status, cheer };
})();
