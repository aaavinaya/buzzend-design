#!/usr/bin/env node
/*
 * Generates the Full Body Workout "must-match" data FROM the prototype's single source of
 * truth, docs/js/screens/full-body-data.js, so the web prototype, iOS and Android cannot drift.
 *
 *   node parity/tools/gen-full-body-routines.mjs
 *
 * Writes (into parity/shared/):
 *   full_body_routines.json  — the routine config both apps ship (iOS bundle, Android assets/).
 *   full_body_expected.json  — expected outputs of buildSequence / totals / estimates / scoring,
 *                              computed by the prototype's OWN functions; both apps' unit tests
 *                              assert against it.
 *
 * Nothing here re-implements the logic: every expected value is the JS function's return value.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const src = readFileSync(join(root, "docs/js/screens/full-body-data.js"), "utf8");
const sandbox = { window: {} };
vm.runInNewContext(src, sandbox);
const FB = sandbox.window.FullBody;

// Framing keys (plan §2.1). The prototype stores framing as display text; the key is derived from it.
const FRAMING_KEY = {
  "Side-on · phone at knee height": "side_knee",
  "Side-on · phone on the floor": "side_floor",
  "Side-on · phone low, angled up": "side_low",
  "Front-on · phone propped up": "front",
};

const framings = {};
const exercises = {};
for (const [key, ex] of Object.entries(FB.EX)) {
  const framing = FRAMING_KEY[ex.frame];
  if (!framing) throw new Error(`no framing key for "${ex.frame}"`);
  framings[framing] = ex.frame;
  exercises[key] = { name: ex.n, color: ex.c.toUpperCase(), kcalPerRep: ex.kcal, framing };
}

// "linear-gradient(135deg,#ef4444,#7c3aed 55%,#3b6eff)" → { angle, stops[{color, location}] }.
// Stops without a position are placed per CSS: first 0, last 1, the rest evenly between neighbours.
function parseGradient(css) {
  const m = /^linear-gradient\((\d+)deg,(.*)\)$/.exec(css.replace(/\s*,\s*/g, ","));
  if (!m) throw new Error(`unparsed gradient ${css}`);
  const stops = m[2].split(",").map((s) => {
    const [color, pos] = s.trim().split(/\s+/);
    return { color: color.toUpperCase(), location: pos ? parseFloat(pos) / 100 : null };
  });
  if (stops[0].location === null) stops[0].location = 0;
  if (stops[stops.length - 1].location === null) stops[stops.length - 1].location = 1;
  for (let i = 1; i < stops.length - 1; i++) {
    if (stops[i].location !== null) continue;
    let j = i; while (stops[j].location === null) j++;
    const a = stops[i - 1].location, b = stops[j].location, n = j - i + 1;
    for (let k = i; k < j; k++) stops[k].location = a + ((b - a) * (k - i + 1)) / n;
  }
  return { angle: Number(m[1]), stops };
}

const routines = FB.ROUTINES.map((rt) => ({
  id: rt.id,
  name: rt.name,
  focus: rt.focus,
  description: rt.desc,
  frame: rt.frame,
  setup: rt.setup,
  mixedFraming: rt.setup === "mixed",
  gradient: parseGradient(rt.grad),
  steps: rt.steps,
  levels: rt.levels,
}));

const config = {
  version: 1,
  restColor: FB.REST_COLOR.toUpperCase(),
  levels: FB.LEVELS.map((l) => ({ id: l.id, name: l.n, description: l.d })),
  framings,
  exercises,
  routines,
};

// ── expected outputs (computed by the prototype's own functions) ──
const plans = [];
for (const rt of FB.ROUTINES) {
  for (const l of FB.LEVELS) {
    plans.push({
      routine: rt.id,
      level: l.id,
      sequence: FB.buildSequence(rt, l.id),
      totalExercises: FB.totalExercises(rt, l.id),
      totalReps: FB.totalReps(rt, l.id),
      estSeconds: FB.estSeconds(rt, l.id),
      estMinutes: FB.estMinutes(rt, l.id),
    });
  }
}

const r = (ex, target, done, sec, targetSec) => ({ ex, target, done, sec, targetSec });
const scoringCases = [
  { name: "empty", results: [], planned: 5, ended: true },
  { name: "zero reps", results: [r("squat", 12, 0, 30, 30)], planned: 5, ended: true },
  { name: "perfect total body beginner", results: [r("squat", 12, 12, 25, 30), r("pushup", 8, 8, 20, 24), r("burpee", 6, 6, 22, 24), r("jumping", 20, 20, 28, 30), r("highknee", 24, 24, 26, 28)], planned: 5, ended: false },
  { name: "overtime but complete", results: [r("squat", 12, 12, 40, 30), r("burpee", 6, 6, 27, 24)], planned: 2, ended: false },
  { name: "pace boundary 115%", results: [r("pushup", 12, 12, 39, 34), r("pushup", 12, 12, 40, 34)], planned: 2, ended: false },
  { name: "skipped set", results: [r("squat", 18, 18, 35, 40), r("pushup", 12, 5, 34, 34), r("burpee", 10, 10, 30, 36)], planned: 5, ended: false },
  { name: "over target is capped", results: [r("jumping", 20, 26, 29, 30)], planned: 2, ended: false },
  { name: "ended early", results: [r("squat", 25, 25, 48, 50), r("pushup", 18, 9, 30, 46)], planned: 5, ended: true },
  { name: "all sets but one short", results: [r("jumping", 45, 45, 50, 55), r("highknee", 60, 59, 55, 55)], planned: 2, ended: false },
];
const scoring = scoringCases.map((c) => {
  const sc = FB.score(c.results);
  const st = FB.status(c.results, c.planned, c.ended);
  const kcal = Math.round(c.results.reduce((a, x) => a + x.done * FB.EX[x.ex].kcal, 0));
  return { ...c, expected: { ...sc, stars: FB.stars(sc.total), band: FB.band(sc.total), status: st.key, statusLabel: st.label, kcal } };
});

const thresholds = [0, 39, 40, 59, 60, 74, 75, 89, 90, 100].map((s) => ({ score: s, stars: FB.stars(s), band: FB.band(s) }));

const expected = { generatedFrom: "docs/js/screens/full-body-data.js", plans, scoring, thresholds };

const out = join(root, "parity/shared");
writeFileSync(join(out, "full_body_routines.json"), JSON.stringify(config, null, 2) + "\n");
writeFileSync(join(out, "full_body_expected.json"), JSON.stringify(expected, null, 2) + "\n");
console.log(`wrote ${join(out, "full_body_routines.json")}\nwrote ${join(out, "full_body_expected.json")}`);
