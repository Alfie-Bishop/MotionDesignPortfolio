/* =========================================================================
   SHARED BEHAVIOUR: header, mobile nav, scroll reveal, logo marquee,
   contact form. Runs on every page.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initMobileNav();
  initScrollReveal();
  initLogoMarquee();
  initContactForm();
  initReelPlaceholder();
  initFanWheel();
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
  const track = document.querySelector(".logo-track");
  if (!track || typeof CLIENTS === "undefined") return;
  const items = CLIENTS.map((c) => `<span class="logo-item">${c.name}</span>`).join("");
  // duplicate the list so the marquee loops seamlessly
  track.innerHTML = items + items;
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

function initReelPlaceholder() {
  const btn = document.querySelector(".reel-play-btn");
  const frame = document.querySelector(".showreel-frame");
  if (!btn || !frame) return;
  btn.addEventListener("click", () => {
    const video = frame.querySelector("video");
    if (video) {
      frame.querySelector(".reel-placeholder")?.remove();
      video.style.display = "block";
      video.play().catch(() => {});
    }
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
   Every project thumbnail from the CMS data file, side by side, scrolling
   left continuously in a seamless loop (same technique as the client logo
   marquee: the deck is duplicated once and the track slides 0 -> -50%),
   never pausing on hover.
   ========================================================================= */
function initFanWheel() {
  const track = document.getElementById("fan-track");
  if (!track || typeof PROJECTS === "undefined" || !PROJECTS.length) return;

  const cardHTML = PROJECTS.map(
    (project) => `
      <a class="fan-card" href="project.html?p=${project.slug}" aria-label="${project.title}">
        <span class="thumb-bg" style="background:${project.thumb.bg}"></span>
      </a>`
  ).join("");

  // duplicated once so the 0 -> -50% translateX loop is seamless
  track.innerHTML = cardHTML + cardHTML;
}

function projectCardHTML(project) {
  const cats = project.categories.join(" ");
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
          <span>${project.client}</span>
          <span>${project.year}</span>
        </div>
      </div>
    </a>`;
}
