/* ABOUT US — Coffee Shop animations (scoped to #about) */
(function () {
  "use strict";

  var root = document.getElementById("about");
  if (!root) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("ab-js");

  /* 1. Split titles into words for a masked word-by-word reveal */
  root.querySelectorAll("[data-ab-split]").forEach(function (title) {
    var i = 0;
    function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var outer = document.createElement("span");
            var inner = document.createElement("span");
            outer.className = "ab-w";
            inner.textContent = part;
            inner.style.setProperty("--i", i++);
            outer.appendChild(inner);
            frag.appendChild(outer);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrap(child);
        }
      });
    }
    wrap(title);
  });

  /* 2. Stagger delays for siblings that reveal together */
  var reveals = root.querySelectorAll(".ab-reveal, .ab-reveal-img, [data-ab-split]");
  var counters = new Map();
  reveals.forEach(function (el) {
    var parent = el.parentElement;
    var n = counters.get(parent) || 0;
    el.style.setProperty("--ab-delay", (n * 0.1) + "s");
    counters.set(parent, n + 1);
  });

  /* 3. Count-up numbers */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    var run = (el._abRun = (el._abRun || 0) + 1);
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var duration = 2000, start = null;
    function step(ts) {
      if (run !== el._abRun) return; // reset while counting
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 4))).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function resetCount(el) {
    delete el.dataset.done;
    el._abRun = (el._abRun || 0) + 1;
    el.textContent = "0";
  }

  function counters(el) {
    var list = Array.prototype.slice.call(el.querySelectorAll("[data-count]"));
    if (el.dataset.count) list.push(el);
    return list;
  }

  function show(el) {
    el.classList.add("is-visible");
    counters(el).forEach(countUp);
  }

  function hide(el) {
    el.classList.remove("is-visible");
    counters(el).forEach(resetCount);
  }

  if ("IntersectionObserver" in window) {
    /* Elements hidden with clip-path never "intersect" (Chrome applies the
       target's own clip), so we watch their unclipped parent instead. */
    var targets = new Map();
    reveals.forEach(function (el) {
      var target = el.classList.contains("ab-reveal-img") ? el.parentElement : el;
      if (!targets.has(target)) targets.set(target, []);
      targets.get(target).push(el);
    });

    /* Play when the element enters the viewport… */
    var showIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) targets.get(entry.target).forEach(show);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    /* …and reset once it has fully left, so it replays every time
       (scrolling down or back up). */
    var hideIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) targets.get(entry.target).forEach(hide);
      });
    }, { threshold: 0 });

    targets.forEach(function (els, target) {
      showIO.observe(target);
      hideIO.observe(target);
    });
  } else {
    reveals.forEach(show);
  }

  if (reduceMotion) {
    root.querySelectorAll(".ab-photo img").forEach(function (img) { img.style.transform = "none"; });
    return;
  }

  /* 4. Smooth scroll parallax for photos and the stats background */
  var layers = Array.prototype.slice.call(root.querySelectorAll("[data-ab-speed]"));
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    layers.forEach(function (el) {
      var box = (el.closest(".ab-photo, .ab-band") || el).getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      var offset = (box.top + box.height / 2 - vh / 2) * parseFloat(el.dataset.abSpeed);
      var scale = el.tagName === "IMG" ? " scale(1.12)" : "";
      el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)" + scale;
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
