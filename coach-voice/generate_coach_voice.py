#!/usr/bin/env python3
"""
Buzzend — AI workout coaching voice generator (ElevenLabs).

Generates the BURPEES + HIGH KNEES clips with the SAME voice/model/settings as the
existing coach-voice set (see transcript.txt): voice "Laura", model
eleven_multilingual_v2, stability 0.35 / style 0.55 / similarity 0.8 / speaker-boost on.
"[pause]" is rendered as <break time="0.3s"/>.

Usage:
    export ELEVENLABS_API_KEY=your_CURRENT_key      # use a rotated key; never commit it
    python3 generate_coach_voice.py                 # writes MP3s into ./new-voices/

Optional env:
    VOICE_ID=...      skip the name lookup and use this voice id directly
    VOICE_NAME=Laura  (default) resolved against your account's voices
    OUT_DIR=path      (default ./new-voices) — copy the files into app/src/main/res/raw/

Stdlib only (urllib) — no pip install needed.
"""
import os, sys, json, pathlib, urllib.request, urllib.error

API_KEY = os.environ.get("ELEVENLABS_API_KEY")
if not API_KEY:
    sys.exit("ERROR: set ELEVENLABS_API_KEY in your environment first (your current/rotated key).")

BASE       = "https://api.elevenlabs.io"
MODEL      = "eleven_multilingual_v2"
VOICE_NAME = os.environ.get("VOICE_NAME", "Laura")
VOICE_ID   = os.environ.get("VOICE_ID")
OUT        = pathlib.Path(os.environ.get("OUT_DIR", "new-voices"))
SETTINGS   = {"stability": 0.35, "similarity_boost": 0.8, "style": 0.55, "use_speaker_boost": True}

BRK = '<break time="0.3s"/>'   # "[pause]"

# filename -> spoken line (exact text from the brief; [pause] already expanded)
LINES = {
    # ── BURPEES ──
    "voice_burpees_finish_with_a_jump.mp3":
        f"Finish with a jump! {BRK} Even a small one off the floor counts.",
    "voice_burpees_feet_off_the_floor.mp3":
        f"Almost! {BRK} Get both feet right off the floor to finish.",
    "voice_burpees_lower_the_chest.mp3":
        f"Take your chest all the way down {BRK} before you come back up.",
    "voice_burpees_not_deep_enough.mp3":
        f"Full range on that one {BRK} — all the way down, all the way up.",
    "voice_burpees_too_fast.mp3":
        f"Steady it up a little {BRK} — control beats speed here.",
    # ── HIGH KNEES ──
    "voice_high_knees_turn_to_face_camera.mp3":
        f"Turn and face the camera {BRK} — I need a front view to count these.",
    "voice_high_knees_drive_the_knee_up.mp3":
        f"Drive that knee up {BRK} — lift it, don't kick it out.",
    "voice_high_knees_stay_on_one_spot.mp3":
        f"Stay on the spot {BRK} — keep those knees driving in one place.",
    "voice_high_knees_stand_tall_chest_up.mp3":
        f"Stand tall {BRK} — chest up and core tight.",
    "voice_high_knees_knees_not_high_enough.mp3":
        f"Higher with those knees {BRK} — aim to bring them up to hip height.",
    "voice_high_knees_too_fast.mp3":
        f"Ease off the pace a touch {BRK} — keep every knee drive clean.",
    # ── added 2026-10 ──
    "voice_high_knees_alternate_your_legs.mp3":
        f"Alternate your legs {BRK} — the same leg twice won't count.",
    "voice_burpees_stand_up_tall_to_start_again.mp3":
        f"Stand up tall to start again {BRK} — we'll pick that one up fresh.",
    "voice_burpees_keep_your_hands_in_frame.mp3":
        f"Keep your hands in the picture {BRK} — I need to see them to count.",
    # ── FULL BODY WORKOUT session cues (added 2026-10-14; plan §2.6) ──
    # iOS ships them without the "voice_" prefix (Resources/CoachVoice/routine_*.mp3).
    # Rest starts → "Rest. Next up: {exercise}" (one per exercise in a routine)
    "voice_routine_next_up_squats.mp3":        f"Rest. {BRK} Next up: squats.",
    "voice_routine_next_up_pushups.mp3":       f"Rest. {BRK} Next up: push-ups.",
    "voice_routine_next_up_burpees.mp3":       f"Rest. {BRK} Next up: burpees.",
    "voice_routine_next_up_jumping_jacks.mp3": f"Rest. {BRK} Next up: jumping jacks.",
    "voice_routine_next_up_high_knees.mp3":    f"Rest. {BRK} Next up: high knees.",
    # Rest before a framing change → "Turn your phone: {framing}" (one per framing key)
    "voice_routine_framing_side_knee.mp3":  f"Turn your phone: {BRK} side-on, phone at knee height.",
    "voice_routine_framing_side_floor.mp3": f"Turn your phone: {BRK} side-on, phone on the floor.",
    "voice_routine_framing_side_low.mp3":   f"Turn your phone: {BRK} side-on, phone low and angled up.",
    "voice_routine_framing_front.mp3":      f"Turn your phone: {BRK} front-on, phone propped up.",
    # Time ran out before the target
    "voice_routine_times_up.mp3":           f"Time's up. {BRK} Moving on.",
    # Set reached its target
    "voice_routine_nice_set.mp3":           "Nice set!",
    # 3-2-1 beats — the prep countdown and the last three seconds of every rest (one clip per number)
    "voice_routine_countdown_3.mp3":        "Three!",
    "voice_routine_countdown_2.mp3":        "Two!",
    "voice_routine_countdown_1.mp3":        "One!",
    # Routine ran to the end
    "voice_routine_complete.mp3":           f"Routine complete. {BRK} Great work!",
}

