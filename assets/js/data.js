/* =========================================================================
   CONTENT DATA
   This file acts as a lightweight CMS. Edit the arrays below to add,
   remove, or update clients and projects. No other file needs to change.

   PROJECT FIELDS
   - slug:         unique id, used in the URL -> project.html?p=slug
   - title:        project title
   - client:       client name
   - agency:       agency / studio you were at when you made it
   - role:         your role on the project
   - year:         production year (string)
   - categories:   array of filter tags. Use any of:
                    "explainer", "anamorphic", "3d", "editing"
   - thumb:        { bg: "css-gradient-string", label: "short tag shown on card" }
   - mainVideo:    path to the primary video file (mp4) - replace with real file
   - poster:       path to a poster/cover image for the main video
   - bts:          optional path to a behind-the-scenes video
   - social:       optional array of { label, src, poster } for social cut-downs
   - description:  paragraph(s) describing the project, brief, and outcome
   - highlighted:  true to feature on the homepage arc
   ========================================================================= */

const CLIENTS = [
  { name: "Nova Finance" },
  { name: "Atlas Health" },
  { name: "Kinetic Sportswear" },
  { name: "Lumen Energy" },
  { name: "Orbital Studios" },
  { name: "Fernbank" },
  { name: "Pulse Telecom" },
  { name: "Greywood & Co" },
  { name: "Halcyon Beauty" },
  { name: "Driftwood Travel" },
];

