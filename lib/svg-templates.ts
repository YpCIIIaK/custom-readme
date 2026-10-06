import { createElement as el, defaultCanvas, FONTS, linear, radial, solid, type SvgDoc } from "./svg-model";

const mono = FONTS[1].value, serif = FONTS[2].value, grotesk = FONTS[4].value;

export type Template = { id: string; name: string; tag: string; build: () => SvgDoc };

export const TEMPLATES: Template[] = [
  {
    id: "hero", name: "Profile hero", tag: "830×260", build: () => ({
      canvas: { ...defaultCanvas(), background: linear(120, "#1b1a17", "#2b2620"), pattern: "dots", patternOpacity: 0.08, patternSize: 22 },
      elements: [
        el("blob", { name: "Warm blob", x: 560, y: -60, w: 320, h: 320, fill: radial(50, 50, 50, "#d4572a", "#d4572a"), opacity: 0.55, effects: { blur: 30 }, anim: { kind: "float", duration: 6, delay: 0, repeat: true } }),
        el("text", { name: "Eyebrow", x: 48, y: 52, w: 400, h: 20, text: "HELLO, I'M", fontSize: 13, fontFamily: mono, fontWeight: 500, letterSpacing: 3, fill: solid("#d4572a") }),
        el("text", { name: "Name", x: 48, y: 78, w: 520, h: 60, text: "Vladimir", fontSize: 54, fontFamily: serif, fontWeight: 700, fill: solid("#f4f1ea"), anim: { kind: "slide-up", duration: 0.8, delay: 0, repeat: false } }),
        el("text", { name: "Role", x: 48, y: 148, w: 480, h: 50, text: "Full-stack developer building tools for people who build things.", fontSize: 17, fontWeight: 400, fill: solid("#b9b2a5"), anim: { kind: "fade-in", duration: 1, delay: 0.4, repeat: false } }),
        el("badge", { name: "Badge 1", x: 48, y: 204, w: 110, h: 28, text: "TypeScript", fontSize: 12, fill: solid("#ffffff", 0.06), strokeWidth: 1, stroke: "#ffffff", strokeOpacity: 0.15, trackColor: "#e8e4dc" }),
        el("badge", { name: "Badge 2", x: 168, y: 204, w: 80, h: 28, text: "React", fontSize: 12, fill: solid("#ffffff", 0.06), strokeWidth: 1, stroke: "#ffffff", strokeOpacity: 0.15, trackColor: "#e8e4dc" }),
        el("badge", { name: "Badge 3", x: 258, y: 204, w: 76, h: 28, text: "Rust", fontSize: 12, fill: solid("#ffffff", 0.06), strokeWidth: 1, stroke: "#ffffff", strokeOpacity: 0.15, trackColor: "#e8e4dc" }),
        el("icon", { name: "Spark", x: 720, y: 96, w: 64, h: 64, icon: "sparkle", stroke: "#f4f1ea", strokeWidth: 1.5, anim: { kind: "spin", duration: 14, delay: 0, repeat: true } }),
      ],
    }),
  },
  {
    id: "project", name: "Project card", tag: "830×200", build: () => ({
      canvas: { ...defaultCanvas(), height: 200, background: solid("#f4f1ea"), borderColor: "#1c1b19", borderOpacity: 0.15 },
      elements: [
        el("rect", { name: "Accent bar", x: 0, y: 0, w: 8, h: 200, radius: 0, fill: solid("#2f6f4f") }),
        el("icon", { name: "Icon", x: 40, y: 40, w: 36, h: 36, icon: "shield", stroke: "#2f6f4f" }),
        el("text", { name: "Title", x: 92, y: 40, w: 500, h: 36, text: "Repo Anti-Rot", fontSize: 28, fontFamily: grotesk, fill: solid("#1c1b19") }),
        el("text", { name: "Description", x: 40, y: 96, w: 560, h: 50, text: "Audits repositories for technical decay: stale deps, dead code and abandoned issues.", fontSize: 16, fontWeight: 400, fill: solid("#57534b") }),
        el("text", { name: "Link", x: 40, y: 150, w: 200, h: 20, text: "Run an audit →", fontSize: 15, fontWeight: 700, fill: solid("#2f6f4f") }),
        el("text", { name: "Stars", x: 640, y: 44, w: 150, h: 20, text: "★ 128   ⑂ 14", fontSize: 14, fontFamily: mono, fontWeight: 500, align: "end", fill: solid("#57534b") }),
        el("progress", { name: "Health", x: 640, y: 150, w: 150, h: 8, value: 82, radius: 4, fill: solid("#2f6f4f"), trackColor: "#1c1b1918", anim: { kind: "draw", duration: 1.4, delay: 0.2, repeat: false } }),
        el("text", { name: "Health label", x: 640, y: 124, w: 150, h: 18, text: "health 82%", fontSize: 12, fontFamily: mono, fontWeight: 400, align: "end", fill: solid("#57534b") }),
      ],
    }),
  },
  {
    id: "terminal", name: "Terminal", tag: "720×300", build: () => ({
      canvas: { ...defaultCanvas(), width: 720, height: 300, radius: 12, background: solid("#101210"), pattern: "noise", patternOpacity: 0.05 },
      elements: [
        el("rect", { name: "Title bar", x: 0, y: 0, w: 720, h: 36, radius: 0, fill: solid("#1b1e1b") }),
        el("ellipse", { name: "Dot red", x: 16, y: 12, w: 12, h: 12, fill: solid("#e0625a") }),
        el("ellipse", { name: "Dot yellow", x: 36, y: 12, w: 12, h: 12, fill: solid("#e3b341") }),
        el("ellipse", { name: "Dot green", x: 56, y: 12, w: 12, h: 12, fill: solid("#5fb66b") }),
        el("text", { name: "Prompt", x: 28, y: 64, w: 660, h: 24, text: "$ whoami", fontSize: 18, fontFamily: mono, fontWeight: 500, fill: solid("#8fd694"), anim: { kind: "typing", duration: 1.2, delay: 0.2, repeat: false } }),
        el("text", { name: "Output", x: 28, y: 100, w: 660, h: 110, text: "> developer, tinkerer, coffee-driven\n> currently: building readme studio\n> ask me about: compilers, ui, svg", fontSize: 16, fontFamily: mono, fontWeight: 400, lineHeight: 1.6, fill: solid("#c9d1c9"), anim: { kind: "fade-in", duration: 0.6, delay: 1.5, repeat: false } }),
        el("rect", { name: "Cursor", x: 28, y: 236, w: 11, h: 20, radius: 1, fill: solid("#8fd694"), anim: { kind: "blink", duration: 1, delay: 0, repeat: true } }),
      ],
    }),
  },
  {
    id: "stats", name: "Skill meter", tag: "830×280", build: () => {
      const skills = [["TypeScript", 90, "#3178c6"], ["Python", 75, "#e3b341"], ["Rust", 55, "#d4572a"], ["Go", 40, "#5fb6c6"]] as const;
      return {
        canvas: { ...defaultCanvas(), height: 280, background: solid("#16181c"), pattern: "grid", patternOpacity: 0.04, patternSize: 28 },
        elements: [
          el("text", { name: "Heading", x: 40, y: 32, w: 400, h: 30, text: "What I work with", fontSize: 24, fontFamily: grotesk, fill: solid("#f4f1ea") }),
          ...skills.flatMap(([name, v, c], i) => [
            el("text", { name: `${name} label`, x: 40, y: 92 + i * 44, w: 140, h: 20, text: name, fontSize: 15, fontWeight: 500, fill: solid("#c9c4ba") }),
            el("progress", { name: `${name} bar`, x: 190, y: 98 + i * 44, w: 520, h: 10, radius: 5, value: v, fill: solid(c), trackColor: "#ffffff12", anim: { kind: "draw", duration: 1.2, delay: i * 0.15, repeat: false } }),
            el("text", { name: `${name} %`, x: 730, y: 92 + i * 44, w: 60, h: 20, text: `${v}%`, fontSize: 14, fontFamily: mono, fontWeight: 400, align: "end", fill: solid("#8a857b") }),
          ]),
        ],
      };
    },
  },
  {
    id: "banner", name: "Wave banner", tag: "830×180", build: () => ({
      canvas: { ...defaultCanvas(), height: 180, background: linear(90, "#264653", "#2a9d8f"), borderWidth: 0 },
      elements: [
        el("wave", { name: "Wave back", x: 0, y: 100, w: 830, h: 80, waves: 3, amplitude: 0.3, fill: solid("#e9c46a", 0.5), anim: { kind: "float", duration: 5, delay: 0, repeat: true } }),
        el("wave", { name: "Wave front", x: -20, y: 120, w: 870, h: 60, waves: 4, amplitude: 0.35, fill: solid("#f4a261", 0.8), anim: { kind: "float", duration: 4, delay: 1, repeat: true } }),
        el("text", { name: "Title", x: 0, y: 40, w: 830, h: 50, text: "Welcome to my corner of GitHub", fontSize: 34, fontFamily: serif, align: "middle", fill: solid("#fdfcf8"), wrap: false }),
      ],
    }),
  },
  {
    id: "minimal", name: "Minimal quote", tag: "830×160", build: () => ({
      canvas: { ...defaultCanvas(), height: 160, background: solid("#efe9dd"), borderWidth: 0, radius: 6 },
      elements: [
        el("text", { name: "Quote mark", x: 36, y: 10, w: 60, h: 80, text: "“", fontSize: 96, fontFamily: serif, fill: solid("#d4572a") }),
        el("text", { name: "Quote", x: 100, y: 42, w: 680, h: 60, text: "Make it work, make it right, make it fast.", fontSize: 26, fontFamily: serif, italic: true, fontWeight: 400, fill: solid("#1c1b19") }),
        el("text", { name: "Author", x: 100, y: 104, w: 400, h: 20, text: "— Kent Beck", fontSize: 14, fontFamily: mono, fontWeight: 400, fill: solid("#6b665c") }),
      ],
    }),
  },
  {
    id: "aurora", name: "Aurora mesh", tag: "830×240", build: () => ({
      canvas: { ...defaultCanvas(), height: 240, background: solid("#0e0d14"), mesh: true, meshAnimate: true, meshColors: ["#d4572a", "#7c5cbf", "#2a9d8f", "#c2417a"], meshBlur: 55, meshOpacity: 0.75, noiseOverlay: 0.12, pattern: "stars", patternSize: 26, patternOpacity: 0.5, patternDrift: true },
      elements: [
        el("text", { name: "Title", x: 0, y: 78, w: 830, h: 60, text: "Building things that feel good", fontSize: 42, fontFamily: serif, align: "middle", wrap: false, fill: solid("#ffffff"), anim: { kind: "zoom-in", duration: 0.9, delay: 0, repeat: false } }),
        el("text", { name: "Subtitle", x: 0, y: 140, w: 830, h: 24, text: "design · code · open source", fontSize: 15, fontFamily: mono, fontWeight: 400, letterSpacing: 4, align: "middle", wrap: false, fill: solid("#ffffff", 0.7), anim: { kind: "fade-in", duration: 1, delay: 0.6, repeat: false } }),
      ],
    }),
  },
  {
    id: "dashboard", name: "Stats dashboard", tag: "830×220", build: () => ({
      canvas: { ...defaultCanvas(), height: 220, background: solid("#141518"), pattern: "dots", patternOpacity: 0.05, patternSize: 18 },
      elements: [
        el("ring", { name: "Ring", x: 40, y: 50, w: 120, h: 120, value: 78, fill: linear(90, "#e0703f", "#c2417a"), stroke: "#f4f1ea", fontFamily: mono, anim: { kind: "draw", duration: 1.4, delay: 0, repeat: false } }),
        el("text", { name: "Ring label", x: 40, y: 182, w: 120, h: 18, text: "goals this year", fontSize: 12, fontFamily: mono, fontWeight: 400, align: "middle", fill: solid("#8a857b") }),
        el("text", { name: "Bars title", x: 210, y: 36, w: 260, h: 20, text: "Commits / week", fontSize: 14, fontWeight: 600, fill: solid("#c9c4ba") }),
        el("bars", { name: "Bars", x: 210, y: 70, w: 260, h: 110, values: "3,6,4,9,7,12,8,10,5,11", fill: linear(180, "#e3b341", "#d4572a"), anim: { kind: "draw", duration: 0.6, delay: 0.2, repeat: false } }),
        el("text", { name: "Spark title", x: 520, y: 36, w: 270, h: 20, text: "Stars over time", fontSize: 14, fontWeight: 600, fill: solid("#c9c4ba") }),
        el("sparkline", { name: "Sparkline", x: 520, y: 70, w: 270, h: 110, values: "2,3,3,5,8,7,12,15,14,21,26", stroke: "#7fb685", fill: solid("#7fb685"), strokeWidth: 3, anim: { kind: "draw", duration: 1.6, delay: 0.3, repeat: false } }),
      ],
    }),
  },
  {
    id: "chat", name: "Speech bubble", tag: "830×170", build: () => ({
      canvas: { ...defaultCanvas(), height: 170, background: linear(135, "#f4f1ea", "#e7dfcf"), borderWidth: 0, pattern: "hexagons", patternColor: "#1c1b19", patternOpacity: 0.05, patternSize: 30 },
      elements: [
        el("ellipse", { name: "Avatar", x: 40, y: 60, w: 70, h: 70, fill: linear(135, "#d4572a", "#e3b341") }),
        el("text", { name: "Avatar emoji", x: 40, y: 76, w: 70, h: 40, text: "👋", fontSize: 30, align: "middle", wrap: false }),
        el("bubble", { name: "Bubble", x: 130, y: 30, w: 420, h: 86, text: "Hi! Thanks for visiting my profile", fontSize: 18, fill: solid("#1c1b19"), trackColor: "#f4f1ea", anim: { kind: "drop-in", duration: 0.8, delay: 0.2, repeat: false } }),
        el("heart", { name: "Heart", x: 600, y: 50, w: 60, h: 54, fill: solid("#e0625a"), anim: { kind: "heartbeat", duration: 1.4, delay: 0, repeat: true } }),
        el("dotgrid", { name: "Dots", x: 690, y: 30, w: 110, h: 110, spacing: 14, radius: 2, fill: solid("#1c1b19", 0.25) }),
      ],
    }),
  },
  {
    id: "repo-janitor", name: "Repo Janitor", tag: "850×280", build: () => {
      const ink = "#1c1b19", muted = "#6b665c", paper = "#f6f4ee";
      const findings = [["#d64933", "Stale dependencies", "high"], ["#e3a33b", "No CI on pull requests", "medium"], ["#e3a33b", "Missing CONTRIBUTING", "low"], ["#3f8f5a", "License present", "ok"]] as const;
      return {
        canvas: { ...defaultCanvas(), width: 850, height: 280, radius: 14, background: solid(paper), pattern: "grid", patternColor: ink, patternOpacity: 0.035, patternSize: 22, borderColor: ink, borderOpacity: 0.14 },
        elements: [
          el("text", { name: "Eyebrow", x: 40, y: 36, w: 440, h: 16, text: "REPO JANITOR · REPOSITORY MAINTENANCE", fontSize: 11, fontFamily: mono, fontWeight: 600, letterSpacing: 2, fill: solid("#3f8f5a") }),
          el("text", { name: "Title", x: 40, y: 60, w: 470, h: 80, text: "Know what needs attention.\nSee where to start.", fontSize: 32, fontFamily: serif, fontWeight: 700, lineHeight: 1.15, fill: solid(ink), anim: { kind: "slide-up", duration: 0.7, delay: 0, repeat: false } }),
          el("text", { name: "Description", x: 40, y: 146, w: 470, h: 44, text: "Scan any public repo, inspect the evidence behind each finding and get a prioritized plan of what to fix first.", fontSize: 14, fontWeight: 400, lineHeight: 1.45, fill: solid(muted), anim: { kind: "fade-in", duration: 0.8, delay: 0.3, repeat: false } }),
          el("badge", { name: "Pill checks", x: 40, y: 206, w: 96, h: 26, radius: 13, text: "27 checks", fontSize: 12, fontFamily: mono, fill: solid(ink, 0.05), strokeWidth: 1, stroke: ink, strokeOpacity: 0.15, trackColor: ink }),
          el("badge", { name: "Pill families", x: 144, y: 206, w: 102, h: 26, radius: 13, text: "6 families", fontSize: 12, fontFamily: mono, fill: solid(ink, 0.05), strokeWidth: 1, stroke: ink, strokeOpacity: 0.15, trackColor: ink }),
          el("badge", { name: "Pill no account", x: 254, y: 206, w: 108, h: 26, radius: 13, text: "no account", fontSize: 12, fontFamily: mono, fill: solid(ink, 0.05), strokeWidth: 1, stroke: ink, strokeOpacity: 0.15, trackColor: ink }),
          el("badge", { name: "CTA", x: 372, y: 204, w: 138, h: 30, radius: 8, text: "Run a scan →", fontSize: 13, fill: solid(ink), trackColor: paper, link: "https://repo-anti-rot.onrender.com/" }),
          el("rect", { name: "Report panel", x: 552, y: 28, w: 270, h: 224, radius: 12, fill: solid("#ffffff"), strokeWidth: 1, stroke: ink, strokeOpacity: 0.12, effects: { shadow: true, shadowY: 10, shadowBlur: 26, shadowOpacity: 0.08 } }),
          el("text", { name: "Report label", x: 572, y: 44, w: 160, h: 14, text: "report · express", fontSize: 11, fontFamily: mono, fontWeight: 500, fill: solid(muted) }),
          el("ring", { name: "Score", x: 572, y: 66, w: 76, h: 76, value: 82, strokeWidth: 7, fill: linear(90, "#3f8f5a", "#7fb685"), trackColor: "#1c1b1914", stroke: ink, fontSize: 18, fontFamily: mono, fontWeight: 700, anim: { kind: "draw", duration: 1.4, delay: 0.2, repeat: false } }),
          el("text", { name: "Score caption", x: 662, y: 80, w: 150, h: 40, text: "maintenance\nscore", fontSize: 13, fontWeight: 600, lineHeight: 1.3, fill: solid(ink) }),
          el("line", { name: "Divider", x: 572, y: 156, w: 230, h: 0, stroke: ink, strokeOpacity: 0.1, strokeWidth: 1 }),
          ...findings.flatMap(([c, label, sev], i) => [
            el("ellipse", { name: `${label} dot`, x: 574, y: 172 + i * 19, w: 8, h: 8, fill: solid(c), anim: i === 0 ? { kind: "heartbeat", duration: 1.6, delay: 0, repeat: true } : { kind: "none" } }),
            el("text", { name: label, x: 590, y: 167 + i * 19, w: 150, h: 16, text: label, fontSize: 12, fontWeight: 500, wrap: false, fill: solid(ink), anim: { kind: "slide-left", duration: 0.5, delay: 0.5 + i * 0.15, repeat: false } }),
            el("text", { name: `${label} severity`, x: 742, y: 167 + i * 19, w: 60, h: 16, text: sev, fontSize: 11, fontFamily: mono, fontWeight: 500, align: "end", wrap: false, fill: solid(c), anim: { kind: "fade-in", duration: 0.5, delay: 0.6 + i * 0.15, repeat: false } }),
          ]),
        ],
      };
    },
  },
  {
    id: "vscode-portfolio", name: "VS Code portfolio", tag: "850×300", build: () => {
      const cw = 8.4, ex = 266, ly = 82, lh = 21;
      const C = { kw: "#569cd6", str: "#ce9178", fn: "#dcdcaa", com: "#6a9955", txt: "#d4d4d4", num: "#b5cea8", typ: "#4ec9b0" };
      const code: [string, string][][] = [
        [["# ", C.kw], ["👋 Vladimir — Fullstack Developer", C.txt]],
        [],
        [["// ", C.com], ["interfaces that don't annoy, backends that feed them live", C.com]],
        [["const ", C.kw], ["stack", "#9cdcfe"], [" = [", C.txt], ['"React"', C.str], [", ", C.txt], ['"TypeScript"', C.str], [", ", C.txt], ['"Go"', C.str], [", ", C.txt], ['"Node"', C.str], ["];", C.txt]],
        [["const ", C.kw], ["experience", "#9cdcfe"], [" = ", C.txt], ["2", C.num], [" + ", C.txt], ['"years, two startups"', C.str], [";", C.txt]],
        [],
        [["export default function ", C.kw], ["Portfolio", C.fn], ["() {", C.txt]],
        [["  return ", C.kw], ["<", C.txt], ["Projects", C.typ], [" realtime ai oauth ", "#9cdcfe"], ["/>", C.txt]],
        [["}", C.txt]],
      ];
      const files: [string, string, number][] = [["▾ projects", "#c5c5c5", 0], ["repo-anti-rot.ts", "#3178c6", 1], ["wifi-analyzer.go", "#00ADD8", 1], ["vortan-crypto.tsx", "#519aba", 1], ["bounty-scanner.ts", "#3178c6", 1], ["▾ about", "#c5c5c5", 0], ["about.md", "#519aba", 1], ["skills.json", "#cbcb41", 1]];
      return {
        canvas: { ...defaultCanvas(), width: 850, height: 300, radius: 10, background: solid("#1e1e1e"), borderColor: "#000000", borderOpacity: 0.6 },
        elements: [
          el("rect", { name: "Title bar", x: 0, y: 0, w: 850, h: 30, radius: 0, fill: solid("#323233") }),
          el("ellipse", { name: "Close", x: 14, y: 9, w: 12, h: 12, fill: solid("#ff5f57") }),
          el("ellipse", { name: "Minimize", x: 34, y: 9, w: 12, h: 12, fill: solid("#febc2e") }),
          el("ellipse", { name: "Zoom", x: 54, y: 9, w: 12, h: 12, fill: solid("#28c840") }),
          el("text", { name: "Window title", x: 0, y: 8, w: 850, h: 14, text: "portfolio — Vladimir — Visual Studio Code", fontSize: 12, fontWeight: 400, align: "middle", wrap: false, fill: solid("#9d9d9d") }),
          el("rect", { name: "Activity bar", x: 0, y: 30, w: 44, h: 248, radius: 0, fill: solid("#333333") }),
          ...["layers", "git", "code", "terminal"].map((icon, i) => el("icon", { name: `Activity ${icon}`, x: 11, y: 44 + i * 42, w: 22, h: 22, icon, stroke: i === 0 ? "#ffffff" : "#858585", strokeWidth: 1.6 })),
          el("rect", { name: "Active marker", x: 0, y: 40, w: 2, h: 32, radius: 0, fill: solid("#ffffff") }),
          el("rect", { name: "Sidebar", x: 44, y: 30, w: 176, h: 248, radius: 0, fill: solid("#252526") }),
          el("text", { name: "Explorer", x: 60, y: 42, w: 150, h: 14, text: "EXPLORER", fontSize: 11, fontWeight: 600, letterSpacing: 1, wrap: false, fill: solid("#bbbbbb") }),
          el("rect", { name: "Selected file", x: 44, y: 88, w: 176, h: 22, radius: 0, fill: solid("#37373d"), opacity: 0.9 }),
          ...files.flatMap(([f, c, depth], i) => [
            ...(depth ? [el("rect", { name: `${f} icon`, x: 72, y: 72 + i * 22, w: 10, h: 10, radius: 2, fill: solid(c) })] : []),
            el("text", { name: f, x: depth ? 88 : 60, y: 68 + i * 22, w: 130, h: 16, text: f, fontSize: 13, fontWeight: depth ? 400 : 600, wrap: false, fill: solid(i === 1 ? "#ffffff" : "#cccccc") }),
          ]),
          el("rect", { name: "Tab bar", x: 220, y: 30, w: 630, h: 34, radius: 0, fill: solid("#2d2d2d") }),
          el("rect", { name: "Active tab", x: 220, y: 30, w: 132, h: 34, radius: 0, fill: solid("#1e1e1e") }),
          el("rect", { name: "Tab accent", x: 220, y: 30, w: 132, h: 2, radius: 0, fill: solid("#007acc") }),
          el("text", { name: "Tab README", x: 236, y: 39, w: 110, h: 16, text: "README.md", fontSize: 13, wrap: false, fontWeight: 400, fill: solid("#ffffff") }),
          el("text", { name: "Tab skills", x: 368, y: 39, w: 110, h: 16, text: "skills.json", fontSize: 13, wrap: false, fontWeight: 400, fill: solid("#8b8b8b") }),
          ...code.flatMap((tokens, i) => {
            const out = [el("text", { name: `Ln ${i + 1}`, x: ex - 30, y: ly + i * lh, w: 20, h: 16, text: String(i + 1), fontSize: 13, fontFamily: mono, fontWeight: 400, align: "end", wrap: false, fill: solid("#6e7681") })];
            let col = 0;
            tokens.forEach(([raw, c], j) => { const lead = raw.length - raw.trimStart().length; const t = raw.trim(); if (t) out.push(el("text", { name: `L${i + 1} ${j}`, x: ex + (col + lead) * cw, y: ly + i * lh, w: t.length * cw + 20, h: 16, text: t, fontSize: 14, fontFamily: mono, fontWeight: i === 0 ? 700 : 400, wrap: false, fill: solid(c), anim: { kind: "fade-in", duration: 0.4, delay: 0.15 + i * 0.12, repeat: false } })); col += [...raw].length + (raw.includes("👋") ? 1 : 0); });
            return out;
          }),
          el("rect", { name: "Cursor", x: ex + 8, y: ly + 8 * lh, w: 2, h: 17, radius: 0, fill: solid("#aeafad"), anim: { kind: "blink", duration: 1, delay: 0, repeat: true } }),
          el("badge", { name: "Visit badge", x: 596, y: 78, w: 236, h: 28, radius: 6, text: "ypciiiaksportfolio.vercel.app ↗", fontSize: 11, fontFamily: mono, fill: solid("#0e639c"), trackColor: "#ffffff", link: "https://ypciiiaksportfolio.vercel.app/" }),
          el("rect", { name: "Status bar", x: 0, y: 278, w: 850, h: 22, radius: 0, fill: solid("#007acc") }),
          el("text", { name: "Status left", x: 12, y: 282, w: 300, h: 14, text: "⎇ main  ·  ⊗ 0  ⚠ 0", fontSize: 12, wrap: false, fontWeight: 400, fill: solid("#ffffff") }),
          el("text", { name: "Status right", x: 500, y: 282, w: 338, h: 14, text: "Ln 9, Col 2  ·  Spaces: 2  ·  UTF-8  ·  TypeScript React", fontSize: 12, align: "end", wrap: false, fontWeight: 400, fill: solid("#ffffff") }),
        ],
      };
    },
  },
  { id: "blank", name: "Blank", tag: "830×260", build: () => ({ canvas: defaultCanvas(), elements: [] }) },
];
