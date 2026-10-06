"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, FileCode2, Link2, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type CardTheme = "aurora" | "terminal" | "sunset" | "mono";

const presets: Record<CardTheme, { name: string; background: string; surface: string; accent: string; text: string; muted: string }> = {
  aurora: { name: "Aurora", background: "#090b16", surface: "#11152a", accent: "#8b5cf6", text: "#f5f3ff", muted: "#a7a5bd" },
  terminal: { name: "Terminal", background: "#06100a", surface: "#0b1a10", accent: "#65f58b", text: "#e8ffed", muted: "#8bb697" },
  sunset: { name: "Sunset", background: "#180b17", surface: "#2a1022", accent: "#fb7185", text: "#fff1f2", muted: "#d5a4ae" },
  mono: { name: "Monochrome", background: "#0d1117", surface: "#161b22", accent: "#f0f6fc", text: "#f0f6fc", muted: "#8b949e" },
};

function xml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "project-card";
}

function wrapText(value: string, limit = 54) {
  const words = value.trim().split(/\s+/); const lines: string[] = []; let line = "";
  words.forEach((word) => { const candidate = line ? `${line} ${word}` : word; if (candidate.length > limit && line) { lines.push(line); line = word; } else line = candidate; });
  if (line) lines.push(line); return lines.slice(0, 2);
}