const PROJECTS = [
  {
    slug: "nova-finance-explainer",
    title: "Making Sense of Micro-Investing",
    client: "Nova Finance",
    agency: "Hutch & Gray",
    role: "Lead Motion Designer",
    year: "2024",
    categories: ["explainer", "3d"],
    thumb: { bg: "linear-gradient(135deg,#1a1a1a,#3a2d55 60%,#6c4fd1)", label: "Explainer" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "assets/video/placeholder-bts.mp4",
    social: [
      { label: "Instagram cut — 9:16", src: "assets/video/placeholder-social-1.mp4" },
      { label: "LinkedIn cut — 1:1", src: "assets/video/placeholder-social-2.mp4" },
    ],
    description:
      "An explainer film built to simplify a notoriously confusing product: micro-investing. The brief called for a friendly, confident tone that could sit on the homepage and in paid social without losing clarity on mobile.\n\nI led motion design and 3D texturing on a custom icon set, then handled full edit and sound design to bring the final film in under 60 seconds without cutting the explanation short.",
    highlighted: true,
  },
  {
    slug: "kinetic-anamorphic",
    title: "Kinetic — Times Square Takeover",
    client: "Kinetic Sportswear",
    agency: "Hutch & Gray",
    role: "3D Animator",
    year: "2023",
    categories: ["anamorphic", "3d"],
    thumb: { bg: "linear-gradient(135deg,#0d0d0d,#1f3a2e 55%,#36d399)", label: "Anamorphic" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "assets/video/placeholder-bts.mp4",
    social: [],
    description:
      "A 3D anamorphic advert produced for a curved LED billboard in Times Square. Every frame had to be built and previewed against the exact screen geometry so the illusion of depth held from the target viewing angle.\n\nI built and animated the 3D product sequence, working closely with the 2D team to integrate the anamorphic perspective rig and deliver a technically accurate, screen-ready export.",
    highlighted: true,
  },
  {
    slug: "atlas-health-campaign",
    title: "Atlas Health — Brand Film",
    client: "Atlas Health",
    agency: "Fieldwork Studio",
    role: "Motion Designer & Editor",
    year: "2023",
    categories: ["editing", "explainer"],
    thumb: { bg: "linear-gradient(135deg,#111,#2d2440 60%,#9b7bff)", label: "Brand Film" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "",
    social: [
      { label: "15s teaser", src: "assets/video/placeholder-social-1.mp4" },
    ],
    description:
      "A brand film for a national health provider, cut from two days of location filming into a single confident 90-second story. The challenge was tone: warm enough to feel human, restrained enough to feel credible.\n\nI handled the full edit, pacing, and motion graphics overlays, including an animated statistics sequence built to match the film's documentary grade.",
    highlighted: true,
  },
  {
    slug: "lumen-energy-explainer",
    title: "How the Grid Actually Works",
    client: "Lumen Energy",
    agency: "Fieldwork Studio",
    role: "Lead Motion Designer",
    year: "2022",
    categories: ["explainer", "3d"],
    thumb: { bg: "linear-gradient(135deg,#0c0c0c,#3a2f12 60%,#e8b23d)", label: "Explainer" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "",
    social: [],
    description:
      "A technical explainer that translates the national energy grid into a simple, visual system anyone can follow. Built entirely from 3D-rendered isometric assets to keep the tone premium rather than cartoonish.\n\nI designed and animated the full sequence end-to-end, from storyboard through final 3D render and sound design.",
    highlighted: false,
  },
  {
    slug: "pulse-telecom-launch",
    title: "Pulse 5G — Launch Film",
    client: "Pulse Telecom",
    agency: "Fieldwork Studio",
    role: "Motion Designer",
    year: "2022",
    categories: ["editing", "3d"],
    thumb: { bg: "linear-gradient(135deg,#0a0a0a,#1c2b3a 60%,#3fb6ff)", label: "Launch Film" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "assets/video/placeholder-bts.mp4",
    social: [
      { label: "Instagram cut — 9:16", src: "assets/video/placeholder-social-1.mp4" },
    ],
    description:
      "Launch film for a national 5G rollout, combining live action with a fully 3D network visualisation sequence. The network graphic needed to read clearly within two seconds while still feeling premium and cinematic.\n\nI built the 3D network animation and composited it into the live-action edit, matching lighting and camera motion for a seamless transition.",
    highlighted: false,
  },
  {
    slug: "halcyon-beauty-social",
    title: "Halcyon — Social Campaign",
    client: "Halcyon Beauty",
    agency: "Studio Nine",
    role: "Motion Designer & Editor",
    year: "2021",
    categories: ["editing"],
    thumb: { bg: "linear-gradient(135deg,#120a10,#3a1f33 60%,#e86fb0)", label: "Social" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "",
    social: [
      { label: "Reels cut", src: "assets/video/placeholder-social-1.mp4" },
      { label: "Stories cut", src: "assets/video/placeholder-social-2.mp4" },
    ],
    description:
      "A fast-turnaround social campaign built for weekly releases across Reels and Stories. The focus was a repeatable, on-brand editing system rather than one-off hero content.\n\nI owned the edit and motion templating, creating a modular type system that let the team ship new cuts in under a day.",
    highlighted: false,
  },
  {
    slug: "greywood-anamorphic",
    title: "Greywood & Co — Digital Billboard",
    client: "Greywood & Co",
    agency: "Studio Nine",
    role: "3D Animator",
    year: "2021",
    categories: ["anamorphic", "3d"],
    thumb: { bg: "linear-gradient(135deg,#0d0d0d,#332a1f 60%,#d19a5c)", label: "Anamorphic" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "",
    social: [],
    description:
      "A 3D anamorphic piece built for a curved retail-district screen, designed to draw foot traffic at street level. Modelled and rendered the full sequence with a custom perspective rig matching the screen's exact curvature.",
    highlighted: false,
  },
  {
    slug: "driftwood-explainer",
    title: "Driftwood — Plan Your Trip",
    client: "Driftwood Travel",
    agency: "Studio Nine",
    role: "Motion Designer",
    year: "2020",
    categories: ["explainer", "editing"],
    thumb: { bg: "linear-gradient(135deg,#0a0e0c,#1f3330 60%,#4fd1b3)", label: "App Explainer" },
    mainVideo: "assets/video/placeholder-main.mp4",
    poster: "",
    bts: "",
    social: [],
    description:
      "An app-explainer film walking new users through trip planning in under 45 seconds. Built around clean UI motion rather than illustrated metaphors, to keep it feeling true to the product.",
    highlighted: false,
  },
];

const CATEGORY_LABELS = {
  explainer: "Explainer Videos",
  anamorphic: "Anamorphic Advertising",
  "3d": "3D & Texturing",
  editing: "Video Editing",
};
