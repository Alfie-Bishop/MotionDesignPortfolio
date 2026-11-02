/* =========================================================================
   SHARED BEHAVIOUR: header, mobile nav, scroll reveal, logo marquee,
   contact form. Runs on every page.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  initHeader();
  initMobileNav();
  initContactForm();

  // Everything below depends on live data fetched from the Google Sheet CMS
  // (assets/js/cms.js) - wait for it before rendering anything that reads
  // PROJECTS / CLIENTS / CATEGORY_LABELS.
  if (window.CMS_READY) await window.CMS_READY;

  initLogoMarquee();
  initFanWheel();
  initStatCounts();
  initScrollReveal();
});

function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function initMobileNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => nav.classList.toggle("is-open"));
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => nav.classList.remove("is-open"))
  );
}

function initScrollReveal() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

function initLogoMarquee() {
  const tracks = document.querySelectorAll(".logo-track");
  if (!tracks.length || typeof CLIENTS === "undefined") return;
  const items = CLIENTS.map((c) => `<span class="logo-item">${c.name}</span>`).join("");
  // two rows of the same list, the data-reverse one scrolling the other way
  tracks.forEach((track) => startMarquee(track, items, 110, track.hasAttribute("data-reverse")));
}

/* Seamless left-scrolling loop. Measures one set of items, repeats it until
   it covers the visible width (so wide screens never show a gap), doubles
   that, and slides by exactly one copy in pixels. Driven from JS rather than
   a CSS keyframe so it only starts once the CMS content is in place - iOS
   Safari freezes a CSS -50% animation that began on an empty track until
   the phone is rotated. Rebuilds when the width changes or webfonts load.
   reverse = scroll right instead of left. */
function startMarquee(track, itemsHTML, pxPerSecond, reverse = false) {
  const wrap = track.parentElement;
  let anim = null;
  let lastWidth = 0;

  const build = () => {
    const wrapWidth = wrap.clientWidth;
    if (!wrapWidth) return;
    lastWidth = wrapWidth;

    track.innerHTML = itemsHTML;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const setWidth = track.scrollWidth + gap;
    const copies = Math.max(1, Math.ceil(wrapWidth / setWidth));
    track.innerHTML = itemsHTML.repeat(copies * 2);

    const distance = setWidth * copies;
    const progress = anim ? anim.effect.getComputedTiming().progress || 0 : 0;
    if (anim) anim.cancel();
    const frames = [{ transform: "translateX(0)" }, { transform: `translateX(-${distance}px)` }];
    if (reverse) frames.reverse();
    anim = track.animate(
      frames,
      { duration: (distance / pxPerSecond) * 1000, iterations: Infinity }
    );
    anim.currentTime = progress * anim.effect.getTiming().duration;
  };

  build();
  if (document.fonts) document.fonts.ready.then(build);
  new ResizeObserver(() => {
    if (wrap.clientWidth !== lastWidth) build();
  }).observe(wrap);

  if (track.dataset.hoverPause !== undefined && matchMedia("(hover: hover)").matches) {
    track.addEventListener("mouseenter", () => anim && anim.pause());
    track.addEventListener("mouseleave", () => anim && anim.play());
  }
}

// Fills any [data-stat="client-count"] element with the live client count
// from the CMS, so the "15+ clients" style stats never go stale.
function initStatCounts() {
  if (typeof CLIENTS === "undefined") return;
  document.querySelectorAll('[data-stat="client-count"]').forEach((el) => {
    el.textContent = `${CLIENTS.length}+`;
  });
}

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const success = document.querySelector("#contact-success");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // No backend is wired up yet. Replace this block with a fetch() call
    // to your form handler (e.g. Formspree, Framer forms, or your own endpoint).
    form.reset();
    if (success) success.classList.add("is-visible");
  });
}

/* =========================================================================
   SHARED RENDER HELPERS
   ========================================================================= */

function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}

function categoryTagList(categories) {
  return categories
    .map((c) => `<span class="pd-tag">${CATEGORY_LABELS[c] || c}</span>`)
    .join("");
}

/* =========================================================================
   HOMEPAGE CAROUSEL
   Every live project from the CMS, side by side, scrolling left
   continuously in a seamless loop (shares startMarquee with the client
   logo marquee), never pausing on hover.
   ========================================================================= */
function initFanWheel() {
  const track = document.getElementById("fan-track");
  if (!track || typeof PROJECTS === "undefined" || !PROJECTS.length) return;

  const cardHTML = PROJECTS
    .map(
      (project) => `
      <a class="fan-card" href="project.html?p=${project.slug}" aria-label="${project.title}">
        <span class="thumb-bg" style="background:${project.thumb.bg}"></span>
      </a>`
    )
    .join("");

  startMarquee(track, cardHTML, 30);
}

function projectCardHTML(project) {
  const cats = project.categories.join(" ");
  const meta = [project.client, project.agency].filter(Boolean).join(" · ");
  return `
    <a class="project-card" href="project.html?p=${project.slug}" data-categories="${cats}" data-reveal>
      <div class="card-media">
        <div class="thumb-bg" style="background:${project.thumb.bg}"></div>
        <div class="thumb-overlay"></div>
        <span class="card-tag">${project.thumb.label}</span>
      </div>
      <div class="card-body">
        <h3>${project.title}</h3>
        <div class="card-meta">
          <span>${meta}</span>
        </div>
      </div>
    </a>`;
}
