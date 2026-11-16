/* =========================================================================
   PROJECT DETAIL TEMPLATE
   Reads ?p=<slug> from the URL and renders the matching project, fetched
   live from the CMS (assets/js/cms.js), into #project-main.
   ========================================================================= */

(async function () {
  const main = document.getElementById("project-main");

  if (window.CMS_READY) await window.CMS_READY;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("p");
  const project = getProjectBySlug(slug);

  if (!project) {
    main.innerHTML = `
      <section class="project-detail-hero">
        <div class="container">
          <span class="eyebrow">Not found</span>
          <h1>That project doesn't exist.</h1>
          <p class="lead">It may have moved, or the CMS hasn't loaded — head back to see all projects.</p>
          <div style="margin-top:32px;"><a href="projects.html" class="btn btn-primary">View all projects</a></div>
        </div>
      </section>`;
    return;
  }

  // Locked (agency-confidential) projects need the password, the same one as
  // the Projects page - otherwise a direct link or the previous/next links
  // would open them. Nothing about the project is shown until it's unlocked.
  const unlocked = isUnlockActive();
  if (project.locked && !unlocked) {
    renderLockedProject(main);
    return;
  }

  document.title = `${project.title} — Alfie Bishop`;

  // Previous/next only step through projects this visitor can see.
  const visible = unlocked ? PROJECTS : PROJECTS.filter((p) => !p.locked);
  const index = visible.findIndex((p) => p.slug === project.slug);
  const prev = visible[(index - 1 + visible.length) % visible.length];
  const next = visible[(index + 1) % visible.length];

  const metaItems = [
    project.client ? { label: "Client", value: project.client } : null,
    project.agency ? { label: "Agency", value: project.agency } : null,
  ].filter(Boolean);

  const metaHTML = metaItems
    .map((m) => `<div class="pd-meta-item"><div class="label">${m.label}</div><div class="value">${m.value}</div></div>`)
    .join("") + `<div class="pd-meta-item"><div class="label">Category</div><div class="tags">${categoryTagList(project.categories)}</div></div>`;

  const socialHTML = (project.social || [])
    .map(
      (s) => `
      <div class="pd-extra-item">
        <video src="${s.src}" muted loop playsinline controls preload="metadata" aria-label="${s.label}" oncontextmenu="return false;" controlsList="nodownload"></video>
      </div>`
    )
    .join("");

  const btsHTML = project.bts
    ? `
      <div class="pd-extra-item">
        <video src="${project.bts}" muted loop playsinline controls preload="metadata" aria-label="Behind the scenes" oncontextmenu="return false;" controlsList="nodownload"></video>
      </div>`
    : "";

  const hasExtra = socialHTML || btsHTML;

  main.innerHTML = `
    <section class="project-detail-hero">
      <div class="container">
        <span class="eyebrow">${project.thumb.label}</span>
        <h1>${project.title}</h1>

        <div class="pd-meta-row">
          ${metaHTML}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0;">
      <div class="container">
        <div class="pd-main-media-wrap">
          <div class="pd-main-media">
            <video src="${project.mainVideo}" controls preload="metadata" poster="${project.poster || ""}" oncontextmenu="return false;" controlsList="nodownload"></video>
          </div>
        </div>

        ${
          project.description
            ? `<div class="pd-body-grid pd-body-grid--single">
                <div class="pd-description">
                  <h4>About this project</h4>
                  <p>${project.description}</p>
                </div>
              </div>`
            : ""
        }

        ${
          hasExtra
            ? `<div class="pd-extra-media">
                <h4 style="font-size:14px; text-transform:uppercase; letter-spacing:0.06em; color:var(--text-faint); margin-bottom:0;">Extra content</h4>
                <div class="pd-extra-row">${btsHTML}${socialHTML}</div>
              </div>`
            : ""
        }

        <div class="pd-nav">
          <a href="project.html?p=${prev.slug}">
            <span class="dir">← Previous</span>
            <span class="ptitle">${prev.title}</span>
          </a>
          <a href="project.html?p=${next.slug}">
            <span class="dir">Next →</span>
            <span class="ptitle">${next.title}</span>
          </a>
        </div>
      </div>
    </section>
  `;

  matchMainMediaRatio(main.querySelector(".pd-main-media"));
})();

// Shown in place of a locked project: a password box that unlocks every
// locked project for 5 minutes (shared with the Projects page), then
// reloads to show this one.
function renderLockedProject(main) {
  document.title = "Locked project — Alfie Bishop";
  main.innerHTML = `
    <section class="project-detail-hero">
      <div class="container">
        <span class="eyebrow">Locked</span>
        <h1>This project is locked.</h1>
        <p class="lead locked-lead">
          It's linked to the agency I made it with, so it's password protected. Enter the password to view it.
        </p>
        <form class="disclaimer-form locked-form" id="unlock-form">
          <input type="password" id="unlock-password" placeholder="Password" autocomplete="off" aria-label="Password" />
          <button type="submit" class="btn btn-primary">Unlock</button>
        </form>
        <p class="disclaimer-feedback" id="unlock-feedback"></p>
        <div style="margin-top:32px;"><a href="projects.html" class="btn btn-ghost">View all projects</a></div>
      </div>
    </section>`;

  const form = document.getElementById("unlock-form");
  const input = document.getElementById("unlock-password");
  const feedback = document.getElementById("unlock-feedback");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value === UNLOCK_PASSWORD) {
      startUnlock();
      location.reload();
    } else {
      feedback.textContent = "Incorrect password — try again.";
      feedback.classList.add("is-error");
      input.value = "";
      input.focus();
    }
  });
}

// Sizes the main video frame to the video's own aspect ratio (see
// .pd-main-media in style.css) once its metadata loads. The poster can't be
// used for this - Gumlet thumbnails are square whatever the video's shape.
function matchMainMediaRatio(frame) {
  const video = frame.querySelector("video");
  const apply = () => {
    if (video.videoWidth && video.videoHeight) {
      frame.style.setProperty("--media-ratio", `${video.videoWidth} / ${video.videoHeight}`);
    }
  };
  video.addEventListener("loadedmetadata", apply);
  apply();
}