# ONLY="a.mp3,b.mp3" generates just those (leaves the rest untouched)
_only = os.environ.get("ONLY")
if _only:
    _want = {x.strip() for x in _only.split(",") if x.strip()}
    LINES = {k: v for k, v in LINES.items() if k in _want}


def _req(path, data=None, accept="application/json"):
    headers = {"xi-api-key": API_KEY, "Accept": accept}
    if data is not None:
        headers["Content-Type"] = "application/json"
    return urllib.request.Request(BASE + path, data=data, headers=headers,
                                  method="POST" if data is not None else "GET")


def resolve_voice_id():
    if VOICE_ID:
        return VOICE_ID
    try:
        with urllib.request.urlopen(_req("/v1/voices")) as r:
            voices = json.load(r).get("voices", [])
    except urllib.error.HTTPError as e:
        sys.exit(f"ERROR listing voices ({e.code}): {e.read().decode(errors='replace')}")
    match = [v for v in voices if v.get("name", "").lower() == VOICE_NAME.lower()]
    if not match:
        names = ", ".join(sorted(v.get("name", "?") for v in voices)) or "(none)"
        sys.exit(f"ERROR: voice '{VOICE_NAME}' not found. Available: {names}\n"
                 f"       Set VOICE_ID=... explicitly and re-run.")
    return match[0]["voice_id"]


def main():
    vid = resolve_voice_id()
    OUT.mkdir(parents=True, exist_ok=True)
    print(f"Voice '{VOICE_NAME}' -> {vid} · model {MODEL} · out {OUT.resolve()}\n")
    ok = 0
    for fname, text in LINES.items():
        body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": SETTINGS}).encode()
        try:
            with urllib.request.urlopen(_req(f"/v1/text-to-speech/{vid}", body, accept="audio/mpeg")) as r:
                (OUT / fname).write_bytes(r.read())
            print(f"  ✓ {fname}")
            ok += 1
        except urllib.error.HTTPError as e:
            print(f"  ✗ {fname} — HTTP {e.code}: {e.read().decode(errors='replace')[:200]}")
        except urllib.error.URLError as e:
            print(f"  ✗ {fname} — {e.reason}")
    print(f"\nDone: {ok}/{len(LINES)} clips in {OUT.resolve()}")
    if ok:
        print("Next: copy the .mp3 files into app/src/main/res/raw/ (names must match exactly).")


if __name__ == "__main__":
    main()
