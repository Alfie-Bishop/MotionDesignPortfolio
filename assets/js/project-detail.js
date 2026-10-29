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

  document.title = `${project.title} — Alfie Bishop`;

  const index = PROJECTS.findIndex((p) => p.slug === project.slug);
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

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
        <video src="${s.src}" muted loop playsinline controls></video>
        <div class="pd-extra-label">${s.label}</div>
      </div>`
    )
    .join("");

  const btsHTML = project.bts
    ? `
      <div class="pd-extra-item">
        <video src="${project.bts}" muted loop playsinline controls></video>
        <div class="pd-extra-label">Behind the scenes</div>
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
        <div class="pd-main-media">
          <video src="${project.mainVideo}" controls poster="${project.poster || ""}"></video>
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
})();
