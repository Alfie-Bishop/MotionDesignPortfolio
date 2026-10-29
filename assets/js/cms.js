/* =========================================================================
   LIVE CMS
   The site's content (projects + clients) is NOT hardcoded — it's fetched
   live, on every page load, from a public Google Sheet acting as a CMS:

     https://docs.google.com/spreadsheets/d/1eCfMDy05zm4OmhRallCDxDLnL21UbC-2UgVmfGBT4c0

   Edit the sheet (Projects / Clients tabs) and the site picks it up on the
   next page load — no code changes or redeploys needed. We read it via its
   published CSV export endpoint, which is public and CORS-enabled for a
   sheet shared as "Anyone with the link can view".

   window.CMS_READY is a Promise every page awaits before rendering
   anything that depends on PROJECTS / CLIENTS / CATEGORY_LABELS.
   ========================================================================= */

const CMS_SHEET_ID = "1eCfMDy05zm4OmhRallCDxDLnL21UbC-2UgVmfGBT4c0";
const CMS_PROJECTS_GID = "43400061";
const CMS_CLIENTS_GID = "158590862";

function cmsCsvUrl(gid) {
  return `https://docs.google.com/spreadsheets/d/${CMS_SHEET_ID}/export?format=csv&gid=${gid}`;
}

// Minimal RFC4180 CSV parser: handles quoted fields with embedded commas,
// newlines, and escaped ("") quotes - which Google's CSV export relies on.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\r") {
      // skip, \n handles the line break
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows
    .slice(1)
    .filter((r) => r.some((cell) => cell !== ""))
    .map((r) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (r[i] || "").trim();
      });
      return obj;
    });
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isTrue(v) {
  return String(v).trim().toUpperCase() === "TRUE";
}

async function fetchSheet(gid) {
  const res = await fetch(cmsCsvUrl(gid));
  if (!res.ok) throw new Error(`CMS sheet fetch failed (${res.status})`);
  return rowsToObjects(parseCSV(await res.text()));
}

function mapProjectRow(row) {
  const typeLabel = row["Project Type"] || "Project";
  const categorySlug = slugify(typeLabel);
  const slug = row["Slug"] || slugify(row["Project Title"] || "");

  const social = [];
  if (isTrue(row["Socials?"])) {
    if (row["Socials 9x16"]) social.push({ label: "Social cut — 9:16", src: row["Socials 9x16"] });
    if (row["Socials 1x1"]) social.push({ label: "Social cut — 1:1", src: row["Socials 1x1"] });
  }

  return {
    slug,
    title: row["Project Title"] || "",
    client: row["Clients"] || "",
    agency: row["Work Place"] || "",
    categories: [categorySlug],
    categoryLabel: typeLabel,
    thumb: {
      bg: row["Thumbnail URL"]
        ? `url('${row["Thumbnail URL"]}') center/cover no-repeat`
        : "linear-gradient(135deg,#1b1b1e,#0e0e10)",
      label: typeLabel,
    },
    mainVideo: row["Video URL"] || "",
    poster: row["Thumbnail URL"] || "",
    bts: row["BHS URL"] || "",
    social,
    description: row["Content"] || "",
    highlighted: isTrue(row["Highlight"]),
    live: isTrue(row["Live"]),
  };
}

function mapClientRow(row) {
  return { name: (row["Client Name"] || "").trim() };
}

window.CMS_READY = (async function loadCMS() {
  const [projectRows, clientRows] = await Promise.all([
    fetchSheet(CMS_PROJECTS_GID),
    fetchSheet(CMS_CLIENTS_GID),
  ]);

  const projects = projectRows.map(mapProjectRow).filter((p) => p.live && p.title);
  const clients = clientRows.map(mapClientRow).filter((c) => c.name);

  const categoryLabels = {};
  projects.forEach((p) => {
    categoryLabels[p.categories[0]] = p.categoryLabel;
  });

  window.PROJECTS = projects;
  window.CLIENTS = clients;
  window.CATEGORY_LABELS = categoryLabels;

  return { PROJECTS: projects, CLIENTS: clients, CATEGORY_LABELS: categoryLabels };
})().catch((err) => {
  console.error("Live CMS failed to load:", err);
  window.PROJECTS = [];
  window.CLIENTS = [];
  window.CATEGORY_LABELS = {};
  return { PROJECTS: [], CLIENTS: [], CATEGORY_LABELS: {} };
});
