/* Create menu — the bottom sheet shown when the "+" FAB is tapped.
   Three entries: AI Workout (single-exercise rep counting), Full Body Workout (a
   guided multi-exercise routine), and Record or Upload (camera/gallery → compose).
   Reusable; needs dialog.js + icons.js. Relative links assume the caller is in screens/home/. */
window.CreateMenu = (function () {
  const I = (n, s) => window.Icons.svg(n, s);
  function open() {
    Buzzend.sheet({ html: `<div class="cm-menu">
      <div class="cm-mhead"><div class="cm-mtitle">Create</div><div class="cm-msub">Pick how you want to move</div></div>
      <button class="cm-opt" onclick="location.href='../workout/moment.html'">
        <span class="cm-oi">${I("zap", 22)}</span>
        <div class="cm-otx"><b>AI Workout</b><span>Count reps automatically with the camera</span></div>
        <span class="cm-go">${I("chevron", 18)}</span></button>
      <button class="cm-opt" onclick="location.href='../workout/full-body.html'">
        <span class="cm-oi">${I("dumbbell", 22)}</span>
        <div class="cm-otx"><b>Full Body Workout <em class="cm-new">NEW</em></b><span>Guided routine — multiple exercises, rounds &amp; rest</span></div>
        <span class="cm-go">${I("chevron", 18)}</span></button>
      <button class="cm-opt" onclick="location.href='capture.html?purpose=post'">
        <span class="cm-oi">${I("camera", 22)}</span>
        <div class="cm-otx"><b>Record or Upload</b><span>Capture a photo / video or pick from your gallery</span></div>
        <span class="cm-go">${I("chevron", 18)}</span></button>
    </div>` });
  }
  return { open };
})();
