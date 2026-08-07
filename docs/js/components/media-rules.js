/* Media-selection rules — ONE implementation, shared by every surface that picks media.
   -------------------------------------------------------------------------------------
   A post is EITHER up to 10 photos OR one video. Never both.

   WHERE THIS RUNS, AND WHY IT MOVED. The rule used to be applied per-tap inside our own
   media grid, which could refuse a tile before the selection was ever invalid. That grid is
   gone (see photo-picker.js — Play rejected the permissions it needed), and the system
   picker can cap the item COUNT but cannot express "photos XOR video". So the same rule now
   runs on the way back OUT of the picker, via merge(): whatever fits is kept, the rest is
   dropped, and the caller shows ONE message.

   Two things any client must preserve:
     · merge() accumulates as it goes, so the rule is applied against the selection AS IT
       GROWS — picking 4 photos with 8 already held accepts exactly 2.
     · NOTHING is dropped silently. A pick can fail to land three ways — it breaks the rule,
       it is already in the post, or it is not a photo/video — and each says so. A pick that
       visibly does nothing is the failure mode this must never have. */
window.MediaRules = (function () {
  const MAX_IMAGES = 10;

  /* Toast copy. Short, because a toast is read in about a second and cannot be re-read once
     it fades — but still worded like a person, not a system constraint. Both halves matter:
     the first drafts were full sentences ("You can't mix photos with a video — pick one or
     the other.") and the correction overshot into telegraphese ("Already added"). */
  const MSG = {
    ALREADY_ADDED: "Already in your post",
    UNSUPPORTED: "That file isn't supported",
    // One message for BOTH directions of the mix. Which way the user tripped it is a
    // distinction the code cares about and the reader never did.
    NO_MIXING: "Choose photos or 1 video",
    ONE_VIDEO_ONLY: "One video per post",
    LIMIT_REACHED: `Up to ${MAX_IMAGES} photos per post`,
  };

  /* Identity is the item's own CONTENT reference — the URI on a real client. Never a library
     row index: picker results carry no stable row id on any platform, and camera captures have
     no library row at all.

     The fallback chain matters. With only `id ?? _li`, two items that happen to carry neither
     both key to `undefined`, compare equal, and get silently deduped as though they were the
     same photo. `g` (the gradient standing in for the content URI here) is the last resort so
     that cannot happen. */
  const key = (a) => {
    if (!a) return undefined;
    if (a.id != null) return "id:" + a.id;
    if (a._li != null) return "li:" + a._li;
    return "src:" + (a.g || a.ex || JSON.stringify(a));
  };

  /** Whether `candidate` may join `current`. Returns null when allowed, else the message. */
  function reject(current, candidate) {
    const hasVideo = current.some((x) => x.type === "video");
    if (candidate.type === "video") {
      if (hasVideo) return MSG.ONE_VIDEO_ONLY;
      if (current.length) return MSG.NO_MIXING;
      return null;
    }
    if (candidate.type === "image") {
      if (hasVideo) return MSG.NO_MIXING;
      if (current.filter((x) => x.type === "image").length >= MAX_IMAGES) return MSG.LIMIT_REACHED;
      return null;
    }
    return MSG.UNSUPPORTED;
  }

  /**
   * Fold a picker result into an existing selection.
   * @returns {{selection: Array, message: string|null}} — one message at most: a rule
   *   rejection outranks an already-added note, being the more actionable of the two.
   */
  function merge(current, picked) {
    const selection = current.slice();
    let rule = null, dup = null;
    picked.forEach((item) => {
      if (selection.some((x) => key(x) === key(item))) { dup = dup || MSG.ALREADY_ADDED; return; }
      const why = reject(selection, item);
      if (why) { rule = rule || why; return; }
      selection.push(item);
    });
    return { selection, message: rule || dup };
  }

  /**
   * How many more photos may be added — the number handed to the picker as its item cap, and
   * the number shown to the user before it opens. Same source, so the copy cannot promise a
   * budget the picker then contradicts.
   *
   * ZERO for a video post. That is a mixing rule, not a cap: callers that distinguish the two
   * must test for a video first.
   */
  function remaining(current) {
    if (current.some((x) => x.type === "video")) return 0;
    return Math.max(0, MAX_IMAGES - current.filter((x) => x.type === "image").length);
  }

  /** "You can add 1 more photo" / "…7 more photos". Singular at one is not optional — the
      add-more sheet shows this every time it opens, so the last slot is the most-read case. */
  function remainingLabel(n) {
    return `You can add ${n} more ${n === 1 ? "photo" : "photos"}`;
  }

  return { MAX_IMAGES, MSG, merge, remaining, remainingLabel, reject, key };
})();
