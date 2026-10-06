// Document model + renderer for the SVG card editor.
// One render function feeds both the live canvas (with data-id hooks) and the export.

export type Stop = { offset: number; color: string; opacity: number };
export type Paint =
  | { kind: "none" }
  | { kind: "solid"; color: string; opacity: number }
  | { kind: "linear"; angle: number; stops: Stop[] }
  | { kind: "radial"; cx: number; cy: number; r: number; stops: Stop[] };

export type ElementType = "rect" | "ellipse" | "line" | "text" | "image" | "polygon" | "star" | "path" | "icon" | "progress" | "badge" | "blob" | "wave";
export type AnimationKind = "none" | "fade-in" | "slide-up" | "slide-left" | "pulse" | "float" | "spin" | "blink" | "draw" | "shimmer" | "typing" | "bounce" | "hue";
export type BlendMode = "normal" | "multiply" | "screen" | "overlay" | "lighten" | "darken" | "color-dodge" | "soft-light" | "difference";

export type Effects = {
  shadow: boolean; shadowX: number; shadowY: number; shadowBlur: number; shadowColor: string; shadowOpacity: number;
  glow: boolean; glowColor: string; glowSize: number;
  blur: number;
  blend: BlendMode;
};

export type Anim = { kind: AnimationKind; duration: number; delay: number; repeat: boolean };

export type SvgElement = {
  id: string; type: ElementType; name: string;
  x: number; y: number; w: number; h: number; rotation: number; opacity: number;
  fill: Paint; stroke: string; strokeWidth: number; strokeOpacity: number; dash: number; radius: number;
  visible: boolean; locked: boolean; flipX: boolean; flipY: boolean;
  effects: Effects; anim: Anim; link: string;
  // text & badge
  text: string; fontSize: number; fontFamily: string; fontWeight: number; italic: boolean; align: "start" | "middle" | "end";
  letterSpacing: number; lineHeight: number; uppercase: boolean; wrap: boolean;
  // shapes
  sides: number; points: number; innerRatio: number; d: string; icon: string; value: number; trackColor: string;
  seed: number; amplitude: number; waves: number;
  // image
  href: string; fit: "cover" | "contain" | "stretch";
};

export type PatternKind = "none" | "grid" | "dots" | "diagonal" | "cross" | "waves" | "noise" | "checker" | "topo";
export type CanvasSettings = {
  width: number; height: number; radius: number; background: Paint;
  pattern: PatternKind; patternColor: string; patternOpacity: number; patternSize: number;
  borderColor: string; borderWidth: number; borderOpacity: number;
  vignette: number; clip: boolean; fontImport: string;
};
export type SvgDoc = { canvas: CanvasSettings; elements: SvgElement[] };

