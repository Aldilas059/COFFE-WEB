/* OUR SERVICES — scroll reveal (scoped to #services) */
(function () {
  "use strict";

  var root = document.getElementById("services");
  if (!root || !("IntersectionObserver" in window)) return;

  root.classList.add("sv-js");

  var observer = new IntersectionObserver(function (entries) {
    var order = 0;
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      var delay = order++ * 120;
      setTimeout(function () { el.classList.add("sv-visible"); }, delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12 });

  root.querySelectorAll(".sv-reveal").forEach(function (el) { observer.observe(el); });
})();