export function SvgCardDesigner() {
  const [theme, setTheme] = useState<CardTheme>("aurora");
  const [title, setTitle] = useState("Repo Anti-Rot");
  const [description, setDescription] = useState("Keep repositories healthy, maintainable, and ready to evolve.");
  const [eyebrow, setEyebrow] = useState("OPEN SOURCE TOOL");
  const [icon, setIcon] = useState("RA");
  const [width, setWidth] = useState(760);
  const [height, setHeight] = useState(260);
  const [animated, setAnimated] = useState(true);
  const [filename, setFilename] = useState("repo-anti-rot-card");
  const [targetUrl, setTargetUrl] = useState("https://repo-anti-rot.onrender.com/");
  const [copied, setCopied] = useState(false);
  const palette = presets[theme];
  const descriptionLines = wrapText(description);

  const svg = useMemo(() => {
    const safeTitle = xml(title); const safeEyebrow = xml(eyebrow); const safeIcon = xml(icon.slice(0, 3));
    const lines = wrapText(description).map((line, index) => `<tspan x="64" dy="${index === 0 ? 0 : 25}">${xml(line)}</tspan>`).join("");
    const motion = animated ? `<animate attributeName="opacity" values=".38;.85;.38" dur="3.2s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="0 0;10 0;0 0" dur="6s" repeatCount="indefinite"/>` : "";
    const cursor = animated ? `<rect x="${Math.max(185, Math.min(width - 60, 64 + title.length * 22))}" y="75" width="3" height="41" rx="1.5" fill="${palette.accent}"><animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${safeTitle}</title><desc id="desc">${xml(description)}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette.background}"/><stop offset="1" stop-color="${palette.surface}"/></linearGradient>
    <radialGradient id="glow"><stop stop-color="${palette.accent}" stop-opacity=".34"/><stop offset="1" stop-color="${palette.accent}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${palette.text}" stroke-opacity=".035"/></pattern>
    <clipPath id="card-clip"><rect width="${width}" height="${height}" rx="22"/></clipPath>
  </defs>
  <g clip-path="url(#card-clip)">
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <circle cx="${width - 64}" cy="46" r="145" fill="url(#glow)">${motion}</circle>
    <g font-family="Inter,Segoe UI,Arial,sans-serif">
    <rect x="64" y="35" width="${Math.max(112, safeEyebrow.length * 8 + 24)}" height="27" rx="13.5" fill="${palette.accent}" fill-opacity=".13" stroke="${palette.accent}" stroke-opacity=".45"/>
    <text x="76" y="53" fill="${palette.accent}" font-size="11" font-weight="700" letter-spacing="1.2">${safeEyebrow}</text>
    <text x="64" y="113" fill="${palette.text}" font-size="42" font-weight="750" letter-spacing="-1.2">${safeTitle}</text>${cursor}
    <text x="64" y="153" fill="${palette.muted}" font-size="17" font-weight="400">${lines}</text>
    <g transform="translate(64 ${height - 54})"><circle cx="7" cy="7" r="7" fill="${palette.accent}" fill-opacity=".18"/><circle cx="7" cy="7" r="3" fill="${palette.accent}"/><text x="22" y="11" fill="${palette.muted}" font-size="13">VIEW PROJECT</text></g>
    <g transform="translate(${width - 104} ${height - 100})"><rect width="56" height="56" rx="15" fill="${palette.accent}"/><text x="28" y="36" text-anchor="middle" fill="${palette.background}" font-size="18" font-weight="800">${safeIcon}</text></g>
    </g>
  </g>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="21" fill="none" stroke="${palette.text}" stroke-opacity=".14"/>
</svg>`;
  }, [animated, description, eyebrow, height, icon, palette, title, width]);

  const normalizedFilename = `${slugify(filename)}.svg`;
  const markdown = `[![${title}](./assets/${normalizedFilename})](${targetUrl})`;
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const download = () => { const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = normalizedFilename; anchor.click(); URL.revokeObjectURL(url); };
  const copy = async () => { await navigator.clipboard.writeText(markdown); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  return <section className="svg-studio">
    <aside className="svg-settings panel">
      <div className="svg-panel-title"><div><span>SVG CARD</span><small>GitHub-compatible export</small></div><FileCode2 /></div>
      <div className="svg-form">
        <div className="section-label"><Sparkles /> Template</div>
        <div className="preset-grid">{(Object.keys(presets) as CardTheme[]).map((key) => <button key={key} className={theme === key ? "active" : ""} onClick={() => setTheme(key)}><i style={{ background: presets[key].accent }} /><span>{presets[key].name}</span>{theme === key && <Check />}</button>)}</div>
        <Label htmlFor="svg-eyebrow">Label</Label><Input id="svg-eyebrow" value={eyebrow} maxLength={24} onChange={(event) => setEyebrow(event.target.value)} />
        <Label htmlFor="svg-title">Title</Label><Input id="svg-title" value={title} maxLength={30} onChange={(event) => setTitle(event.target.value)} />
        <Label htmlFor="svg-description">Description</Label><Textarea id="svg-description" value={description} maxLength={110} rows={3} onChange={(event) => setDescription(event.target.value)} />
        <div className="svg-field-row"><div><Label htmlFor="svg-icon">Mark</Label><Input id="svg-icon" value={icon} maxLength={3} onChange={(event) => setIcon(event.target.value.toUpperCase())} /></div><div><Label htmlFor="svg-file">Filename</Label><Input id="svg-file" value={filename} onChange={(event) => setFilename(event.target.value)} /></div></div>
        <div className="svg-field-row"><div><Label htmlFor="svg-width">Width</Label><Input id="svg-width" type="number" min={480} max={1200} value={width} onChange={(event) => setWidth(Math.max(480, Math.min(1200, Number(event.target.value))))} /></div><div><Label htmlFor="svg-height">Height</Label><Input id="svg-height" type="number" min={220} max={480} value={height} onChange={(event) => setHeight(Math.max(220, Math.min(480, Number(event.target.value))))} /></div></div>
        <div className="animation-control"><div><Play /><span><strong>Subtle animation</strong><small>Safe SMIL motion, no JavaScript</small></span></div><Switch checked={animated} onCheckedChange={setAnimated} aria-label="Enable animation" /></div>
      </div>
    </aside>
    <section className="svg-preview-panel panel">
      <div className="svg-stage-label"><span>LIVE SVG PREVIEW</span><span>{width} × {height}</span></div>
      <div className="svg-stage"><img src={dataUrl} alt={`${title} SVG card preview`} /></div>
      <div className="svg-note"><span>100% standalone</span><span>No scripts</span><span>GitHub-ready</span></div>
    </section>
    <aside className="svg-export panel">
      <div className="svg-panel-title"><div><span>EXPORT</span><small>Download and embed</small></div><Download /></div>
      <div className="export-file"><FileCode2 /><div><strong>{normalizedFilename}</strong><small>SVG · {Math.ceil(new Blob([svg]).size / 1024)} KB</small></div></div>
      <Button className="download-svg" onClick={download}><Download /> Download SVG</Button>
      <div className="export-divider"><span>THEN ADD IT TO</span></div>
      <div className="path-card"><code>your-profile/assets/{normalizedFilename}</code></div>
      <Label htmlFor="target-url"><Link2 /> Click destination</Label><Input id="target-url" value={targetUrl} onChange={(event) => setTargetUrl(event.target.value)} />
      <Label htmlFor="markdown-output">Markdown</Label><Textarea id="markdown-output" readOnly value={markdown} rows={5} />
      <Button variant="outline" className="copy-embed" onClick={copy}>{copied ? <Check /> : <Clipboard />} {copied ? "Copied" : "Copy Markdown"}</Button>
      <div className="embed-steps"><span>1</span><p>Download the SVG</p><span>2</span><p>Put it in your repository’s <code>assets</code> folder</p><span>3</span><p>Paste the Markdown into your README</p></div>
      <p className="svg-warning">Do not paste the raw <code>&lt;svg&gt;</code> source into README. GitHub will display parts of it as code.</p>
    </aside>
  </section>;
}