export const FONTS = [
  { label: "System Sans", value: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" },
  { label: "Monospace", value: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Inter", value: "Inter, sans-serif", google: "Inter:wght@400;500;600;700;800" },
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif", google: "Space+Grotesk:wght@400;500;700" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', monospace", google: "JetBrains+Mono:wght@400;700" },
  { label: "Playfair Display", value: "'Playfair Display', serif", google: "Playfair+Display:wght@400;700;900" },
  { label: "Fira Code", value: "'Fira Code', monospace", google: "Fira+Code:wght@400;600" },
  { label: "Press Start 2P", value: "'Press Start 2P', monospace", google: "Press+Start+2P" },
  { label: "Bebas Neue", value: "'Bebas Neue', sans-serif", google: "Bebas+Neue" },
];

// 24×24 stroke icons (lucide-style paths)
export const ICONS: Record<string, string> = {
  github: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4M9 18c-4.51 2-5-2-7-2",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  heart: "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  terminal: "M4 17l6-6-6-6M12 19h8",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  arrow: "M5 12h14M12 5l7 7-7 7",
  check: "M20 6L9 17l-5-5",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  cpu: "M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM9 9h6v6H9zM9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3",
  database: "M12 8c4.97 0 9-1.34 9-3s-4.03-3-9-3-9 1.34-9 3 4.03 3 9 3zM21 12c0 1.66-4 3-9 3s-9-1.34-9-3M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5",
  coffee: "M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4ZM6 2v2M10 2v2M14 2v2",
  music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  gamepad: "M6 11h4M8 9v4M15 12h.01M18 10h.01M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",
  sparkle: "M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42",
  moon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15zM20 17v5H6.5A2.5 2.5 0 0 1 4 19.5",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  map: "M12 22s-8-7.58-8-13a8 8 0 0 1 16 0c0 5.42-8 13-8 13zM12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  briefcase: "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16",
  git: "M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9",
};

let counter = 0;
export const uid = () => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

export const solid = (color: string, opacity = 1): Paint => ({ kind: "solid", color, opacity });
export const linear = (angle: number, ...colors: string[]): Paint => ({ kind: "linear", angle, stops: colors.map((color, i) => ({ color, opacity: 1, offset: colors.length === 1 ? 0 : i / (colors.length - 1) })) });
export const radial = (cx: number, cy: number, r: number, ...colors: string[]): Paint => ({ kind: "radial", cx, cy, r, stops: colors.map((color, i) => ({ color, opacity: i === colors.length - 1 && colors.length > 1 ? 0 : 1, offset: colors.length === 1 ? 0 : i / (colors.length - 1) })) });

const baseEffects: Effects = { shadow: false, shadowX: 0, shadowY: 8, shadowBlur: 16, shadowColor: "#000000", shadowOpacity: 0.35, glow: false, glowColor: "#ffffff", glowSize: 8, blur: 0, blend: "normal" };

export type ElementPatch = Partial<Omit<SvgElement, "effects" | "anim">> & { effects?: Partial<Effects>; anim?: Partial<Anim> };
export function createElement(type: ElementType, patch: ElementPatch = {}): SvgElement {
  const isText = type === "text";
  const base: SvgElement = {
    id: uid(), type, name: defaultName(type), x: 60, y: 60, w: 160, h: 100, rotation: 0, opacity: 1,
    fill: solid("#e8e4dc"), stroke: "#ffffff", strokeWidth: 0, strokeOpacity: 1, dash: 0, radius: 0,
    visible: true, locked: false, flipX: false, flipY: false, effects: { ...baseEffects }, anim: { kind: "none", duration: 2, delay: 0, repeat: true }, link: "",
    text: "Text", fontSize: 24, fontFamily: FONTS[0].value, fontWeight: 600, italic: false, align: "start", letterSpacing: 0, lineHeight: 1.3, uppercase: false, wrap: true,
    sides: 6, points: 5, innerRatio: 0.45, d: "M0 50 C 40 0, 60 100, 100 50", icon: "star", value: 72, trackColor: "#ffffff22",
    seed: 3, amplitude: 0.35, waves: 3, href: "", fit: "cover",
  };
  const byType: Partial<Record<ElementType, Partial<SvgElement>>> = {
    text: { w: 320, h: 40, text: "Your headline", fill: solid("#f4f1ea") },
    line: { h: 0, w: 200, stroke: "#f4f1ea", strokeWidth: 2, fill: { kind: "none" } },
    ellipse: { w: 120, h: 120 },
    rect: { radius: 12 },
    polygon: { w: 120, h: 120 },
    star: { w: 120, h: 120, fill: solid("#f2c14e") },
    path: { w: 200, h: 100, fill: { kind: "none" }, stroke: "#f4f1ea", strokeWidth: 3 },
    icon: { w: 48, h: 48, fill: { kind: "none" }, stroke: "#f4f1ea", strokeWidth: 2 },
    progress: { w: 260, h: 12, radius: 6, fill: solid("#7fb685") },
    badge: { w: 140, h: 32, radius: 16, text: "TypeScript", fontSize: 14, fill: solid("#2b2a27"), stroke: "#f4f1ea", align: "middle", trackColor: "#f4f1ea" },
    image: { w: 200, h: 140, fill: { kind: "none" } },
    blob: { w: 220, h: 220, fill: solid("#d4572a", 0.8) },
    wave: { w: 600, h: 80, fill: solid("#d4572a", 0.6) },
  };
  if (isText) base.fontWeight = 700;
  return { ...base, ...byType[type], ...patch, effects: { ...base.effects, ...patch.effects }, anim: { ...base.anim, ...patch.anim } };
}

function defaultName(type: ElementType) {
  return ({ rect: "Rectangle", ellipse: "Ellipse", line: "Line", text: "Text", image: "Image", polygon: "Polygon", star: "Star", path: "Path", icon: "Icon", progress: "Progress bar", badge: "Badge", blob: "Blob", wave: "Wave" } as const)[type];
}

export const defaultCanvas = (): CanvasSettings => ({
  width: 830, height: 260, radius: 18, background: linear(135, "#1d1c1a", "#2a2723"),
  pattern: "none", patternColor: "#ffffff", patternOpacity: 0.06, patternSize: 24,
  borderColor: "#ffffff", borderWidth: 1, borderOpacity: 0.12, vignette: 0, clip: true, fontImport: "",
});

// ---------- helpers ----------
const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const n = (v: number) => Number.isFinite(v) ? +v.toFixed(2) : 0;

function rand(seed: number) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

export function polygonPoints(w: number, h: number, sides: number) {
  return Array.from({ length: Math.max(3, sides) }, (_, i) => {
    const a = (Math.PI * 2 * i) / sides - Math.PI / 2;
    return `${n(w / 2 + (w / 2) * Math.cos(a))},${n(h / 2 + (h / 2) * Math.sin(a))}`;
  }).join(" ");
}
export function starPoints(w: number, h: number, points: number, inner: number) {
  const count = Math.max(3, points) * 2;
  return Array.from({ length: count }, (_, i) => {
    const r = i % 2 === 0 ? 1 : inner; const a = (Math.PI * 2 * i) / count - Math.PI / 2;
    return `${n(w / 2 + (w / 2) * r * Math.cos(a))},${n(h / 2 + (h / 2) * r * Math.sin(a))}`;
  }).join(" ");
}
export function blobPath(w: number, h: number, seed: number, amp: number) {
  const r = rand(seed); const k = 7;
  const pts = Array.from({ length: k }, (_, i) => {
    const a = (Math.PI * 2 * i) / k; const m = 1 - amp / 2 + r() * amp;
    return [w / 2 + (w / 2) * m * Math.cos(a), h / 2 + (h / 2) * m * Math.sin(a)];
  });
  let d = "";
  for (let i = 0; i < k; i++) {
    const p0 = pts[(i - 1 + k) % k], p1 = pts[i], p2 = pts[(i + 1) % k], p3 = pts[(i + 2) % k];
    if (i === 0) d += `M${n(p1[0])} ${n(p1[1])}`;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${n(c1[0])} ${n(c1[1])} ${n(c2[0])} ${n(c2[1])} ${n(p2[0])} ${n(p2[1])}`;
  }
  return d + "Z";
}
export function wavePath(w: number, h: number, waves: number, amp: number) {
  const seg = w / Math.max(1, waves); const mid = h * 0.4; const a = h * amp;
  let d = `M0 ${n(mid)}`;
  for (let i = 0; i < waves; i++) {
    const x = i * seg;
    d += ` C${n(x + seg / 3)} ${n(mid - a)} ${n(x + (2 * seg) / 3)} ${n(mid + a)} ${n(x + seg)} ${n(mid)}`;
  }
  return `${d} L${n(w)} ${n(h)} L0 ${n(h)}Z`;
}

function wrapText(el: SvgElement) {
  const raw = el.uppercase ? el.text.toUpperCase() : el.text;
  const paragraphs = raw.split("\n");
  if (!el.wrap) return paragraphs;
  const charW = el.fontSize * (el.fontFamily.includes("mono") || el.fontFamily.includes("Press") ? 0.62 : 0.54) + el.letterSpacing;
  const max = Math.max(1, Math.floor(el.w / charW));
  const lines: string[] = [];
  for (const p of paragraphs) {
    let line = "";
    for (const word of p.split(" ")) {
      if ((line + " " + word).trim().length > max && line) { lines.push(line); line = word; } else line = (line + " " + word).trim();
    }
    lines.push(line);
  }
  return lines;
}

function paintDef(id: string, paint: Paint) {
  if (paint.kind === "linear") {
    const a = ((paint.angle - 90) * Math.PI) / 180;
    const x1 = 50 - Math.cos(a) * 50, y1 = 50 - Math.sin(a) * 50, x2 = 50 + Math.cos(a) * 50, y2 = 50 + Math.sin(a) * 50;
    return `<linearGradient id="${id}" x1="${n(x1)}%" y1="${n(y1)}%" x2="${n(x2)}%" y2="${n(y2)}%">${stops(paint.stops)}</linearGradient>`;
  }
  if (paint.kind === "radial") return `<radialGradient id="${id}" cx="${paint.cx}%" cy="${paint.cy}%" r="${paint.r}%">${stops(paint.stops)}</radialGradient>`;
  return "";
}
const stops = (s: Stop[]) => [...s].sort((a, b) => a.offset - b.offset).map((st) => `<stop offset="${n(st.offset * 100)}%" stop-color="${st.color}" stop-opacity="${st.opacity}"/>`).join("");
function paintAttr(id: string, paint: Paint, attr = "fill") {
  if (paint.kind === "none") return `${attr}="none"`;
  if (paint.kind === "solid") return `${attr}="${paint.color}"${paint.opacity < 1 ? ` ${attr}-opacity="${paint.opacity}"` : ""}`;
  return `${attr}="url(#${id})"`;
}
export function paintCss(paint: Paint) {
  if (paint.kind === "none") return "transparent";
  if (paint.kind === "solid") return paint.color;
  const st = [...paint.stops].sort((a, b) => a.offset - b.offset).map((s) => `${s.color} ${s.offset * 100}%`).join(",");
  return paint.kind === "linear" ? `linear-gradient(${paint.angle}deg,${st})` : `radial-gradient(circle at ${paint.cx}% ${paint.cy}%,${st})`;
}

function patternDef(c: CanvasSettings) {
  const s = Math.max(4, c.patternSize), col = c.patternColor;
  const inner: Record<PatternKind, string> = {
    none: "",
    grid: `<path d="M${s} 0H0V${s}" fill="none" stroke="${col}" stroke-width="1"/>`,
    dots: `<circle cx="${s / 2}" cy="${s / 2}" r="${n(Math.max(1, s / 12))}" fill="${col}"/>`,
    diagonal: `<path d="M0 ${s}L${s} 0" stroke="${col}" stroke-width="1"/>`,
    cross: `<path d="M${s / 2 - 3} ${s / 2}h6M${s / 2} ${s / 2 - 3}v6" stroke="${col}" stroke-width="1"/>`,
    waves: `<path d="M0 ${s / 2} Q${s / 4} 0 ${s / 2} ${s / 2} T${s} ${s / 2}" fill="none" stroke="${col}" stroke-width="1"/>`,
    checker: `<rect width="${s / 2}" height="${s / 2}" fill="${col}"/><rect x="${s / 2}" y="${s / 2}" width="${s / 2}" height="${s / 2}" fill="${col}"/>`,
    noise: "",
    topo: `<circle cx="${s}" cy="${s}" r="${s * 0.4}" fill="none" stroke="${col}"/><circle cx="${s}" cy="${s}" r="${s * 0.75}" fill="none" stroke="${col}"/><circle cx="0" cy="0" r="${s * 0.6}" fill="none" stroke="${col}"/>`,
  };
  if (c.pattern === "noise") return `<filter id="cv-noise"><feTurbulence type="fractalNoise" baseFrequency="${n(2.4 / s * 10)}" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>`;
  const size = c.pattern === "topo" ? s * 2 : s;
  return `<pattern id="cv-pattern" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${inner[c.pattern]}</pattern>`;
}

function filterDef(el: SvgElement) {
  const e = el.effects; if (!e.shadow && !e.glow && !e.blur) return "";
  let f = `<filter id="f-${el.id}" x="-50%" y="-50%" width="200%" height="200%">`;
  const merge: string[] = [];
  if (e.shadow) { f += `<feDropShadow dx="${e.shadowX}" dy="${e.shadowY}" stdDeviation="${n(e.shadowBlur / 2)}" flood-color="${e.shadowColor}" flood-opacity="${e.shadowOpacity}" result="sh"/>`; }
  if (e.glow) { f += `<feGaussianBlur in="SourceGraphic" stdDeviation="${e.glowSize}" result="gb"/><feFlood flood-color="${e.glowColor}"/><feComposite in2="gb" operator="in" result="glow"/>`; merge.push("glow"); }
  if (e.blur) { f += `<feGaussianBlur in="${e.shadow ? "sh" : "SourceGraphic"}" stdDeviation="${e.blur}" result="bl"/>`; merge.push("bl"); }
  else merge.push(e.shadow ? "sh" : "SourceGraphic");
  if (merge.length > 1 || e.glow) f += `<feMerge>${merge.map((m) => `<feMergeNode in="${m}"/>`).join("")}</feMerge>`;
  return f + "</filter>";
}

function animMarkup(el: SvgElement): { inner: string; wrapStart: string; wrapEnd: string; center?: boolean } {
  const a = el.anim; if (a.kind === "none") return { inner: "", wrapStart: "", wrapEnd: "" };
  const rep = a.repeat ? `repeatCount="indefinite"` : `fill="freeze"`;
  const t = `dur="${a.duration}s" begin="${a.delay}s"`;
  const cx = el.w / 2, cy = el.h / 2;
  const spline = `calcMode="spline" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" keyTimes="0;0.5;1"`;
  const once = `dur="${a.duration}s" begin="${a.delay}s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" keyTimes="0;1"`;
  switch (a.kind) {
    case "fade-in": return { inner: `<animate attributeName="opacity" values="0;1" ${once}/>`, wrapStart: "", wrapEnd: "" };
    case "slide-up": return { inner: `<animateTransform attributeName="transform" type="translate" values="0 24;0 0" ${once} additive="sum"/><animate attributeName="opacity" values="0;1" ${once}/>`, wrapStart: "", wrapEnd: "" };
    case "slide-left": return { inner: `<animateTransform attributeName="transform" type="translate" values="40 0;0 0" ${once} additive="sum"/><animate attributeName="opacity" values="0;1" ${once}/>`, wrapStart: "", wrapEnd: "" };
    case "pulse": return { inner: `<animateTransform attributeName="transform" type="scale" values="1;1.08;1" ${t} ${rep} ${spline} additive="sum"/>`, wrapStart: "", wrapEnd: "", center: true };
    case "float": return { inner: `<animateTransform attributeName="transform" type="translate" values="0 0;0 -8;0 0" ${t} ${rep} ${spline} additive="sum"/>`, wrapStart: "", wrapEnd: "" };
    case "bounce": return { inner: `<animateTransform attributeName="transform" type="translate" values="0 0;0 -16;0 0;0 -5;0 0" keyTimes="0;0.3;0.5;0.7;1" ${t} ${rep} additive="sum"/>`, wrapStart: "", wrapEnd: "" };
    case "spin": return { inner: `<animateTransform attributeName="transform" type="rotate" from="0 ${n(cx)} ${n(cy)}" to="360 ${n(cx)} ${n(cy)}" ${t} ${rep} additive="sum"/>`, wrapStart: "", wrapEnd: "" };
    case "blink": return { inner: `<animate attributeName="opacity" values="1;0.15;1" ${t} ${rep}/>`, wrapStart: "", wrapEnd: "" };
    case "hue": return { inner: `<animate attributeName="opacity" values="1;0.6;1" ${t} ${rep}/>`, wrapStart: "", wrapEnd: "" };
    default: return { inner: "", wrapStart: "", wrapEnd: "" };
  }
}

function shapeMarkup(el: SvgElement, fillAttr: string, strokeAttr: string, gid: string): string {
  const { w, h } = el;
  switch (el.type) {
    case "rect": return `<rect width="${n(w)}" height="${n(h)}" rx="${el.radius}" ${fillAttr} ${strokeAttr}/>`;
    case "ellipse": return `<ellipse cx="${n(w / 2)}" cy="${n(h / 2)}" rx="${n(w / 2)}" ry="${n(h / 2)}" ${fillAttr} ${strokeAttr}/>`;
    case "line": return `<line x1="0" y1="0" x2="${n(w)}" y2="${n(h)}" ${strokeAttr} stroke-linecap="round"/>`;
    case "polygon": return `<polygon points="${polygonPoints(w, h, el.sides)}" ${fillAttr} ${strokeAttr} stroke-linejoin="round"/>`;
    case "star": return `<polygon points="${starPoints(w, h, el.points, el.innerRatio)}" ${fillAttr} ${strokeAttr} stroke-linejoin="round"/>`;
    case "blob": return `<path d="${blobPath(w, h, el.seed, el.amplitude)}" ${fillAttr} ${strokeAttr}/>`;
    case "wave": return `<path d="${wavePath(w, h, el.waves, el.amplitude)}" ${fillAttr} ${strokeAttr}/>`;
    case "path": return `<svg width="${n(w)}" height="${n(h)}" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible"><path d="${esc(el.d)}" ${fillAttr} ${strokeAttr} vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    case "icon": {
      const sw = el.strokeWidth || 2;
      return `<svg width="${n(w)}" height="${n(h)}" viewBox="0 0 24 24"><path d="${ICONS[el.icon] ?? ICONS.star}" ${fillAttr} stroke="${el.stroke}" stroke-opacity="${el.strokeOpacity}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    case "progress": {
      const pct = Math.max(0, Math.min(100, el.value)) / 100;
      const anim = el.anim.kind === "draw" ? `<animate attributeName="width" from="0" to="${n(w * pct)}" dur="${el.anim.duration}s" begin="${el.anim.delay}s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.2 1" keyTimes="0;1"/>` : "";
      return `<rect width="${n(w)}" height="${n(h)}" rx="${el.radius}" fill="${el.trackColor}"/><rect width="${n(w * pct)}" height="${n(h)}" rx="${el.radius}" ${fillAttr}>${anim}</rect>`;
    }
    case "image": {
      if (!el.href) return `<rect width="${n(w)}" height="${n(h)}" rx="${el.radius}" fill="#888" fill-opacity="0.15" stroke="#888" stroke-dasharray="6 4"/><text x="${n(w / 2)}" y="${n(h / 2 + 4)}" text-anchor="middle" font-size="12" fill="#999" font-family="sans-serif">image</text>`;
      const par = el.fit === "cover" ? "xMidYMid slice" : el.fit === "contain" ? "xMidYMid meet" : "none";
      return `<clipPath id="clip-${el.id}"><rect width="${n(w)}" height="${n(h)}" rx="${el.radius}"/></clipPath><image href="${esc(el.href)}" width="${n(w)}" height="${n(h)}" preserveAspectRatio="${par}" clip-path="url(#clip-${el.id})"/>${el.strokeWidth ? `<rect width="${n(w)}" height="${n(h)}" rx="${el.radius}" fill="none" ${strokeAttr}/>` : ""}`;
    }
    case "badge": {
      const font = `font-family="${esc(el.fontFamily)}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" letter-spacing="${el.letterSpacing}"`;
      const label = esc(el.uppercase ? el.text.toUpperCase() : el.text);
      return `<rect width="${n(w)}" height="${n(h)}" rx="${el.radius}" ${fillAttr} ${strokeAttr}/><text x="${n(w / 2)}" y="${n(h / 2)}" dominant-baseline="central" text-anchor="middle" fill="${el.trackColor}" ${font}>${label}</text>`;
    }
    case "text": {
      const lines = wrapText(el);
      const x = el.align === "middle" ? w / 2 : el.align === "end" ? w : 0;
      const lh = el.fontSize * el.lineHeight;
      const font = `font-family="${esc(el.fontFamily)}" font-size="${el.fontSize}" font-weight="${el.fontWeight}"${el.italic ? ` font-style="italic"` : ""} letter-spacing="${el.letterSpacing}"`;
      const typing = el.anim.kind === "typing";
      const spans = lines.map((line, i) => {
        const dy = i === 0 ? el.fontSize * 0.9 : lh;
        return `<tspan x="${n(x)}" dy="${n(dy)}">${esc(line) || " "}</tspan>`;
      }).join("");
      let reveal = "";
      if (typing) {
        const steps = Math.max(1, el.text.length);
        reveal = `<clipPath id="type-${el.id}"><rect height="${n(lines.length * lh + el.fontSize)}" width="0"><animate attributeName="width" from="0" to="${n(w + 4)}" dur="${el.anim.duration}s" begin="${el.anim.delay}s" fill="freeze" calcMode="discrete" values="${Array.from({ length: Math.min(steps, 60) + 1 }, (_, i) => n(((w + 4) * i) / Math.min(steps, 60))).join(";")}"/></rect></clipPath>`;
      }
      const shimmer = el.anim.kind === "shimmer" ? `<animate attributeName="fill-opacity" values="1;0.45;1" dur="${el.anim.duration}s" begin="${el.anim.delay}s" repeatCount="indefinite"/>` : "";
      return `${reveal}<text ${fillAttr} ${strokeAttr} ${font} text-anchor="${el.align}"${typing ? ` clip-path="url(#type-${el.id})"` : ""}>${spans}${shimmer}</text>`;
    }
  }
  void gid;
  return "";
}

export function renderSvg(doc: SvgDoc, opts: { editor?: boolean; animate?: boolean; idPrefix?: string } = {}) {
  const out = renderRaw(doc, opts);
  if (!opts.idPrefix) return out;
  const p = opts.idPrefix;
  return out.replace(/(?<![-\w])id="([^"]+)"/g, `id="${p}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${p}$1)`);
}

function renderRaw(doc: SvgDoc, opts: { editor?: boolean; animate?: boolean }) {
  const c = doc.canvas; const animate = opts.animate ?? true;
  const defs: string[] = [];
  defs.push(paintDef("cv-bg", c.background));
  if (c.pattern !== "none") defs.push(patternDef(c));
  defs.push(`<clipPath id="cv-clip"><rect width="${c.width}" height="${c.height}" rx="${c.radius}"/></clipPath>`);
  if (c.vignette > 0) defs.push(`<radialGradient id="cv-vig" cx="50%" cy="50%" r="75%"><stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="${c.vignette}"/></radialGradient>`);
  const fonts = new Set<string>();
  const body = doc.elements.filter((el) => el.visible).map((el) => {
    const gid = `g-${el.id}`;
    if (el.fill.kind === "linear" || el.fill.kind === "radial") defs.push(paintDef(gid, el.fill));
    const fd = filterDef(el); if (fd) defs.push(fd);
    const g = FONTS.find((f) => f.value === el.fontFamily)?.google; if (g && (el.type === "text" || el.type === "badge")) fonts.add(g);
    const fillAttr = paintAttr(gid, el.fill);
    const strokeAttr = el.strokeWidth > 0 || el.type === "line" ? `stroke="${el.stroke}" stroke-width="${el.strokeWidth}" stroke-opacity="${el.strokeOpacity}"${el.dash ? ` stroke-dasharray="${el.dash} ${el.dash}"` : ""}` : "";
    let shape = shapeMarkup(el, fillAttr, strokeAttr, gid);
    if (animate && el.anim.kind === "draw" && el.type !== "progress") {
      const tag = shape.match(/<(path|line|polygon|ellipse|rect)\b/)?.[1];
      if (tag) {
        const anim = `<animate attributeName="stroke-dashoffset" from="100" to="0" dur="${el.anim.duration}s" begin="${el.anim.delay}s" ${el.anim.repeat ? `repeatCount="indefinite"` : `fill="freeze"`}/>`;
        shape = shape.replace(new RegExp(`<${tag}\\b([^>]*?)/>`), `<${tag}$1 pathLength="100" stroke-dasharray="100" stroke-dashoffset="100">${anim}</${tag}>`);
      }
    }
    const sx = el.flipX ? -1 : 1, sy = el.flipY ? -1 : 1;
    const flip = el.flipX || el.flipY ? ` translate(${el.flipX ? n(el.w) : 0} ${el.flipY ? n(el.h) : 0}) scale(${sx} ${sy})` : "";
    const rot = el.rotation ? ` rotate(${el.rotation} ${n(el.w / 2)} ${n(el.h / 2)})` : "";
    const transform = `translate(${n(el.x)} ${n(el.y)})${rot}${flip}`;
    const style = el.effects.blend !== "normal" ? ` style="mix-blend-mode:${el.effects.blend}"` : "";
    const filter = fd ? ` filter="url(#f-${el.id})"` : "";
    const op = el.opacity < 1 ? ` opacity="${el.opacity}"` : "";
    const data = opts.editor ? ` data-id="${el.id}"` : "";
    let inner = shape;
    if (animate && el.anim.kind !== "none" && !["draw", "typing", "shimmer"].includes(el.anim.kind)) {
      const a = animMarkup(el);
      if (a.center) inner = `<g transform="translate(${n(el.w / 2)} ${n(el.h / 2)})"><g>${a.inner}<g transform="translate(${n(-el.w / 2)} ${n(-el.h / 2)})">${shape}</g></g></g>`;
      else if (["fade-in", "slide-up", "slide-left"].includes(el.anim.kind)) inner = `<g opacity="0">${a.inner}${shape}</g>`;
      else inner = `<g>${a.inner}${shape}</g>`;
    }
    let out = `<g transform="${transform}"${op}${filter}${style}${data}>${inner}</g>`;
    if (el.link && !opts.editor) out = `<a href="${esc(el.link)}" target="_blank">${out}</a>`;
    return out;
  }).join("\n  ");
  const fontCss = [...fonts].map((f) => `@import url('https://fonts.googleapis.com/css2?family=${f}&amp;display=swap');`).join("");
  const styleTag = fontCss ? `<style>${fontCss}</style>` : "";
  const patternLayer = c.pattern === "none" ? "" : c.pattern === "noise"
    ? `<rect width="${c.width}" height="${c.height}" filter="url(#cv-noise)" opacity="${c.patternOpacity}"/>`
    : `<rect width="${c.width}" height="${c.height}" fill="url(#cv-pattern)" opacity="${c.patternOpacity}"/>`;
  const bg = c.background.kind === "none" ? "" : `<rect width="${c.width}" height="${c.height}" ${paintAttr("cv-bg", c.background)}/>`;
  const vig = c.vignette > 0 ? `<rect width="${c.width}" height="${c.height}" fill="url(#cv-vig)"/>` : "";
  const border = c.borderWidth > 0 ? `<rect x="${c.borderWidth / 2}" y="${c.borderWidth / 2}" width="${c.width - c.borderWidth}" height="${c.height - c.borderWidth}" rx="${Math.max(0, c.radius - c.borderWidth / 2)}" fill="none" stroke="${c.borderColor}" stroke-opacity="${c.borderOpacity}" stroke-width="${c.borderWidth}"/>` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}" fill="none">
  ${styleTag}<defs>${defs.join("")}</defs>
  <g${c.clip ? ` clip-path="url(#cv-clip)"` : ""}>
  ${bg}${patternLayer}
  ${body}
  ${vig}
  </g>
  ${border}
</svg>`;
}
