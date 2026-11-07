/* =========================================================================
   CONCEPT IDEAS PAGE
   Every image in the public Google Drive folder below becomes a slide in a
   continuously scrolling carousel (startMarquee in main.js). Add, remove or
   rename images in the folder and the page picks it up on the next load.
   Slides are display-only: no links, no dragging, no right-click save.

   Listing a Drive folder from a browser needs a Google API key with the
   Drive API enabled (it only reads public files; restrict it to this
   site's domain in Google Cloud Console). Until DRIVE_API_KEY is set the
   page shows a "coming soon" message instead of the carousel.
   ========================================================================= */

const CONCEPTS_FOLDER_ID = "1escGLQN89dRCmyrX4ntgTKZvlCYc1RFr";
const DRIVE_API_KEY = "";

async function fetchConceptImages() {
  if (!DRIVE_API_KEY) throw new Error("DRIVE_API_KEY not set");
  const params = new URLSearchParams({
    q: `'${CONCEPTS_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`,
    fields: "files(id,name)",
    orderBy: "name",
    pageSize: "200",
    key: DRIVE_API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`);
  if (!res.ok) throw new Error(`Drive folder fetch failed (${res.status})`);
  return (await res.json()).files || [];
}

// Public Drive images, resized by Google to a sensible width for the web.
function conceptImageUrl(id) {
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
}

// Resolves once every image has loaded (or failed), so the carousel measures
// real widths - slides are sized by their own aspect ratio.
function preloadImages(urls) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(src);
          img.onerror = () => resolve(null);
          img.src = src;
        })
    )
  ).then((loaded) => loaded.filter(Boolean));
}

async function initConcepts(files) {
  const track = document.getElementById("concept-track");
  const status = document.getElementById("concept-status");
  if (!track) return;

  try {
    const list = files || (await fetchConceptImages());
    const urls = await preloadImages(list.map((f) => conceptImageUrl(f.id)));
    if (!urls.length) throw new Error("no images");

    const slides = urls
      .map((src) => `<img class="concept-slide" src="${src}" alt="" draggable="false" />`)
      .join("");
    status.hidden = true;
    startMarquee(track, slides, 40);
  } catch (err) {
    console.warn("Concepts carousel:", err.message);
    status.textContent = "New concepts coming soon.";
  }
}

document.addEventListener("DOMContentLoaded", () => initConcepts());
