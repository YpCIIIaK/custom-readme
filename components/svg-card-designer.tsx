"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type PointerEvent as RPE, type ReactNode } from "react";
import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical, AlignStartHorizontal, AlignStartVertical,
  ArrowDown, ArrowUp, Check, ChevronsDown, ChevronsUp, Circle, Clipboard, Copy, Download, Eye, EyeOff, FlipHorizontal, FlipVertical,
  Grid3X3, Hexagon, Image as ImageIcon, LayoutTemplate, Lock, Minus, MousePointer2, Pause, Play, Plus, Redo2, Shapes, Sparkles, Spline,
  Square, Star, Tag, Trash2, Type, Undo2, Unlock, Upload, Waves, ZoomIn, ZoomOut, Gauge, Blend, Smile,
  Code2, AppWindow, Triangle, Disc, ArrowRight, MessageSquare, ChartColumn, TrendingUp, Grip, Heart, Orbit, History, FilePlus2, ClipboardPaste, X,
} from "lucide-react";
import {
  CODE_THEMES, createElement, defaultCanvas, FONTS, ICONS, paintCss, renderSvg, solid,
  type AnimationKind, type BlendMode, type CanvasSettings, type ElementType, type Paint, type PatternKind, type SvgDoc, type SvgElement, type Stop, type CodeTheme,
} from "@/lib/svg-model";
import { TEMPLATES } from "@/lib/svg-templates";

const STORAGE_KEY = "readme-studio-svg-v2";
const README_MAX = 830;

type ToolGroup = "Text" | "Shapes" | "Charts" | "Extras";
const TOOLS: { type: ElementType; label: string; icon: ReactNode; group: ToolGroup; hint: string }[] = [
  { type: "text", label: "Text", icon: <Type />, group: "Text", hint: "A heading or paragraph" },
  { type: "badge", label: "Badge", icon: <Tag />, group: "Text", hint: "Small rounded label" },
  { type: "bubble", label: "Bubble", icon: <MessageSquare />, group: "Text", hint: "Speech bubble with text" },
  { type: "code", label: "Code", icon: <Code2 />, group: "Text", hint: "Paste code — colors are added automatically" },
  { type: "rect", label: "Rectangle", icon: <Square />, group: "Shapes", hint: "Box with rounded corners" },
  { type: "ellipse", label: "Circle", icon: <Circle />, group: "Shapes", hint: "Circle or oval" },
  { type: "line", label: "Line", icon: <Minus />, group: "Shapes", hint: "Straight line" },
  { type: "triangle", label: "Triangle", icon: <Triangle />, group: "Shapes", hint: "Triangle" },
  { type: "polygon", label: "Polygon", icon: <Hexagon />, group: "Shapes", hint: "Hexagon and friends" },
  { type: "star", label: "Star", icon: <Star />, group: "Shapes", hint: "Star with any number of points" },
  { type: "heart", label: "Heart", icon: <Heart />, group: "Shapes", hint: "Heart" },
  { type: "cross", label: "Plus", icon: <Plus />, group: "Shapes", hint: "Plus sign" },
  { type: "arrow", label: "Arrow", icon: <ArrowRight />, group: "Shapes", hint: "Arrow" },
  { type: "blob", label: "Blob", icon: <Shapes />, group: "Shapes", hint: "Soft organic shape" },
  { type: "wave", label: "Wave", icon: <Waves />, group: "Shapes", hint: "Wavy band, great at the bottom" },
  { type: "spiral", label: "Spiral", icon: <Orbit />, group: "Shapes", hint: "Spiral line" },
  { type: "path", label: "Custom", icon: <Spline />, group: "Shapes", hint: "Custom path (advanced)" },
  { type: "progress", label: "Progress", icon: <Gauge />, group: "Charts", hint: "Horizontal progress bar" },
  { type: "ring", label: "Ring", icon: <Disc />, group: "Charts", hint: "Circular percentage" },
  { type: "bars", label: "Bars", icon: <ChartColumn />, group: "Charts", hint: "Bar chart from numbers" },
  { type: "sparkline", label: "Trend", icon: <TrendingUp />, group: "Charts", hint: "Line chart from numbers" },
  { type: "window", label: "Window", icon: <AppWindow />, group: "Extras", hint: "App / browser / terminal frame" },
  { type: "icon", label: "Icon", icon: <Smile />, group: "Extras", hint: "28 built-in icons" },
  { type: "image", label: "Image", icon: <ImageIcon />, group: "Extras", hint: "Upload a picture" },
  { type: "dotgrid", label: "Dot grid", icon: <Grip />, group: "Extras", hint: "Decorative dots" },
];
const TOOL_GROUPS: ToolGroup[] = ["Text", "Shapes", "Charts", "Extras"];

const ANIMS: { value: AnimationKind; label: string }[] = [
  { value: "none", label: "None" }, { value: "fade-in", label: "Fade in" }, { value: "slide-up", label: "Slide up" }, { value: "slide-left", label: "Slide from right" },
  { value: "pulse", label: "Pulse" }, { value: "float", label: "Float" }, { value: "bounce", label: "Bounce" }, { value: "spin", label: "Spin" },
  { value: "blink", label: "Blink" }, { value: "hue", label: "Breathe" }, { value: "zoom-in", label: "Zoom in" }, { value: "drop-in", label: "Drop in" }, { value: "rotate-in", label: "Rotate in" },
  { value: "wiggle", label: "Wiggle" }, { value: "swing", label: "Swing" }, { value: "heartbeat", label: "Heartbeat" }, { value: "orbit", label: "Orbit" },
  { value: "shake", label: "Shake" }, { value: "sway", label: "Sway" }, { value: "marquee", label: "Marquee (scroll)" }, { value: "color", label: "Color shift" }, { value: "dash-flow", label: "Marching dashes" },
  { value: "draw", label: "Draw / grow (lines, bars, rings)" }, { value: "typing", label: "Typewriter (text)" }, { value: "shimmer", label: "Shimmer (text)" },
];
const BLENDS: BlendMode[] = ["normal", "multiply", "screen", "overlay", "lighten", "darken", "color-dodge", "soft-light", "difference"];
const PATTERNS: PatternKind[] = ["none", "grid", "dots", "diagonal", "cross", "plus", "waves", "zigzag", "stripes", "checker", "bricks", "hexagons", "triangles", "circuit", "topo", "stars", "noise"];
const SIZE_PRESETS = [[830, 260, "Hero"], [830, 160, "Banner"], [830, 120, "Strip"], [410, 200, "Half"], [720, 300, "Terminal"], [410, 410, "Square ×2"], [500, 500, "Square"], [830, 600, "Tall"]] as const;
const SWATCHES = ["#1c1b19", "#f4f1ea", "#d4572a", "#2f6f4f", "#3178c6", "#e3b341", "#c2417a", "#5fb6c6", "#8a857b", "#ffffff", "#000000", "#7c5cbf"];
const PAINT_PRESETS: Paint[] = [
  { kind: "linear", angle: 135, stops: [{ offset: 0, color: "#1d1c1a", opacity: 1 }, { offset: 1, color: "#2a2723", opacity: 1 }] },
  { kind: "linear", angle: 90, stops: [{ offset: 0, color: "#264653", opacity: 1 }, { offset: 1, color: "#2a9d8f", opacity: 1 }] },
  { kind: "linear", angle: 160, stops: [{ offset: 0, color: "#ffecd2", opacity: 1 }, { offset: 1, color: "#fcb69f", opacity: 1 }] },
  { kind: "linear", angle: 120, stops: [{ offset: 0, color: "#0f2027", opacity: 1 }, { offset: 0.5, color: "#203a43", opacity: 1 }, { offset: 1, color: "#2c5364", opacity: 1 }] },
  { kind: "radial", cx: 20, cy: 0, r: 110, stops: [{ offset: 0, color: "#3d2c5e", opacity: 1 }, { offset: 1, color: "#0e0d14", opacity: 1 }] },
  { kind: "linear", angle: 45, stops: [{ offset: 0, color: "#f4f1ea", opacity: 1 }, { offset: 1, color: "#e7dfcf", opacity: 1 }] },
  { kind: "linear", angle: 135, stops: [{ offset: 0, color: "#c2417a", opacity: 1 }, { offset: 1, color: "#f2a65a", opacity: 1 }] },
  { kind: "solid", color: "#0d1117", opacity: 1 },
];

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "rot";
type Drag = { mode: "move" | "resize" | "rotate" | "pan"; handle?: Handle; startX: number; startY: number; origin: SvgElement[]; ids: string[] };

