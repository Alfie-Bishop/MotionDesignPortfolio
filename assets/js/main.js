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

// The site is static (GitHub Pages), so messages are relayed to Alfie's inbox
// by FormSubmit (formsubmit.co). The very first submission makes FormSubmit
// email a one-time activation link to this address; nothing is delivered
// until that link is clicked.
const CONTACT_ENDPOINT = "https://formsubmit.co/ajax/alfie.cb@live.co.uk";

function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;
  const status = document.querySelector("#contact-success");
  const button = form.querySelector('button[type="submit"]');
  const buttonLabel = button.textContent;

  const showStatus = (message, isError) => {
    status.textContent = message;
    status.classList.toggle("is-error", isError);
    status.classList.add("is-visible");
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    if (data._honey) return; // hidden field only bots fill in
    data._subject = `Portfolio message from ${data.name}${data.subject ? `: ${data.subject}` : ""}`;
    data._replyto = data.email;
    data._template = "table";

    button.disabled = true;
    button.textContent = "Sending…";
    status.classList.remove("is-visible");
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || String(result.success) !== "true") throw new Error(result.message || res.status);
      form.reset();
      showStatus("Thanks — your message has been sent. I'll get back to you soon.", false);
    } catch (err) {
      console.error("Contact form failed:", err);
      showStatus("Sorry, that didn't send. Please email me directly at alfie.cb@live.co.uk.", true);
    } finally {
      button.disabled = false;
      button.textContent = buttonLabel;
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
   Every live project from the CMS, side by side, scrolling left
   continuously in a seamless loop (shares startMarquee with the client
   logo marquee), never pausing on hover.
   ========================================================================= */
function initFanWheel() {
  const track = document.getElementById("fan-track");
  if (!track || typeof PROJECTS === "undefined" || !PROJECTS.length) return;

  // Locked (agency-confidential) projects never surface here, same as on
  // the Projects page.
  const cardHTML = PROJECTS
    .filter((project) => !project.locked)
    .map(
      (project) => `
      <a class="fan-card" href="project.html?p=${project.slug}" aria-label="${project.title}">
        <span class="thumb-bg" style="background:${project.thumb.bg}"></span>
      </a>`
    )
    .join("");

  startMarquee(track, cardHTML, 30);
}

// Project card previews: the card's main video plays silently from the start
// over its thumbnail.
// - Mouse/trackpad: while the card is hovered.
// - Touch screens (no hover): once a card has sat nearest the middle of the
//   screen for a second; scrolling another card to the middle stops it.
// Only one preview plays at a time. preload="none" on the <video> means
// nothing downloads until a card's preview first starts. Returns a refresh
// function to call after the grid's layout changes (e.g. filtering).
const CARD_PREVIEW_DWELL_MS = 1000;

function initCardPreviews(root) {
  const cards = [...root.querySelectorAll(".project-card")].filter((c) => c.querySelector(".card-preview"));
  if (!cards.length) return () => {};
  let active = null;

  const stop = (card) => {
    card.classList.remove("is-previewing");
    card.querySelector(".card-preview").pause();
    if (active === card) active = null;
  };
  const start = (card) => {
    if (active && active !== card) stop(active);
    active = card;
    const video = card.querySelector(".card-preview");
    video.currentTime = 0;
    video
      .play()
      .then(() => {
        // the card may have been left while the video was still loading
        if (active === card) card.classList.add("is-previewing");
        else video.pause();
      })
      .catch(() => {});
  };

  if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
    cards.forEach((card) => {
      card.addEventListener("mouseenter", () => start(card));
      card.addEventListener("mouseleave", () => stop(card));
    });
    return () => {};
  }

  // Touch: pick the visible card whose thumbnail is nearest the screen's
  // centre (and actually crosses it), then wait for it to stay there.
  let candidate = null;
  let dwellTimer = null;
  let scheduled = false;

  const centredCard = () => {
    const cx = innerWidth / 2, cy = innerHeight / 2;
    let best = null, bestDist = Infinity;
    for (const card of cards) {
      if (!card.offsetParent) continue; // hidden by the category filter
      const r = card.querySelector(".card-media").getBoundingClientRect();
      if (cy < r.top || cy > r.bottom) continue;
      const d = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy);
      if (d < bestDist) { best = card; bestDist = d; }
    }
    return best;
  };

  const update = () => {
    scheduled = false;
    const next = centredCard();
    if (next === candidate) return;
    candidate = next;
    clearTimeout(dwellTimer);
    if (active && active !== next) stop(active);
    if (next) dwellTimer = setTimeout(() => candidate === next && start(next), CARD_PREVIEW_DWELL_MS);
  };
  const schedule = () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  };

  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  root.addEventListener("transitionend", schedule); // scroll-reveal fade-ins
  update();
  return schedule;
}

function projectCardHTML(project, forceUnlocked) {
  const cats = project.categories.join(" ");
  const locked = project.locked && !forceUnlocked;

  if (locked) {
    return `
      <div class="project-card is-locked" data-categories="${cats}" data-reveal>
        <div class="card-media">
          <div class="thumb-bg" style="background:${project.thumb.bg}"></div>
          <div class="thumb-overlay"></div>
          <div class="lock-overlay">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>
            <span>Locked</span>
          </div>
        </div>
        <div class="card-body">
          <h3>${project.agency}</h3>
        </div>
      </div>`;
  }

  const meta = [project.client, project.agency].filter(Boolean).join(" · ");
  return `
    <a class="project-card" href="project.html?p=${project.slug}" data-categories="${cats}" data-reveal>
      <div class="card-media">
        <div class="thumb-bg" style="background:${project.thumb.bg}"></div>
        ${project.mainVideo ? `<video class="card-preview" src="${project.mainVideo}" muted loop playsinline preload="none" aria-hidden="true" oncontextmenu="return false;" controlsList="nodownload"></video>` : ""}
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
