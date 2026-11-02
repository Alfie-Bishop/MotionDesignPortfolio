/* =========================================================================
   TEMPORARY DIAGNOSTICS - only loaded when the URL has ?debug.
   Shows a live panel: render frames, timers, videos, CMS, carousels and a
   timestamped log of events/errors, to find why iOS Safari freezes the
   homepage on first load until the phone is rotated. Remove once fixed.
   ========================================================================= */
(function () {
  var t0 = performance.now();
  var now = function () { return Math.round(performance.now() - t0); };
  var log = [];
  var add = function (msg) {
    log.push(now() + "ms " + msg);
    if (log.length > 60) log.splice(0, log.length - 60);
  };

  add("debug start, vis=" + document.visibilityState + " " + innerWidth + "x" + innerHeight);

  window.addEventListener("error", function (e) {
    add("ERROR " + e.message + " @" + (e.filename || "").split("/").pop() + ":" + e.lineno);
  });
  window.addEventListener("unhandledrejection", function (e) {
    add("REJECT " + (e.reason && e.reason.message ? e.reason.message : e.reason));
  });
  ["visibilitychange", "pageshow", "pagehide", "resize", "orientationchange", "focus", "blur"].forEach(function (ev) {
    (ev === "visibilitychange" ? document : window).addEventListener(ev, function () {
      add(ev + " vis=" + document.visibilityState + " " + innerWidth + "x" + innerHeight);
    });
  });
  document.addEventListener("DOMContentLoaded", function () { add("DOMContentLoaded"); });
  window.addEventListener("load", function () { add("load"); });
  ["touchstart", "scroll"].forEach(function (ev) {
    var seen = false;
    window.addEventListener(ev, function () { if (!seen) { seen = true; add("first " + ev); } }, { passive: true });
  });

  // Render frames: requestAnimationFrame only runs when Safari is actually
  // producing frames, so a gap here means the page stopped rendering.
  var frames = 0, lastFrame = performance.now();
  (function tick() {
    var t = performance.now();
    if (t - lastFrame > 700) add("RENDER GAP " + Math.round(lastFrame - t0) + "->" + now() + "ms");
    lastFrame = t;
    frames++;
    requestAnimationFrame(tick);
  })();

  // Timers: a gap here means the main thread was blocked or throttled.
  var lastTimer = performance.now();
  setInterval(function () {
    var t = performance.now();
    if (t - lastTimer > 1500) add("TIMER GAP " + Math.round(lastTimer - t0) + "->" + now() + "ms");
    lastTimer = t;
  }, 500);

  // Count WAAPI animations started and ResizeObserver callbacks (the
  // carousels use both) to catch a rebuild loop.
  var animateCalls = 0, roCalls = 0;
  var origAnimate = Element.prototype.animate;
  if (origAnimate) {
    Element.prototype.animate = function () {
      animateCalls++;
      if (animateCalls <= 8) add("animate() on ." + (this.className || this.tagName));
      return origAnimate.apply(this, arguments);
    };
  }
  if (window.ResizeObserver) {
    var OrigRO = window.ResizeObserver;
    window.ResizeObserver = function (cb) {
      return new OrigRO(function (entries, obs) {
        roCalls++;
        if (roCalls <= 8) add("ResizeObserver cb w=" + Math.round(entries[0].contentRect.width));
        return cb(entries, obs);
      });
    };
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { add("fonts.ready"); });
  }

  // CMS: cms.js defines window.CMS_READY later, so poll for it.
  var cmsWatch = setInterval(function () {
    if (!window.CMS_READY) return;
    clearInterval(cmsWatch);
    add("CMS_READY defined");
    window.CMS_READY.then(function () {
      add("CMS resolved: " + (window.PROJECTS || []).length + " projects, " + (window.CLIENTS || []).length + " clients");
    });
  }, 20);

  var videoEvents = ["loadedmetadata", "canplay", "play", "playing", "pause", "waiting", "stalled", "suspend", "error"];
  var hooked = [];
  function hookVideos() {
    document.querySelectorAll("video").forEach(function (v, i) {
      if (hooked.indexOf(v) !== -1) return;
      hooked.push(v);
      var counts = {};
      videoEvents.forEach(function (ev) {
        v.addEventListener(ev, function () {
          counts[ev] = (counts[ev] || 0) + 1;
          if (counts[ev] <= 2) add("video" + i + " " + ev + (ev === "error" && v.error ? " code=" + v.error.code : ""));
        });
      });
    });
  }

  function trackInfo(sel) {
    var t = document.querySelector(sel);
    if (!t) return "missing";
    var a = t.getAnimations ? t.getAnimations()[0] : null;
    var x = 0;
    try { x = Math.round(new DOMMatrix(getComputedStyle(t).transform).m41); } catch (e) {}
    return t.children.length + " items, anim=" + (a ? a.playState + " t=" + Math.round(a.currentTime) : "none") +
      ", x=" + x + ", wrapW=" + (t.parentElement ? t.parentElement.clientWidth : "?");
  }

  var panel;
  function render() {
    if (!panel) {
      if (!document.body) return;
      panel = document.createElement("pre");
      panel.style.cssText =
        "position:fixed;left:4px;right:4px;top:4px;z-index:2147483647;max-height:48vh;overflow:auto;" +
        "margin:0;padding:6px 8px;background:rgba(0,0,0,.85);color:#d6ff3f;font:10px/1.35 ui-monospace,Menlo,monospace;" +
        "white-space:pre-wrap;border:1px solid #d6ff3f;border-radius:6px;pointer-events:auto;";
      document.body.appendChild(panel);
      add("panel attached");
    }
    hookVideos();
    var vids = Array.prototype.map.call(document.querySelectorAll("video"), function (v, i) {
      return "video" + i + ": " + (v.paused ? "PAUSED" : "playing") + " rs=" + v.readyState + " ns=" + v.networkState +
        " t=" + v.currentTime.toFixed(1) + (v.error ? " err=" + v.error.code : "");
    });
    panel.textContent =
      "DEBUG  " + now() + "ms  frames=" + frames + "  vis=" + document.visibilityState + "  " + innerWidth + "x" + innerHeight + "\n" +
      navigator.userAgent.replace(/^Mozilla\/5\.0 /, "") + "\n" +
      "animate()=" + animateCalls + "  RO cb=" + roCalls + "\n" +
      "fan:   " + trackInfo("#fan-track") + "\n" +
      "logos: " + trackInfo(".logo-track") + "\n" +
      vids.join("\n") + "\n" +
      "--- log ---\n" + log.slice().reverse().join("\n");
  }
  setInterval(render, 250);
  document.addEventListener("DOMContentLoaded", render);
})();