const WORKS_KEY = "readme-studio-svg-works-v1";
const CLIP_KEY = "readme-studio-svg-clipboard-v1";
type Work = { id: string; name: string; updated: number; doc: SvgDoc };
const normalize = (d: SvgDoc): SvgDoc => ({ canvas: { ...defaultCanvas(), ...d.canvas }, elements: d.elements.map((e) => createElement(e.type, e)) });
const newWork = (name: string, doc: SvgDoc): Work => ({ id: `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, updated: Date.now(), doc });
function loadWorks(): { currentId: string; works: Work[] } {
  try {
    const raw = localStorage.getItem(WORKS_KEY);
    if (raw) { const v = JSON.parse(raw) as { currentId: string; works: Work[] }; if (v?.works?.length) return { currentId: v.currentId, works: v.works.map((w) => ({ ...w, doc: normalize(w.doc) })) }; }
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) { const w = newWork("My card", normalize(JSON.parse(legacy) as SvgDoc)); return { currentId: w.id, works: [w] }; }
  } catch { /* storage unavailable */ }
  const w = newWork(TEMPLATES[0].name, TEMPLATES[0].build()); return { currentId: w.id, works: [w] };
}
const readClip = (): SvgElement[] => { try { return JSON.parse(localStorage.getItem(CLIP_KEY) || "[]") as SvgElement[]; } catch { return []; } };
const ago = (t: number) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : new Date(t).toLocaleDateString(); };

export function SvgCardDesigner() {
  const [doc, setDocState] = useState<SvgDoc>(() => TEMPLATES[0].build());
  const [selected, setSelected] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [snap, setSnap] = useState(true);
  const [gridSize, setGridSize] = useState(10);
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<"element" | "canvas" | "export">("element");
  const [leftTab, setLeftTab] = useState<"layers" | "templates">("layers");
  const [filename, setFilename] = useState("profile-card");
  const [copied, setCopied] = useState<string | null>(null);
  const [replay, setReplay] = useState(0);
  const history = useRef<{ past: SvgDoc[]; future: SvgDoc[] }>({ past: [], future: [] });
  const drag = useRef<Drag | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const loaded = useRef(false);
  const [works, setWorks] = useState<Work[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [clipCount, setClipCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const st = loadWorks(); const cur = st.works.find((w) => w.id === st.currentId) ?? st.works[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after SSR
    setWorks(st.works); setCurrentId(cur.id); setDocState(cur.doc); setClipCount(readClip().length); loaded.current = true;
  }, []);
  useEffect(() => {
    if (!loaded.current || !currentId) return;
    const t = setTimeout(() => setWorks((ws) => {
      const next = ws.map((w) => w.id === currentId ? { ...w, doc, updated: w.doc === doc ? w.updated : Date.now() } : w);
      try { localStorage.setItem(WORKS_KEY, JSON.stringify({ currentId, works: next })); } catch { /* quota: big embedded images */ }
      return next;
    }), 400);
    return () => clearTimeout(t);
  }, [doc, currentId]);
  const persist = (ws: Work[], id: string) => { try { localStorage.setItem(WORKS_KEY, JSON.stringify({ currentId: id, works: ws })); } catch { /* quota */ } };
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800); };
  const switchTo = (w: Work) => { const ws = works.map((x) => x.id === currentId ? { ...x, doc } : x); setWorks(ws); setCurrentId(w.id); setDocState(w.doc); persist(ws, w.id); history.current = { past: [], future: [] }; setSelected([]); setHistoryOpen(false); };
  const createWork = (name: string, d: SvgDoc) => { const w = newWork(name, d); const ws = [w, ...works.map((x) => x.id === currentId ? { ...x, doc } : x)]; setWorks(ws); setCurrentId(w.id); setDocState(d); persist(ws, w.id); history.current = { past: [], future: [] }; setSelected([]); say(`Created “${name}” — previous card is in History`); };
  const deleteWork = (id: string) => { if (id === currentId) return; const ws = works.filter((w) => w.id !== id); setWorks(ws); persist(ws, currentId); };
  const current = works.find((w) => w.id === currentId);

  const commit = useCallback((next: SvgDoc | ((d: SvgDoc) => SvgDoc), record = true) => {
    setDocState((prev) => {
      const value = typeof next === "function" ? next(prev) : next;
      if (record && value !== prev) { history.current.past.push(prev); if (history.current.past.length > 120) history.current.past.shift(); history.current.future = []; }
      return value;
    });
  }, []);
  const undo = useCallback(() => setDocState((cur) => { const prev = history.current.past.pop(); if (!prev) return cur; history.current.future.push(cur); return prev; }), []);
  const redo = useCallback(() => setDocState((cur) => { const nx = history.current.future.pop(); if (!nx) return cur; history.current.past.push(cur); return nx; }), []);

  const { canvas, elements } = doc;
  const primary = elements.find((e) => e.id === selected[selected.length - 1]);
  const svgEditor = useMemo(() => renderSvg(doc, { editor: true, animate: playing, idPrefix: "ed-" }), [doc, playing]);
  const svgExport = useMemo(() => renderSvg(doc, { animate: true }), [doc]);
  const bytes = useMemo(() => new Blob([svgExport]).size, [svgExport]);

  // fit-to-width zoom
  useEffect(() => {
    if (!fit || !wrapRef.current) return;
    const el = wrapRef.current;
    const update = () => setZoom(Math.min(2, Math.max(0.2, (el.clientWidth - 64) / canvas.width, 0.2)));
    update(); const ro = new ResizeObserver(update); ro.observe(el); return () => ro.disconnect();
  }, [fit, canvas.width]);

  const updateEls = useCallback((ids: string[], patch: Partial<SvgElement> | ((e: SvgElement) => Partial<SvgElement>), record = true) =>
    commit((d) => ({ ...d, elements: d.elements.map((e) => ids.includes(e.id) ? { ...e, ...(typeof patch === "function" ? patch(e) : patch) } : e) }), record), [commit]);
  const update = (patch: Partial<SvgElement>) => primary && updateEls(selected, patch);
  const updateCanvas = (patch: Partial<CanvasSettings>) => commit((d) => ({ ...d, canvas: { ...d.canvas, ...patch } }));

  const addElement = (type: ElementType) => {
    const e = createElement(type);
    e.x = Math.round(canvas.width / 2 - e.w / 2); e.y = Math.round(canvas.height / 2 - Math.max(e.h, 10) / 2);
    if (type === "image") { fileRef.current?.click(); }
    // friendly defaults: code drops into a selected window, windows go behind everything
    const win = elements.find((x) => selected.includes(x.id) && x.type === "window");
    if (type === "code" && win) {
      const top = win.windowStyle === "browser" ? 40 : win.windowStyle === "vscode" ? 60 : 30;
      Object.assign(e, { x: win.x, y: win.y + top, w: win.w, h: win.h - top - (win.windowStyle === "vscode" ? 22 : 0), panel: false, codeTheme: win.dark ? "vscode" : "github" });
    }
    if (type === "window") { e.w = Math.min(e.w, canvas.width - 40); e.h = Math.min(e.h, canvas.height - 30); e.x = Math.round(canvas.width / 2 - e.w / 2); e.y = Math.round(canvas.height / 2 - e.h / 2); }
    commit((d) => ({ ...d, elements: type === "window" ? [e, ...d.elements] : [...d.elements, e] })); setSelected([e.id]); setTab("element");
  };
  const removeSelected = useCallback(() => { if (!selected.length) return; commit((d) => ({ ...d, elements: d.elements.filter((e) => !selected.includes(e.id) || e.locked) })); setSelected([]); }, [commit, selected]);
  const duplicate = useCallback(() => {
    const copies = elements.filter((e) => selected.includes(e.id)).map((e) => ({ ...e, id: createElement(e.type).id, name: `${e.name} copy`, x: e.x + 16, y: e.y + 16, locked: false }));
    if (!copies.length) return; commit((d) => ({ ...d, elements: [...d.elements, ...copies] })); setSelected(copies.map((c) => c.id));
  }, [commit, elements, selected]);
  const reorder = (dir: "up" | "down" | "top" | "bottom") => {
    if (!primary) return;
    commit((d) => {
      const list = [...d.elements]; const i = list.findIndex((e) => e.id === primary.id); const [item] = list.splice(i, 1);
      const to = dir === "top" ? list.length : dir === "bottom" ? 0 : Math.max(0, Math.min(list.length, i + (dir === "up" ? 1 : -1)));
      list.splice(to, 0, item); return { ...d, elements: list };
    });
  };
  const align = (mode: "l" | "c" | "r" | "t" | "m" | "b") => {
    const sel = elements.filter((e) => selected.includes(e.id)); if (!sel.length) return;
    const useBox = sel.length > 1;
    const box = useBox ? { x: Math.min(...sel.map((e) => e.x)), y: Math.min(...sel.map((e) => e.y)), r: Math.max(...sel.map((e) => e.x + e.w)), b: Math.max(...sel.map((e) => e.y + e.h)) } : { x: 0, y: 0, r: canvas.width, b: canvas.height };
    updateEls(selected, (e) => ({
      l: { x: box.x }, c: { x: Math.round((box.x + box.r) / 2 - e.w / 2) }, r: { x: box.r - e.w },
      t: { y: box.y }, m: { y: Math.round((box.y + box.b) / 2 - e.h / 2) }, b: { y: box.b - e.h },
    })[mode]);
  };
  const distribute = (axis: "x" | "y") => {
    const sel = elements.filter((e) => selected.includes(e.id)).sort((a, b) => a[axis] - b[axis]); if (sel.length < 3) return;
    const size = axis === "x" ? "w" : "h";
    const total = sel[sel.length - 1][axis] + sel[sel.length - 1][size] - sel[0][axis];
    const gap = (total - sel.reduce((s, e) => s + e[size], 0)) / (sel.length - 1);
    let cur = sel[0][axis]; const pos: Record<string, number> = {};
    sel.forEach((e) => { pos[e.id] = Math.round(cur); cur += e[size] + gap; });
    updateEls(sel.map((e) => e.id), (e) => ({ [axis]: pos[e.id] }));
  };

  const copyEls = (list: SvgElement[]) => { if (!list.length) return; try { localStorage.setItem(CLIP_KEY, JSON.stringify(list)); } catch { /* quota */ } setClipCount(list.length); say(`${list.length} layer${list.length > 1 ? "s" : ""} copied — Ctrl+V in any card`); };
  const pasteEls = (list: SvgElement[], offset = 0) => {
    if (!list.length) return;
    const copies = list.map((e) => ({ ...createElement(e.type, e), id: createElement(e.type).id, x: e.x + offset, y: e.y + offset, locked: false }));
    commit((d) => ({ ...d, elements: [...d.elements, ...copies] })); setSelected(copies.map((c) => c.id)); setTab("element");
  };

  // keyboard
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement; if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const mod = ev.metaKey || ev.ctrlKey;
      if (mod && ev.key.toLowerCase() === "z") { ev.preventDefault(); if (ev.shiftKey) redo(); else undo(); return; }
      if (mod && ev.key.toLowerCase() === "y") { ev.preventDefault(); redo(); return; }
      if (mod && ev.key.toLowerCase() === "d") { ev.preventDefault(); duplicate(); return; }
      if (mod && ev.key.toLowerCase() === "c") { copyEls(elements.filter((e) => selected.includes(e.id))); return; }
      if (mod && ev.key.toLowerCase() === "v") { ev.preventDefault(); pasteEls(readClip(), 20); return; }
      if (mod && ev.key.toLowerCase() === "a") { ev.preventDefault(); setSelected(elements.filter((e) => !e.locked).map((e) => e.id)); return; }
      if (ev.key === "Delete" || ev.key === "Backspace") { ev.preventDefault(); removeSelected(); return; }
      if (ev.key === "Escape") { setSelected([]); return; }
      const step = ev.shiftKey ? 10 : 1;
      const dx = ev.key === "ArrowLeft" ? -step : ev.key === "ArrowRight" ? step : 0, dy = ev.key === "ArrowUp" ? -step : ev.key === "ArrowDown" ? step : 0;
      if ((dx || dy) && selected.length) { ev.preventDefault(); updateEls(selected, (e) => e.locked ? {} : { x: e.x + dx, y: e.y + dy }); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [commit, duplicate, elements, redo, removeSelected, selected, undo, updateEls]);

  // pointer interactions
  const toCanvas = (ev: { clientX: number; clientY: number }) => {
    const r = stageRef.current!.getBoundingClientRect(); return { x: (ev.clientX - r.left) / zoom, y: (ev.clientY - r.top) / zoom };
  };
  const snapV = (v: number) => snap ? Math.round(v / gridSize) * gridSize : Math.round(v);
  const onStageDown = (ev: RPE<HTMLDivElement>) => {
    const target = (ev.target as Element).closest("[data-id]"); const id = target?.getAttribute("data-id");
    const handle = (ev.target as Element).closest("[data-handle]")?.getAttribute("data-handle") as Handle | null;
    const p = toCanvas(ev);
    if (handle && primary) {
      drag.current = { mode: handle === "rot" ? "rotate" : "resize", handle, startX: p.x, startY: p.y, origin: [primary], ids: [primary.id] };
    } else if (id) {
      const el = elements.find((e) => e.id === id); if (!el) return;
      let ids = selected;
      if (ev.shiftKey) ids = selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id];
      else if (!selected.includes(id)) ids = [id];
      setSelected(ids); setTab("element");
      const movable = elements.filter((e) => ids.includes(e.id) && !e.locked);
      if (movable.length) drag.current = { mode: "move", startX: p.x, startY: p.y, origin: movable, ids: movable.map((e) => e.id) };
    } else { setSelected([]); return; }
    history.current.past.push(doc); history.current.future = [];
    (ev.currentTarget as HTMLDivElement).setPointerCapture(ev.pointerId);
  };
  const onStageMove = (ev: RPE<HTMLDivElement>) => {
    const d = drag.current; if (!d) return; const p = toCanvas(ev); const dx = p.x - d.startX, dy = p.y - d.startY;
    if (d.mode === "move") {
      const o0 = d.origin[0]; const nx = snapV(o0.x + dx) - o0.x, ny = snapV(o0.y + dy) - o0.y;
      commit((doc) => ({ ...doc, elements: doc.elements.map((e) => { const o = d.origin.find((x) => x.id === e.id); return o ? { ...e, x: o.x + nx, y: o.y + ny } : e; }) }), false);
    } else if (d.mode === "rotate") {
      const o = d.origin[0]; const cx = o.x + o.w / 2, cy = o.y + o.h / 2;
      let deg = Math.round((Math.atan2(p.y - cy, p.x - cx) * 180) / Math.PI + 90);
      if (ev.shiftKey) deg = Math.round(deg / 15) * 15;
      commit((doc) => ({ ...doc, elements: doc.elements.map((e) => e.id === o.id ? { ...e, rotation: ((deg % 360) + 360) % 360 } : e) }), false);
    } else if (d.mode === "resize" && d.handle) {
      const o = d.origin[0]; let { x, y, w, h } = o; const hd = d.handle;
      if (hd.includes("e")) w = o.w + dx; if (hd.includes("s")) h = o.h + dy;
      if (hd.includes("w")) { w = o.w - dx; x = o.x + dx; } if (hd.includes("n")) { h = o.h - dy; y = o.y + dy; }
      if (ev.shiftKey && o.w && o.h) { const ratio = o.w / o.h; if (Math.abs(dx) > Math.abs(dy)) h = w / ratio; else w = h * ratio; }
      const minH = o.type === "line" ? -2000 : 2;
      commit((doc) => ({ ...doc, elements: doc.elements.map((e) => e.id === o.id ? { ...e, x: snapV(x), y: snapV(y), w: Math.max(2, snapV(w)), h: Math.max(minH, snapV(h)) } : e) }), false);
    }
  };
  const onStageUp = () => { drag.current = null; };

  const onImage = (ev: ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0]; ev.target.value = ""; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const href = String(reader.result);
      const img = new window.Image();
      img.onload = () => {
        const target = elements.find((e) => selected.includes(e.id) && e.type === "image");
        const scale = Math.min(1, (canvas.width * 0.5) / img.width, (canvas.height * 0.8) / img.height);
        if (target) updateEls([target.id], { href });
        else { const e = createElement("image", { href, w: Math.round(img.width * scale), h: Math.round(img.height * scale), x: 40, y: 40, name: file.name }); commit((d) => ({ ...d, elements: [...d.elements, e] })); setSelected([e.id]); }
      };
      img.src = href;
    };
    reader.readAsDataURL(file);
  };

  const flash = (key: string) => { setCopied(key); setTimeout(() => setCopied(null), 1600); };
  const safeName = filename.trim().replace(/[^a-z0-9-_]+/gi, "-") || "card";
  const embed = `<p align="center">\n  <img src="./assets/${safeName}.svg" width="${Math.min(canvas.width, README_MAX)}" alt="${safeName}" />\n</p>`;
  const download = (blob: Blob, name: string) => { const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); };
  const exportPng = (scale: number) => {
    const img = new window.Image(); const url = URL.createObjectURL(new Blob([renderSvg(doc, { animate: false })], { type: "image/svg+xml" }));
    img.onload = () => { const c = document.createElement("canvas"); c.width = canvas.width * scale; c.height = canvas.height * scale; const ctx = c.getContext("2d")!; ctx.scale(scale, scale); ctx.drawImage(img, 0, 0); URL.revokeObjectURL(url); c.toBlob((b) => b && download(b, `${safeName}.png`)); };
    img.src = url;
  };
  const importJson = (ev: ChangeEvent<HTMLInputElement>) => {
    const f = ev.target.files?.[0]; ev.target.value = ""; if (!f) return;
    f.text().then((t) => { try { const d = JSON.parse(t) as SvgDoc; commit({ canvas: { ...defaultCanvas(), ...d.canvas }, elements: d.elements.map((e) => createElement(e.type, e)) }); setSelected([]); } catch { alert("Not a Readme Studio project file"); } });
  };

  const warnings = [
    canvas.width > README_MAX && `Canvas is ${canvas.width}px wide — GitHub will scale it down past ${README_MAX}px.`,
    bytes > 1_000_000 && `File is ${(bytes / 1e6).toFixed(1)} MB. GitHub's camo proxy may refuse large SVGs; compress embedded images.`,
    elements.some((e) => e.visible && (e.x > canvas.width || e.y > canvas.height || e.x + e.w < 0 || e.y + Math.max(e.h, 1) < 0)) && "Some layers sit fully outside the canvas.",
    elements.some((e) => e.link) && "Links inside an SVG don't work when shown via <img> on GitHub — wrap the whole image in <a> instead.",
    elements.some((e) => (e.type === "text" || e.type === "badge") && FONTS.find((f) => f.value === e.fontFamily)?.google) && "Web fonts load through @import; GitHub's <img> sandbox blocks it, so a fallback font renders there.",
  ].filter(Boolean) as string[];

  const handles: Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w", "rot"];

  return (
    <section className="sx">
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" hidden onChange={onImage} />
      {/* ------- LEFT ------- */}
      <aside className="sx-left">
        <div className="rb-work">
          <input className="rb-work-name" value={current?.name ?? ""} onChange={(e) => setWorks((ws) => ws.map((w) => w.id === currentId ? { ...w, name: e.target.value } : w))} title="Rename this card" />
          <div className="rb-mini">
            <button title="History — previous cards" onClick={() => setHistoryOpen(true)}><History /></button>
            <button title="New blank card" onClick={() => createWork(`Card ${works.length + 1}`, { canvas: defaultCanvas(), elements: [] })}><FilePlus2 /></button>
          </div>
        </div>
        <div className="sx-group">
          <div className="sx-title">Insert</div>
          {TOOL_GROUPS.map((g) => <div key={g} className="sx-tool-group"><div className="sx-tool-label">{g}</div>
            <div className="sx-tools">{TOOLS.filter((t) => t.group === g).map((t) => <button key={t.type} title={t.hint} onClick={() => addElement(t.type)}>{t.icon}<span>{t.label}</span></button>)}</div></div>)}
        </div>
        <div className="sx-seg"><button className={leftTab === "layers" ? "on" : ""} onClick={() => setLeftTab("layers")}>Layers <em>{elements.length}</em></button><button className={leftTab === "templates" ? "on" : ""} onClick={() => setLeftTab("templates")}>Templates</button></div>
        {leftTab === "layers" ? (
          <div className="sx-layers">
            {elements.length === 0 && <p className="sx-empty">Empty canvas. Insert something above or pick a template.</p>}
            {[...elements].reverse().map((e) => (
              <div key={e.id} className={`sx-layer ${selected.includes(e.id) ? "on" : ""} ${e.visible ? "" : "hidden"}`} onClick={(ev) => setSelected(ev.shiftKey ? (selected.includes(e.id) ? selected.filter((s) => s !== e.id) : [...selected, e.id]) : [e.id])}>
                <span className="sx-layer-kind">{TOOLS.find((t) => t.type === e.type)?.icon}</span>
                <span className="sx-layer-name">{e.name}</span>
                <button title={e.visible ? "Hide" : "Show"} onClick={(ev) => { ev.stopPropagation(); updateEls([e.id], { visible: !e.visible }); }}>{e.visible ? <Eye /> : <EyeOff />}</button>
                <button title={e.locked ? "Unlock" : "Lock"} onClick={(ev) => { ev.stopPropagation(); updateEls([e.id], { locked: !e.locked }); }}>{e.locked ? <Lock /> : <Unlock />}</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="sx-templates">
            {TEMPLATES.map((t) => { const d = t.build(); return (
              <button key={t.id} onClick={() => createWork(t.name, t.build())}>
                <span className="sx-thumb" dangerouslySetInnerHTML={{ __html: renderSvg(d, { animate: false, idPrefix: `tp-${t.id}-` }) }} />
                <span><strong>{t.name}</strong><small>{t.tag}</small></span>
              </button>
            ); })}
          </div>
        )}
      </aside>

      {/* ------- STAGE ------- */}
      <div className="sx-center">
        <div className="sx-bar">
          <div className="sx-bar-group">
            <button title="Undo (Ctrl+Z)" onClick={undo}><Undo2 /></button>
            <button title="Redo (Ctrl+Shift+Z)" onClick={redo}><Redo2 /></button>
          </div>
          <div className="sx-bar-group">
            <button title="Align left" onClick={() => align("l")} disabled={!selected.length}><AlignStartVertical /></button>
            <button title="Align center" onClick={() => align("c")} disabled={!selected.length}><AlignCenterVertical /></button>
            <button title="Align right" onClick={() => align("r")} disabled={!selected.length}><AlignEndVertical /></button>
            <button title="Align top" onClick={() => align("t")} disabled={!selected.length}><AlignStartHorizontal /></button>
            <button title="Align middle" onClick={() => align("m")} disabled={!selected.length}><AlignCenterHorizontal /></button>
            <button title="Align bottom" onClick={() => align("b")} disabled={!selected.length}><AlignEndHorizontal /></button>
            <button title="Distribute horizontally (3+)" onClick={() => distribute("x")} disabled={selected.length < 3} className="txt">⇹</button>
            <button title="Distribute vertically (3+)" onClick={() => distribute("y")} disabled={selected.length < 3} className="txt">⇵</button>
          </div>
          <div className="sx-bar-group">
            <button title="Bring to front" onClick={() => reorder("top")} disabled={!primary}><ChevronsUp /></button>
            <button title="Forward" onClick={() => reorder("up")} disabled={!primary}><ArrowUp /></button>
            <button title="Backward" onClick={() => reorder("down")} disabled={!primary}><ArrowDown /></button>
            <button title="Send to back" onClick={() => reorder("bottom")} disabled={!primary}><ChevronsDown /></button>
            <button title="Copy to clipboard (Ctrl+C)" onClick={() => copyEls(elements.filter((e) => selected.includes(e.id)))} disabled={!selected.length}><Clipboard /></button>
            <button title={clipCount ? `Paste ${clipCount} layer(s) (Ctrl+V)` : "Clipboard is empty"} onClick={() => pasteEls(readClip(), 20)} disabled={!clipCount}><ClipboardPaste /></button>
            <button title="Duplicate (Ctrl+D)" onClick={duplicate} disabled={!selected.length}><Copy /></button>
            <button title="Delete" onClick={removeSelected} disabled={!selected.length}><Trash2 /></button>
          </div>
          <div className="sx-bar-group right">
            <button title={playing ? "Pause animations" : "Play animations"} onClick={() => setPlaying(!playing)} className={playing ? "on" : ""}>{playing ? <Pause /> : <Play />}</button>
            <button title="Replay" onClick={() => { setPlaying(true); setReplay((r) => r + 1); }} className="txt">↻</button>
            <button title="Grid" onClick={() => setShowGrid(!showGrid)} className={showGrid ? "on" : ""}><Grid3X3 /></button>
            <button title="Zoom out" onClick={() => { setFit(false); setZoom((z) => Math.max(0.2, +(z - 0.1).toFixed(2))); }}><ZoomOut /></button>
            <button className="txt zoom" title="Fit to screen" onClick={() => setFit(true)}>{Math.round(zoom * 100)}%</button>
            <button title="Zoom in" onClick={() => { setFit(false); setZoom((z) => Math.min(4, +(z + 0.1).toFixed(2))); }}><ZoomIn /></button>
          </div>
        </div>
        <div className="sx-wrap" ref={wrapRef} onPointerDown={(e) => { if (e.target === e.currentTarget) setSelected([]); }}>
          <div className="sx-stage" ref={stageRef} style={{ width: canvas.width * zoom, height: canvas.height * zoom }}
            onPointerDown={onStageDown} onPointerMove={onStageMove} onPointerUp={onStageUp} onPointerCancel={onStageUp}>
            <div key={playing ? `play-${replay}` : "static"} className="sx-svg" style={{ transform: `scale(${zoom})`, width: canvas.width, height: canvas.height }} dangerouslySetInnerHTML={{ __html: svgEditor }} />
            {showGrid && <div className="sx-grid" style={{ backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px` }} />}
            {elements.filter((e) => selected.includes(e.id) && e.visible).map((e) => (
              <div key={e.id} className={`sx-sel ${e.locked ? "locked" : ""}`} style={{ left: e.x * zoom, top: Math.min(e.y, e.y + e.h) * zoom, width: e.w * zoom, height: Math.max(Math.abs(e.h), 1) * zoom, transform: `rotate(${e.rotation}deg)` }}>
                {e.id === primary?.id && selected.length === 1 && !e.locked && handles.map((h) => <span key={h} data-handle={h} className={`h h-${h}`} />)}
              </div>
            ))}
          </div>
          <div className="sx-meta">{canvas.width} × {canvas.height}px · {(bytes / 1024).toFixed(1)} KB · {elements.length} layers{selected.length > 1 ? ` · ${selected.length} selected` : ""}</div>
        </div>
        <div className="sx-hint">Drag to move · Shift-click to multi-select · Shift while resizing keeps ratio · Arrows nudge (Shift ×10) · Ctrl+C/V/D/Z</div>
      </div>

      {/* ------- INSPECTOR ------- */}
      <aside className="sx-right">
        <div className="sx-seg sx-seg-3">
          <button className={tab === "element" ? "on" : ""} onClick={() => setTab("element")}>Element</button>
          <button className={tab === "canvas" ? "on" : ""} onClick={() => setTab("canvas")}>Canvas</button>
          <button className={tab === "export" ? "on" : ""} onClick={() => setTab("export")}>Export</button>
        </div>
        <div className="sx-inspector">
          {tab === "element" && (primary ? <ElementInspector el={primary} multi={selected.length} update={update} onUpload={() => fileRef.current?.click()} /> : (
            <div className="sx-empty-state"><MousePointer2 /><p>Select a layer on the canvas or in the list to edit it.</p><button className="sx-btn" onClick={() => setTab("canvas")}>Edit canvas & background</button></div>
          ))}
          {tab === "canvas" && <CanvasInspector c={canvas} update={updateCanvas} grid={{ snap, setSnap, gridSize, setGridSize }} />}
          {tab === "export" && (
            <>
              <Section title="File">
                <Field label="File name"><input value={filename} onChange={(e) => setFilename(e.target.value)} /></Field>
                <div className="sx-stack">
                  <button className="sx-btn primary" onClick={() => download(new Blob([svgExport], { type: "image/svg+xml" }), `${safeName}.svg`)}><Download /> Download SVG</button>
                  <div className="sx-row2">
                    <button className="sx-btn" onClick={() => exportPng(1)}>PNG 1×</button>
                    <button className="sx-btn" onClick={() => exportPng(2)}>PNG 2×</button>
                  </div>
                  <button className="sx-btn" onClick={() => { navigator.clipboard.writeText(svgExport); flash("svg"); }}>{copied === "svg" ? <Check /> : <Clipboard />} Copy SVG code</button>
                </div>
              </Section>
              <Section title="Use in README">
                <p className="sx-note">Commit the SVG to <code>assets/{safeName}.svg</code>, then paste:</p>
                <pre className="sx-code">{embed}</pre>
                <button className="sx-btn" onClick={() => { navigator.clipboard.writeText(embed); flash("md"); }}>{copied === "md" ? <Check /> : <Clipboard />} Copy embed snippet</button>
              </Section>
              <Section title="Project">
                <p className="sx-note">Saved automatically in this browser. Move designs between machines as JSON.</p>
                <div className="sx-row2">
                  <button className="sx-btn" onClick={() => download(new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" }), `${safeName}.readme-studio.json`)}><Download /> Save</button>
                  <label className="sx-btn"><Upload /> Open<input type="file" accept="application/json" hidden onChange={importJson} /></label>
                </div>
              </Section>
              <Section title="Checks">
                {warnings.length ? warnings.map((w) => <p key={w} className="sx-warn">{w}</p>) : <p className="sx-ok"><Check /> Looks good for GitHub.</p>}
              </Section>
            </>
          )}
        </div>
      </aside>
      {historyOpen && <SvgHistory works={works} currentId={currentId} onClose={() => setHistoryOpen(false)} onOpen={switchTo} onDelete={deleteWork}
        onInsert={(list) => { pasteEls(list); setHistoryOpen(false); say(`Inserted ${list.length} layer${list.length > 1 ? "s" : ""}`); }} onCopy={copyEls} />}
      {toast && <div className="rb-toast">{toast}</div>}
    </section>
  );
}

function SvgHistory({ works, currentId, onClose, onOpen, onDelete, onInsert, onCopy }: { works: Work[]; currentId: string; onClose: () => void; onOpen: (w: Work) => void; onDelete: (id: string) => void; onInsert: (e: SvgElement[]) => void; onCopy: (e: SvgElement[]) => void }) {
  const sorted = [...works].sort((a, b) => b.updated - a.updated);
  const [viewId, setViewId] = useState<string>(sorted.find((w) => w.id !== currentId)?.id ?? currentId);
  const [checked, setChecked] = useState<string[]>([]);
  const work = works.find((w) => w.id === viewId);
  const chosen = useMemo(() => work ? work.doc.elements.filter((e) => checked.includes(e.id)) : [], [work, checked]);
  const preview = useMemo(() => work ? renderSvg(chosen.length ? { ...work.doc, elements: work.doc.elements.map((e) => checked.includes(e.id) ? e : { ...e, opacity: e.opacity * 0.15 }) } : work.doc, { animate: false, idPrefix: "hp-" }) : "", [work, chosen, checked]);
  return (
    <div className="rb-modal" onClick={onClose}>
      <div className="rb-history sx-history" onClick={(e) => e.stopPropagation()}>
        <div className="rb-hist-col rb-hist-works">
          <div className="rb-hist-title"><History /> Cards <em>{works.length}</em></div>
          {sorted.map((w) => (
            <button key={w.id} className={`rb-hist-work ${w.id === viewId ? "on" : ""}`} onClick={() => { setViewId(w.id); setChecked([]); }}>
              <span className="sx-hist-thumb" dangerouslySetInnerHTML={{ __html: renderSvg(w.doc, { animate: false, idPrefix: `h${w.id}-` }) }} />
              <strong>{w.name || "Untitled"}{w.id === currentId && <i>current</i>}</strong>
              <small>{w.doc.elements.length} layers · {w.doc.canvas.width}×{w.doc.canvas.height} · {ago(w.updated)}</small>
            </button>
          ))}
        </div>
        <div className="rb-hist-col rb-hist-blocks">
          {work && <>
            <div className="rb-hist-title">
              <label className="rb-check"><input type="checkbox" checked={checked.length > 0 && checked.length === work.doc.elements.length} onChange={(e) => setChecked(e.target.checked ? work.doc.elements.map((x) => x.id) : [])} /> Layers</label>
              <em>{checked.length ? `${checked.length} selected` : "pick layers to reuse"}</em>
            </div>
            <div className="rb-hist-list">
              {[...work.doc.elements].reverse().map((e) => (
                <label key={e.id} className={`rb-hist-block ${checked.includes(e.id) ? "on" : ""}`}>
                  <input type="checkbox" checked={checked.includes(e.id)} onChange={() => setChecked((c) => c.includes(e.id) ? c.filter((x) => x !== e.id) : [...c, e.id])} />
                  <span><strong>{e.name}</strong><small>{e.type}{e.text && ["text", "badge", "bubble"].includes(e.type) ? ` · ${e.text.slice(0, 30)}` : ""}</small></span>
                </label>
              ))}
              {!work.doc.elements.length && <p className="sx-empty">This card is empty.</p>}
            </div>
            <div className="rb-hist-actions">
              <button className="sx-btn primary" disabled={!chosen.length} onClick={() => onInsert(chosen)}><Plus /> Insert {chosen.length || ""} into current</button>
              <button className="sx-btn" disabled={!chosen.length} onClick={() => onCopy(chosen)}><Clipboard /> Copy</button>
              <span className="rb-flex" />
              {work.id !== currentId && <button className="sx-btn" onClick={() => onOpen(work)}>Open this card</button>}
              {work.id !== currentId && <button className="sx-btn rb-danger" title="Delete from history" onClick={() => { if (confirm(`Delete “${work.name}”?`)) { onDelete(work.id); setViewId(currentId); } }}><Trash2 /></button>}
            </div>
          </>}
        </div>
        <div className="rb-hist-col rb-hist-preview sx-hist-preview">
          <div className="rb-hist-title">{chosen.length ? "Selected layers highlighted" : "Preview"}<button className="rb-close" onClick={onClose}><X /></button></div>
          <div className="sx-hist-canvas" dangerouslySetInnerHTML={{ __html: preview }} />
        </div>
      </div>
    </div>
  );
}

/* ---------------- inspector pieces ---------------- */

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return <div className="sx-section"><div className="sx-section-head"><span>{title}</span>{aside}</div>{children}</div>;
}
function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`sx-field ${wide ? "wide" : ""}`}><span>{label}</span>{children}</label>;
}
function Num({ value, onChange, step = 1, min, max, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string }) {
  return <div className="sx-num"><input type="number" value={Number.isFinite(value) ? +value.toFixed(2) : 0} step={step} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} />{suffix && <i>{suffix}</i>}</div>;
}
function Slider({ label, value, onChange, min, max, step = 1, fmt }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number; fmt?: (v: number) => string }) {
  return <label className="sx-slider"><span>{label}<b>{fmt ? fmt(value) : value}</b></span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>;
}
function Color({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = value.slice(0, 7);
  return <div className="sx-color"><input type="color" value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000"} onChange={(e) => onChange(e.target.value + value.slice(7))} /><input value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} /></div>;
}
function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="sx-toggle"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /> {label}</label>;
}

function PaintEditor({ paint, onChange, allowNone = true, presets }: { paint: Paint; onChange: (p: Paint) => void; allowNone?: boolean; presets?: Paint[] }) {
  const stops = paint.kind === "linear" || paint.kind === "radial" ? paint.stops : null;
  const setStops = (next: Stop[]) => onChange({ ...(paint as Extract<Paint, { stops: Stop[] }>), stops: next });
  const firstColor = paint.kind === "solid" ? paint.color : stops?.[0]?.color ?? "#d4572a";
  const setKind = (kind: Paint["kind"]) => {
    if (kind === paint.kind) return;
    const s = stops ?? [{ offset: 0, color: firstColor, opacity: 1 }, { offset: 1, color: "#1c1b19", opacity: 1 }];
    onChange(kind === "none" ? { kind } : kind === "solid" ? solid(firstColor) : kind === "linear" ? { kind, angle: 135, stops: s } : { kind, cx: 50, cy: 50, r: 60, stops: s });
  };
  return (
    <div className="sx-paint">
      <div className="sx-chips">
        {(allowNone ? ["none", "solid", "linear", "radial"] as const : ["solid", "linear", "radial"] as const).map((k) => <button key={k} className={paint.kind === k ? "on" : ""} onClick={() => setKind(k)}>{k}</button>)}
        <span className="sx-paint-preview" style={{ background: paintCss(paint) }} />
      </div>
      {paint.kind === "solid" && <>
        <Color value={paint.color} onChange={(color) => onChange({ ...paint, color })} />
        <div className="sx-swatches">{SWATCHES.map((s) => <button key={s} style={{ background: s }} onClick={() => onChange({ ...paint, color: s })} title={s} />)}</div>
        <Slider label="Opacity" min={0} max={1} step={0.01} value={paint.opacity} onChange={(opacity) => onChange({ ...paint, opacity })} fmt={(v) => `${Math.round(v * 100)}%`} />
      </>}
      {stops && <>
        <div className="sx-gradient-bar" style={{ background: paintCss({ kind: "linear", angle: 90, stops }) }} />
        {paint.kind === "linear" && <Slider label="Angle" min={0} max={360} value={paint.angle} onChange={(angle) => onChange({ ...paint, angle })} fmt={(v) => `${v}°`} />}
        {paint.kind === "radial" && <div className="sx-grid3">
          <Field label="Center X"><Num value={paint.cx} suffix="%" onChange={(cx) => onChange({ ...paint, cx })} /></Field>
          <Field label="Center Y"><Num value={paint.cy} suffix="%" onChange={(cy) => onChange({ ...paint, cy })} /></Field>
          <Field label="Radius"><Num value={paint.r} suffix="%" onChange={(r) => onChange({ ...paint, r })} /></Field>
        </div>}
        {stops.map((s, i) => (
          <div key={i} className="sx-stop">
            <Color value={s.color} onChange={(color) => setStops(stops.map((x, j) => j === i ? { ...x, color } : x))} />
            <Num value={Math.round(s.offset * 100)} suffix="%" min={0} max={100} onChange={(v) => setStops(stops.map((x, j) => j === i ? { ...x, offset: v / 100 } : x))} />
            <Num value={Math.round(s.opacity * 100)} suffix="α" min={0} max={100} onChange={(v) => setStops(stops.map((x, j) => j === i ? { ...x, opacity: v / 100 } : x))} />
            <button disabled={stops.length <= 2} onClick={() => setStops(stops.filter((_, j) => j !== i))}><Trash2 /></button>
          </div>
        ))}
        <button className="sx-link" onClick={() => setStops([...stops, { offset: 1, color: "#ffffff", opacity: 1 }])}><Plus /> Add stop</button>
      </>}
      {presets && <div className="sx-presets">{presets.map((p, i) => <button key={i} style={{ background: paintCss(p) }} onClick={() => onChange(p)} />)}</div>}
    </div>
  );
}

function ElementInspector({ el, multi, update, onUpload }: { el: SvgElement; multi: number; update: (p: Partial<SvgElement>) => void; onUpload: () => void }) {
  const isText = el.type === "text" || el.type === "badge" || el.type === "bubble";
  const hasFill = !["line", "image", "code", "window"].includes(el.type);
  const simple = el.type === "code" || el.type === "window";
  const fx = el.effects;
  const setFx = (p: Partial<SvgElement["effects"]>) => update({ effects: { ...fx, ...p } });
  return (
    <>
      <div className="sx-el-head">
        <input className="sx-name" value={el.name} onChange={(e) => update({ name: e.target.value })} />
        <span className="sx-kind">{el.type}{multi > 1 ? ` +${multi - 1}` : ""}</span>
      </div>

      <Section title="Layout">
        <div className="sx-grid4">
          <Field label="X"><Num value={el.x} onChange={(x) => update({ x })} /></Field>
          <Field label="Y"><Num value={el.y} onChange={(y) => update({ y })} /></Field>
          <Field label="W"><Num value={el.w} onChange={(w) => update({ w: Math.max(1, w) })} /></Field>
          <Field label="H"><Num value={el.h} onChange={(h) => update({ h })} /></Field>
        </div>
        <div className="sx-grid3">
          <Field label="Rotate"><Num value={el.rotation} suffix="°" onChange={(rotation) => update({ rotation })} /></Field>
          {["rect", "image", "progress", "badge"].includes(el.type) && <Field label="Radius"><Num value={el.radius} min={0} onChange={(radius) => update({ radius })} /></Field>}
          <div className="sx-flip">
            <button className={el.flipX ? "on" : ""} title="Flip horizontal" onClick={() => update({ flipX: !el.flipX })}><FlipHorizontal /></button>
            <button className={el.flipY ? "on" : ""} title="Flip vertical" onClick={() => update({ flipY: !el.flipY })}><FlipVertical /></button>
          </div>
        </div>
        <Slider label="Opacity" min={0} max={1} step={0.01} value={el.opacity} onChange={(opacity) => update({ opacity })} fmt={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Skew" min={-45} max={45} value={el.skewX} onChange={(skewX) => update({ skewX })} fmt={(v) => `${v}°`} />
      </Section>

      {isText && (
        <Section title={el.type === "badge" ? "Label" : "Text"}>
          <textarea rows={el.type === "badge" ? 1 : 3} value={el.text} onChange={(e) => update({ text: e.target.value })} />
          <Field label="Font" wide><select value={el.fontFamily} onChange={(e) => update({ fontFamily: e.target.value })}>{FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}</select></Field>
          <div className="sx-grid3">
            <Field label="Size"><Num value={el.fontSize} min={4} onChange={(fontSize) => update({ fontSize })} /></Field>
            <Field label="Weight"><select value={el.fontWeight} onChange={(e) => update({ fontWeight: Number(e.target.value) })}>{[300, 400, 500, 600, 700, 800, 900].map((w) => <option key={w}>{w}</option>)}</select></Field>
            <Field label="Spacing"><Num value={el.letterSpacing} step={0.5} onChange={(letterSpacing) => update({ letterSpacing })} /></Field>
          </div>
          {el.type === "text" && <>
            <div className="sx-chips">
              {(["start", "middle", "end"] as const).map((a) => <button key={a} className={el.align === a ? "on" : ""} onClick={() => update({ align: a })}>{a === "start" ? "Left" : a === "middle" ? "Center" : "Right"}</button>)}
            </div>
            <Slider label="Line height" min={0.8} max={2.5} step={0.05} value={el.lineHeight} onChange={(lineHeight) => update({ lineHeight })} />
            <div className="sx-toggles">
              <Toggle label="Italic" checked={el.italic} onChange={(italic) => update({ italic })} />
              <Toggle label="Wrap to width" checked={el.wrap} onChange={(wrap) => update({ wrap })} />
            </div>
          </>}
          <Toggle label="UPPERCASE" checked={el.uppercase} onChange={(uppercase) => update({ uppercase })} />
          {(el.type === "badge" || el.type === "bubble") && <Field label="Label color" wide><Color value={el.trackColor} onChange={(trackColor) => update({ trackColor })} /></Field>}
        </Section>
      )}

      {el.type === "icon" && (
        <Section title="Icon">
          <div className="sx-icon-grid">{Object.entries(ICONS).map(([k, d]) => <button key={k} title={k} className={el.icon === k ? "on" : ""} onClick={() => update({ icon: k })}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg></button>)}</div>
        </Section>
      )}
      {el.type === "code" && <Section title="Code">
        <p className="sx-note">Paste any code. Colors are picked automatically.</p>
        <textarea rows={8} className="mono" value={el.text} onChange={(e) => update({ text: e.target.value })} spellCheck={false} />
        <span className="sx-field-label">Color theme</span>
        <div className="sx-theme-grid">{(Object.keys(CODE_THEMES) as CodeTheme[]).map((k) => { const t = CODE_THEMES[k]; return (
          <button key={k} className={el.codeTheme === k ? "on" : ""} onClick={() => update({ codeTheme: k })} style={{ background: t.bg, color: t.text }}>
            <span><i style={{ color: t.kw }}>const</i> <i style={{ color: t.fn }}>hi</i> = <i style={{ color: t.str }}>&quot;!&quot;</i></span><small>{t.label}</small>
          </button>); })}</div>
        <Slider label="Text size" min={9} max={28} value={el.fontSize} onChange={(fontSize) => update({ fontSize })} />
        <Toggle label="Line numbers" checked={el.lineNumbers} onChange={(lineNumbers) => update({ lineNumbers })} />
        <Toggle label="Background" checked={el.panel} onChange={(panel) => update({ panel })} />
        <p className="sx-note">Tip: set Animation → “Typewriter” to reveal the code line by line.</p>
      </Section>}
      {el.type === "window" && <Section title="Window">
        <span className="sx-field-label">Style</span>
        <div className="sx-chips wrap">{([["mac", "App"], ["browser", "Browser"], ["vscode", "VS Code"], ["terminal", "Terminal"]] as const).map(([k, l]) => <button key={k} className={el.windowStyle === k ? "on" : ""} onClick={() => update({ windowStyle: k })}>{l}</button>)}</div>
        <Field label={el.windowStyle === "browser" ? "Tab title" : "Title"} wide><input value={el.text} onChange={(e) => update({ text: e.target.value })} /></Field>
        {(el.windowStyle === "browser" || el.windowStyle === "vscode") && <Field label={el.windowStyle === "browser" ? "Address" : "File name"} wide><input value={el.subtitle} placeholder={el.windowStyle === "browser" ? "github.com/you" : "index.ts"} onChange={(e) => update({ subtitle: e.target.value })} /></Field>}
        <Toggle label="Dark mode" checked={el.dark} onChange={(dark) => update({ dark })} />
        <Slider label="Corner" min={0} max={24} value={el.radius} onChange={(radius) => update({ radius })} />
        <p className="sx-note">Select the window, then click <b>Code</b> in Insert — the code lands inside it.</p>
      </Section>}
      {el.type === "ring" && <Section title="Ring meter">
        <Slider label="Value" min={0} max={100} value={el.value} onChange={(value) => update({ value })} fmt={(v) => `${v}%`} />
        <Slider label="Thickness" min={1} max={40} value={el.strokeWidth} onChange={(strokeWidth) => update({ strokeWidth })} />
        <Field label="Track" wide><Color value={el.trackColor} onChange={(trackColor) => update({ trackColor })} /></Field>
        <Slider label="Label size (0 = hide)" min={0} max={60} value={el.fontSize} onChange={(fontSize) => update({ fontSize })} />
        <p className="sx-note">Arc uses Fill, label uses Stroke color. Animation “Draw” fills it up.</p>
      </Section>}
      {(el.type === "bars" || el.type === "sparkline") && <Section title={el.type === "bars" ? "Bar chart" : "Sparkline"}>
        <Field label="Values (comma separated)" wide><input className="mono" value={el.values} onChange={(e) => update({ values: e.target.value })} /></Field>
        <div className="sx-chips wrap">{[["Rising", "2,3,5,4,7,9,12,15"], ["Wave", "5,8,11,8,5,8,11,8,5"], ["Random", ""]].map(([n, v]) => <button key={n} onClick={() => update({ values: v || Array.from({ length: 10 }, () => Math.round(Math.random() * 20 + 2)).join(",") })}>{n}</button>)}</div>
        {el.type === "sparkline" && <p className="sx-note">Line uses Stroke, area under it uses Fill (none to hide).</p>}
      </Section>}
      {el.type === "dotgrid" && <Section title="Dot grid">
        <Slider label="Spacing" min={4} max={60} value={el.spacing} onChange={(spacing) => update({ spacing })} />
        <Slider label="Dot radius" min={0.5} max={10} step={0.5} value={el.radius} onChange={(radius) => update({ radius })} />
      </Section>}
      {el.type === "cross" && <Section title="Plus"><Slider label="Thickness" min={0.05} max={0.9} step={0.01} value={el.innerRatio} onChange={(innerRatio) => update({ innerRatio })} /></Section>}
      {el.type === "spiral" && <Section title="Spiral"><Slider label="Turns" min={1} max={12} value={el.waves} onChange={(waves) => update({ waves })} /></Section>}
      {el.type === "polygon" && <Section title="Polygon"><Slider label="Sides" min={3} max={12} value={el.sides} onChange={(sides) => update({ sides })} /></Section>}
      {el.type === "star" && <Section title="Star">
        <Slider label="Points" min={3} max={16} value={el.points} onChange={(points) => update({ points })} />
        <Slider label="Inner radius" min={0.1} max={0.95} step={0.01} value={el.innerRatio} onChange={(innerRatio) => update({ innerRatio })} />
      </Section>}
      {el.type === "blob" && <Section title="Blob" aside={<button className="sx-link" onClick={() => update({ seed: Math.floor(Math.random() * 9999) })}><Sparkles /> Shuffle</button>}>
        <Slider label="Wobble" min={0} max={0.9} step={0.01} value={el.amplitude} onChange={(amplitude) => update({ amplitude })} />
        <Field label="Seed"><Num value={el.seed} onChange={(seed) => update({ seed })} /></Field>
      </Section>}
      {el.type === "wave" && <Section title="Wave">
        <Slider label="Waves" min={1} max={12} value={el.waves} onChange={(waves) => update({ waves })} />
        <Slider label="Amplitude" min={0} max={0.6} step={0.01} value={el.amplitude} onChange={(amplitude) => update({ amplitude })} />
      </Section>}
      {el.type === "path" && <Section title="Path data">
        <p className="sx-note">SVG path in a 0–100 box, stretched to W×H.</p>
        <textarea rows={4} className="mono" value={el.d} onChange={(e) => update({ d: e.target.value })} />
        <div className="sx-chips">
          {[["Curve", "M0 50 C 40 0, 60 100, 100 50"], ["Arrow", "M0 50 H90 M70 30 L95 50 L70 70"], ["Zigzag", "M0 70 L20 30 L40 70 L60 30 L80 70 L100 30"], ["Heart", "M50 90 C10 60 0 30 25 15 C40 5 50 20 50 25 C50 20 60 5 75 15 C100 30 90 60 50 90Z"], ["Squiggle", "M0 50 Q12 20 25 50 T50 50 T75 50 T100 50"]].map(([n, d]) => <button key={n} onClick={() => update({ d })}>{n}</button>)}
        </div>
      </Section>}
      {el.type === "progress" && <Section title="Progress">
        <Slider label="Value" min={0} max={100} value={el.value} onChange={(value) => update({ value })} fmt={(v) => `${v}%`} />
        <Field label="Track" wide><Color value={el.trackColor} onChange={(trackColor) => update({ trackColor })} /></Field>
      </Section>}
      {el.type === "image" && <Section title="Image">
        <button className="sx-btn" onClick={onUpload}><Upload /> {el.href ? "Replace image" : "Upload image"}</button>
        <Field label="…or URL" wide><input value={el.href.startsWith("data:") ? "(embedded file)" : el.href} placeholder="https://…" onChange={(e) => update({ href: e.target.value })} /></Field>
        <div className="sx-chips">{(["cover", "contain", "stretch"] as const).map((f) => <button key={f} className={el.fit === f ? "on" : ""} onClick={() => update({ fit: f })}>{f}</button>)}</div>
      </Section>}

      {hasFill && <Section title="Fill"><PaintEditor paint={el.fill} onChange={(fill) => update({ fill })} /></Section>}

      {!simple && <Section title="Stroke">
        <div className="sx-grid3">
          <Field label="Width"><Num value={el.strokeWidth} min={0} step={0.5} onChange={(strokeWidth) => update({ strokeWidth })} /></Field>
          <Field label="Dash"><Num value={el.dash} min={0} onChange={(dash) => update({ dash })} /></Field>
          <Field label="Opacity"><Num value={Math.round(el.strokeOpacity * 100)} suffix="%" onChange={(v) => update({ strokeOpacity: v / 100 })} /></Field>
        </div>
        <Color value={el.stroke} onChange={(stroke) => update({ stroke })} />
      </Section>}

      <Section title="Effects">
        <Toggle label="Drop shadow" checked={fx.shadow} onChange={(shadow) => setFx({ shadow })} />
        {fx.shadow && <>
          <div className="sx-grid3">
            <Field label="X"><Num value={fx.shadowX} onChange={(shadowX) => setFx({ shadowX })} /></Field>
            <Field label="Y"><Num value={fx.shadowY} onChange={(shadowY) => setFx({ shadowY })} /></Field>
            <Field label="Blur"><Num value={fx.shadowBlur} min={0} onChange={(shadowBlur) => setFx({ shadowBlur })} /></Field>
          </div>
          <Color value={fx.shadowColor} onChange={(shadowColor) => setFx({ shadowColor })} />
          <Slider label="Shadow opacity" min={0} max={1} step={0.01} value={fx.shadowOpacity} onChange={(shadowOpacity) => setFx({ shadowOpacity })} fmt={(v) => `${Math.round(v * 100)}%`} />
        </>}
        <Toggle label="Glow" checked={fx.glow} onChange={(glow) => setFx({ glow })} />
        {fx.glow && <><Color value={fx.glowColor} onChange={(glowColor) => setFx({ glowColor })} /><Slider label="Glow size" min={1} max={40} value={fx.glowSize} onChange={(glowSize) => setFx({ glowSize })} /></>}
        <Slider label="Blur" min={0} max={60} value={fx.blur} onChange={(blur) => setFx({ blur })} />
        <Field label="Blend" wide><div className="sx-select-icon"><Blend /><select value={fx.blend} onChange={(e) => setFx({ blend: e.target.value as BlendMode })}>{BLENDS.map((b) => <option key={b}>{b}</option>)}</select></div></Field>
      </Section>

      <Section title="Animation">
        <Field label="Type" wide><select value={el.anim.kind} onChange={(e) => update({ anim: { ...el.anim, kind: e.target.value as AnimationKind } })}>{ANIMS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}</select></Field>
        {el.anim.kind !== "none" && <>
          <div className="sx-grid3">
            <Field label="Duration"><Num value={el.anim.duration} step={0.1} min={0.1} suffix="s" onChange={(duration) => update({ anim: { ...el.anim, duration } })} /></Field>
            <Field label="Delay"><Num value={el.anim.delay} step={0.1} min={0} suffix="s" onChange={(delay) => update({ anim: { ...el.anim, delay } })} /></Field>
          </div>
          {el.anim.kind === "color" && <Field label="Shift to color" wide><Color value={el.altColor} onChange={(altColor) => update({ altColor })} /></Field>}
          <div className="sx-chips wrap">{[["Fast", 0.6], ["Normal", 2], ["Slow", 5]].map(([l, d]) => <button key={l} className={el.anim.duration === d ? "on" : ""} onClick={() => update({ anim: { ...el.anim, duration: d as number } })}>{l}</button>)}</div>
          {!["fade-in", "slide-up", "slide-left", "typing", "zoom-in", "drop-in", "rotate-in"].includes(el.anim.kind) && <Toggle label="Loop forever" checked={el.anim.repeat} onChange={(repeat) => update({ anim: { ...el.anim, repeat } })} />}
        </>}
      </Section>

      <Section title="Link">
        <input value={el.link} placeholder="https://… (works when SVG opened directly)" onChange={(e) => update({ link: e.target.value })} />
      </Section>
    </>
  );
}

function CanvasInspector({ c, update, grid }: { c: CanvasSettings; update: (p: Partial<CanvasSettings>) => void; grid: { snap: boolean; setSnap: (v: boolean) => void; gridSize: number; setGridSize: (v: number) => void } }) {
  return (
    <>
      <Section title="Size">
        <div className="sx-chips wrap">{SIZE_PRESETS.map(([w, h, label]) => <button key={label} className={c.width === w && c.height === h ? "on" : ""} onClick={() => update({ width: w, height: h })}>{label} <small>{w}×{h}</small></button>)}</div>
        <div className="sx-grid3">
          <Field label="Width"><Num value={c.width} min={50} max={2000} onChange={(width) => update({ width: Math.max(50, width) })} /></Field>
          <Field label="Height"><Num value={c.height} min={20} max={2000} onChange={(height) => update({ height: Math.max(20, height) })} /></Field>
          <Field label="Corner"><Num value={c.radius} min={0} onChange={(radius) => update({ radius })} /></Field>
        </div>
        <Toggle label="Clip layers to rounded card" checked={c.clip} onChange={(clip) => update({ clip })} />
      </Section>
      <Section title="Background"><PaintEditor paint={c.background} onChange={(background) => update({ background })} presets={PAINT_PRESETS} /></Section>
      <Section title="Mesh glow" aside={c.mesh ? <button className="sx-link" onClick={() => update({ meshSeed: Math.floor(Math.random() * 9999) })}><Sparkles /> Shuffle</button> : undefined}>
        <Toggle label="Soft color mesh" checked={c.mesh} onChange={(mesh) => update({ mesh })} />
        {c.mesh && <>
          <div className="sx-mesh-colors">{c.meshColors.map((col, i) => <input key={i} type="color" value={col} onChange={(e) => update({ meshColors: c.meshColors.map((x, j) => j === i ? e.target.value : x) })} />)}
            <button disabled={c.meshColors.length >= 6} onClick={() => update({ meshColors: [...c.meshColors, "#ffffff"] })}><Plus /></button>
            <button disabled={c.meshColors.length <= 1} onClick={() => update({ meshColors: c.meshColors.slice(0, -1) })}><Minus /></button></div>
          <div className="sx-chips wrap">{[["Sunset", ["#d4572a", "#e3b341", "#c2417a"]], ["Ocean", ["#264653", "#2a9d8f", "#5fb6c6", "#3178c6"]], ["Aurora", ["#2a9d8f", "#7c5cbf", "#7fb685", "#c2417a"]], ["Ember", ["#7a1f12", "#d4572a", "#e3b341"]], ["Mono", ["#ffffff", "#8a857b", "#3a362f"]]].map(([n, cols]) => <button key={n as string} onClick={() => update({ meshColors: cols as string[] })}>{n as string}</button>)}</div>
          <Slider label="Softness" min={10} max={140} value={c.meshBlur} onChange={(meshBlur) => update({ meshBlur })} />
          <Slider label="Strength" min={0} max={1} step={0.01} value={c.meshOpacity} onChange={(meshOpacity) => update({ meshOpacity })} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Toggle label="Slowly move" checked={c.meshAnimate} onChange={(meshAnimate) => update({ meshAnimate })} />
        </>}
      </Section>
      <Section title="Texture">
        <div className="sx-pattern-grid">{PATTERNS.map((p) => <button key={p} className={c.pattern === p ? "on" : ""} onClick={() => update({ pattern: p })}><span className={`pt pt-${p}`} />{p}</button>)}</div>
        {c.pattern !== "none" && <>
          {c.pattern !== "noise" && <Color value={c.patternColor} onChange={(patternColor) => update({ patternColor })} />}
          <Slider label="Strength" min={0} max={1} step={0.01} value={c.patternOpacity} onChange={(patternOpacity) => update({ patternOpacity })} fmt={(v) => `${Math.round(v * 100)}%`} />
          <Slider label="Scale" min={4} max={80} value={c.patternSize} onChange={(patternSize) => update({ patternSize })} />
        </>}
        {c.pattern !== "none" && c.pattern !== "noise" && <>
          <Toggle label={c.pattern === "stars" ? "Twinkle" : "Drift (animated)"} checked={c.patternDrift} onChange={(patternDrift) => update({ patternDrift })} />
          {c.pattern !== "stars" && <Slider label="Angle" min={0} max={180} value={c.patternAngle} onChange={(patternAngle) => update({ patternAngle })} fmt={(v) => `${v}°`} />}
        </>}
        <Slider label="Film grain" min={0} max={0.6} step={0.01} value={c.noiseOverlay} onChange={(noiseOverlay) => update({ noiseOverlay })} fmt={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Scanlines" min={0} max={0.6} step={0.01} value={c.scanlines} onChange={(scanlines) => update({ scanlines })} fmt={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Vignette" min={0} max={1} step={0.01} value={c.vignette} onChange={(vignette) => update({ vignette })} fmt={(v) => `${Math.round(v * 100)}%`} />
      </Section>
      <Section title="Border">
        <div className="sx-grid3">
          <Field label="Width"><Num value={c.borderWidth} min={0} step={0.5} onChange={(borderWidth) => update({ borderWidth })} /></Field>
          <Field label="Opacity"><Num value={Math.round(c.borderOpacity * 100)} suffix="%" onChange={(v) => update({ borderOpacity: v / 100 })} /></Field>
        </div>
        <Color value={c.borderColor} onChange={(borderColor) => update({ borderColor })} />
      </Section>
      <Section title="Editor">
        <Toggle label="Snap to grid" checked={grid.snap} onChange={grid.setSnap} />
        <Slider label="Grid size" min={2} max={50} value={grid.gridSize} onChange={grid.setGridSize} fmt={(v) => `${v}px`} />
        <button className="sx-btn" onClick={() => { if (confirm("Clear canvas settings to defaults?")) update(defaultCanvas()); }}><LayoutTemplate /> Reset canvas</button>
      </Section>
    </>
  );
}
