// README block model and Markdown/HTML generator. Everything here produces
// GitHub-safe output: no CSS, no scripts, only tags GitHub's sanitizer keeps.

export type Align = "left" | "center" | "right";
export type BadgeStyle = "flat" | "flat-square" | "for-the-badge" | "plastic" | "social";
export type Badge = { label: string; message: string; color: string; logo: string; link: string };
export type Social = { platform: string; value: string };
export type Project = { icon: string; title: string; description: string; url: string; cta: string };

export type Block =
  | { id: string; type: "header"; title: string; subtitle: string; align: Align; level: 1 | 2; banner: string; emoji: string }
  | { id: string; type: "typing"; lines: string; color: string; size: number; width: number; height: number; font: string; center: boolean; duration: number; align: Align }
  | { id: string; type: "text"; content: string; align: Align }
  | { id: string; type: "heading"; text: string; level: 2 | 3 | 4; emoji: string; align: Align }
  | { id: string; type: "badges"; items: Badge[]; style: BadgeStyle; align: Align }
  | { id: string; type: "socials"; items: Social[]; style: BadgeStyle; align: Align; iconsOnly: boolean }
  | { id: string; type: "techstack"; icons: string; perline: number; theme: "dark" | "light"; align: Align }
  | { id: string; type: "stats"; username: string; stats: boolean; langs: boolean; streak: boolean; trophies: boolean; activity: boolean; theme: string; hideBorder: boolean; align: Align }
  | { id: string; type: "projects"; items: Project[]; columns: number }
  | { id: string; type: "image"; url: string; alt: string; width: number; align: Align; link: string; darkUrl: string }
  | { id: string; type: "divider"; kind: "hr" | "rainbow" | "space" | "line"; size: number }
  | { id: string; type: "code"; lang: string; content: string }
  | { id: string; type: "quote"; kind: "quote" | "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION"; text: string; author: string }
  | { id: string; type: "list"; kind: "bullet" | "numbered" | "task"; items: string }
  | { id: string; type: "details"; summary: string; content: string; open: boolean }
  | { id: string; type: "table"; csv: string; align: Align }
  | { id: string; type: "toc"; title: string; depth: 2 | 3 }
  | { id: string; type: "snake"; username: string; dark: boolean; align: Align }
  | { id: string; type: "visitors"; username: string; label: string; color: string; style: BadgeStyle; align: Align }
  | { id: string; type: "quoteapi"; theme: string; align: Align }
  | { id: string; type: "html"; content: string };

export type BlockType = Block["type"];

let n = 0;
export const bid = () => `b${Date.now().toString(36)}${(n++).toString(36)}`;

export const BLOCK_META: Record<BlockType, { label: string; hint: string; group: "Basics" | "Profile" | "Media" | "Structure" }> = {
  header: { label: "Header", hint: "Title, subtitle, banner", group: "Basics" },
  heading: { label: "Section title", hint: "## heading", group: "Basics" },
  text: { label: "Text", hint: "Free markdown", group: "Basics" },
  list: { label: "List", hint: "Bullets, numbers, tasks", group: "Basics" },
  quote: { label: "Quote / alert", hint: "> NOTE, TIP, WARNING", group: "Basics" },
  code: { label: "Code", hint: "Fenced code block", group: "Basics" },
  typing: { label: "Typing text", hint: "Animated SVG lines", group: "Profile" },
  badges: { label: "Badges", hint: "shields.io badges", group: "Profile" },
  socials: { label: "Social links", hint: "GitHub, X, Telegram…", group: "Profile" },
  techstack: { label: "Tech stack", hint: "skillicons.dev", group: "Profile" },
  stats: { label: "GitHub stats", hint: "Stats, languages, streak", group: "Profile" },
  snake: { label: "Contribution snake", hint: "Animated graph", group: "Profile" },
  visitors: { label: "Visitor counter", hint: "Profile view badge", group: "Profile" },
  quoteapi: { label: "Dev quote", hint: "Random programming quote", group: "Profile" },
  projects: { label: "Project cards", hint: "Table grid of projects", group: "Media" },
  image: { label: "Image / SVG", hint: "Banner, GIF, card", group: "Media" },
  table: { label: "Table", hint: "From CSV", group: "Structure" },
  details: { label: "Collapsible", hint: "<details> section", group: "Structure" },
  toc: { label: "Contents", hint: "Auto table of contents", group: "Structure" },
  divider: { label: "Divider", hint: "Line or spacing", group: "Structure" },
  html: { label: "Raw HTML", hint: "Anything else", group: "Structure" },
};

export const SOCIALS: Record<string, { label: string; color: string; logo: string; url: (v: string) => string; placeholder: string }> = {
  github: { label: "GitHub", color: "181717", logo: "github", url: (v) => `https://github.com/${v}`, placeholder: "username" },
  linkedin: { label: "LinkedIn", color: "0A66C2", logo: "linkedin", url: (v) => `https://linkedin.com/in/${v}`, placeholder: "profile-id" },
  x: { label: "X", color: "000000", logo: "x", url: (v) => `https://x.com/${v}`, placeholder: "handle" },
  telegram: { label: "Telegram", color: "26A5E4", logo: "telegram", url: (v) => `https://t.me/${v}`, placeholder: "username" },
  discord: { label: "Discord", color: "5865F2", logo: "discord", url: (v) => v.startsWith("http") ? v : `https://discord.gg/${v}`, placeholder: "invite code" },
  youtube: { label: "YouTube", color: "FF0000", logo: "youtube", url: (v) => `https://youtube.com/@${v}`, placeholder: "channel" },
  twitch: { label: "Twitch", color: "9146FF", logo: "twitch", url: (v) => `https://twitch.tv/${v}`, placeholder: "channel" },
  instagram: { label: "Instagram", color: "E4405F", logo: "instagram", url: (v) => `https://instagram.com/${v}`, placeholder: "username" },
  vk: { label: "VK", color: "0077FF", logo: "vk", url: (v) => `https://vk.com/${v}`, placeholder: "id" },
  habr: { label: "Habr", color: "65A3BE", logo: "habr", url: (v) => `https://habr.com/users/${v}`, placeholder: "username" },
  leetcode: { label: "LeetCode", color: "FFA116", logo: "leetcode", url: (v) => `https://leetcode.com/${v}`, placeholder: "username" },
  devto: { label: "dev.to", color: "0A0A0A", logo: "devdotto", url: (v) => `https://dev.to/${v}`, placeholder: "username" },
  medium: { label: "Medium", color: "000000", logo: "medium", url: (v) => `https://medium.com/@${v}`, placeholder: "username" },
  mastodon: { label: "Mastodon", color: "6364FF", logo: "mastodon", url: (v) => v, placeholder: "https://…" },
  email: { label: "Email", color: "D14836", logo: "gmail", url: (v) => `mailto:${v}`, placeholder: "you@mail.com" },
  website: { label: "Website", color: "4A4A4A", logo: "googlechrome", url: (v) => v, placeholder: "https://…" },
  kofi: { label: "Ko-fi", color: "FF5E5B", logo: "kofi", url: (v) => `https://ko-fi.com/${v}`, placeholder: "username" },
  buymeacoffee: { label: "Buy me a coffee", color: "FFDD00", logo: "buymeacoffee", url: (v) => `https://buymeacoffee.com/${v}`, placeholder: "username" },
};

export const STATS_THEMES = ["default", "dark", "radical", "tokyonight", "gruvbox", "onedark", "dracula", "nord", "github_dark", "transparent", "merko", "cobalt", "synthwave", "highcontrast", "catppuccin_mocha", "rose_pine"];
export const QUOTE_THEMES = ["light", "dark", "radical", "merko", "gruvbox", "tokyonight", "onedark", "cobalt", "synthwave", "highcontrast", "dracula"];
export const SKILL_ICONS = "js,ts,react,nextjs,vue,svelte,angular,nodejs,deno,bun,python,django,fastapi,flask,go,rust,java,kotlin,swift,cpp,c,cs,php,laravel,ruby,rails,html,css,tailwind,sass,figma,docker,kubernetes,aws,gcp,azure,linux,git,github,gitlab,postgres,mysql,mongodb,redis,sqlite,graphql,prisma,vite,webpack,jest,vscode,vim,bash,powershell,electron,flutter,dart,unity,blender,cloudflare,vercel,nginx,lua,haskell,elixir,scala,r".split(",");

export function createBlock(type: BlockType): Block {
  const id = bid();
  switch (type) {
    case "header": return { id, type, title: "Hi there, I'm Vladimir", subtitle: "Full-stack developer who likes building tools for other developers.", align: "center", level: 1, banner: "", emoji: "👋" };
    case "typing": return { id, type, lines: "Full-stack developer;Open-source enthusiast;Always learning something new", color: "D4572A", size: 22, width: 480, height: 50, font: "Fira Code", center: true, duration: 3000, align: "center" };
    case "text": return { id, type, content: "I'm currently working on **Readme Studio** — a visual builder for GitHub profiles.\nAsk me about *TypeScript*, *React* and *SVG*.", align: "left" };
    case "heading": return { id, type, text: "About me", level: 2, emoji: "", align: "left" };
    case "badges": return { id, type, style: "for-the-badge", align: "center", items: [
      { label: "", message: "TypeScript", color: "3178C6", logo: "typescript", link: "" },
      { label: "", message: "React", color: "20232A", logo: "react", link: "" },
      { label: "", message: "Node.js", color: "339933", logo: "nodedotjs", link: "" },
    ] };
    case "socials": return { id, type, style: "for-the-badge", align: "center", iconsOnly: false, items: [{ platform: "github", value: "YpCIIIaK" }, { platform: "telegram", value: "username" }, { platform: "email", value: "you@mail.com" }] };
    case "techstack": return { id, type, icons: "ts,react,nextjs,nodejs,python,docker,postgres,git", perline: 8, theme: "dark", align: "center" };
    case "stats": return { id, type, username: "YpCIIIaK", stats: true, langs: true, streak: true, trophies: false, activity: false, theme: "transparent", hideBorder: true, align: "center" };
    case "projects": return { id, type, columns: 3, items: [
      { icon: "🛡️", title: "Cyber Security", description: "An interactive project about digital threats and data protection.", url: "https://ypciiiak.github.io/cyber-sec/", cta: "Explore project" },
      { icon: "🧹", title: "Repo Anti-Rot", description: "Detects technical decay and maintenance issues in repositories.", url: "https://repo-anti-rot.onrender.com/", cta: "Run an audit" },
      { icon: "💻", title: "Portfolio", description: "My projects, technologies, experience, and information about me.", url: "https://ypciiiaksportfolio.vercel.app/", cta: "View portfolio" },
    ] };
    case "image": return { id, type, url: "./assets/profile-card.svg", alt: "Profile card", width: 830, align: "center", link: "", darkUrl: "" };
    case "divider": return { id, type, kind: "hr", size: 24 };
    case "code": return { id, type, lang: "ts", content: "const me = {\n  name: \"Vladimir\",\n  stack: [\"TypeScript\", \"React\", \"Node\"],\n  coffee: Infinity,\n};" };
    case "quote": return { id, type, kind: "TIP", text: "Open to collaborations on developer tooling and open-source projects.", author: "" };
    case "list": return { id, type, kind: "bullet", items: "🔭 Working on Readme Studio\n🌱 Learning Rust and WebGPU\n💬 Ask me about frontend architecture\n⚡ Fun fact: I write SVG by hand" };
    case "details": return { id, type, summary: "More about me", content: "Things that didn't fit above.\n\n- Item one\n- Item two", open: false };
    case "table": return { id, type, align: "left", csv: "Project, Stack, Status\nReadme Studio, React + SVG, 🟢 Active\nRepo Anti-Rot, Python, 🟡 Maintenance\nPortfolio, Next.js, ✅ Done" };
    case "toc": return { id, type, title: "Contents", depth: 2 };
    case "snake": return { id, type, username: "YpCIIIaK", dark: true, align: "center" };
    case "visitors": return { id, type, username: "YpCIIIaK", label: "Profile views", color: "D4572A", style: "flat", align: "center" };
    case "quoteapi": return { id, type, theme: "dark", align: "center" };
    case "html": return { id, type, content: "<p align=\"center\">\n  <i>Thanks for stopping by!</i>\n</p>" };
  }
}

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const shield = (s: string) => encodeURIComponent(s.replaceAll("-", "--").replaceAll("_", "__"));
const wrapAlign = (align: Align, inner: string) => `<p align="${align}">\n${inner}\n</p>`;
export const slug = (text: string) => text.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");

function badgeUrl(b: Badge, style: BadgeStyle) {
  const path = b.label ? `${shield(b.label)}-${shield(b.message)}-${b.color.replace("#", "")}` : `${shield(b.message)}-${b.color.replace("#", "")}`;
  const q = new URLSearchParams({ style }); if (b.logo) { q.set("logo", b.logo); q.set("logoColor", "white"); }
  return `https://img.shields.io/badge/${path}?${q.toString()}`;
}

export function renderBlock(block: Block, all: Block[]): string {
  switch (block.type) {
    case "header": {
      const parts: string[] = [];
      if (block.banner) parts.push(`<p align="${block.align}"><img src="${esc(block.banner)}" width="100%" alt="banner" /></p>`);
      parts.push(`<h${block.level} align="${block.align}">${esc(block.title)}${block.emoji ? ` ${block.emoji}` : ""}</h${block.level}>`);
      if (block.subtitle) parts.push(`<p align="${block.align}">${esc(block.subtitle)}</p>`);
      return parts.join("\n\n");
    }
    case "typing": {
      const q = new URLSearchParams({ font: block.font, size: String(block.size), duration: String(block.duration), pause: "1000", color: block.color.replace("#", ""), center: String(block.center), vCenter: "true", width: String(block.width), height: String(block.height), lines: block.lines });
      return wrapAlign(block.align, `  <img src="https://readme-typing-svg.demolab.com?${q.toString().replaceAll("%3B", ";")}" alt="Typing SVG" />`);
    }
    case "text": return block.align === "left" ? block.content : `<div align="${block.align}">\n\n${block.content}\n\n</div>`;
    case "heading": {
      const t = `${block.emoji ? `${block.emoji} ` : ""}${block.text}`;
      return block.align === "left" ? `${"#".repeat(block.level)} ${t}` : `<h${block.level} align="${block.align}">${esc(t)}</h${block.level}>`;
    }
    case "badges": return wrapAlign(block.align, block.items.map((b) => { const img = `<img src="${badgeUrl(b, block.style)}" alt="${esc(b.message)}" />`; return `  ${b.link ? `<a href="${esc(b.link)}">${img}</a>` : img}`; }).join("\n"));
    case "socials": return wrapAlign(block.align, block.items.filter((s) => s.value && SOCIALS[s.platform]).map((s) => {
      const m = SOCIALS[s.platform];
      const url = badgeUrl({ label: "", message: block.iconsOnly ? " " : m.label, color: m.color, logo: m.logo, link: "" }, block.style);
      return `  <a href="${esc(m.url(s.value))}"><img src="${url}" alt="${m.label}" /></a>`;
    }).join("\n"));
    case "techstack": return wrapAlign(block.align, `  <img src="https://skillicons.dev/icons?i=${block.icons.replace(/\s/g, "")}&perline=${block.perline}&theme=${block.theme}" alt="Tech stack" />`);
    case "stats": {
      const u = encodeURIComponent(block.username); const hb = block.hideBorder ? "&hide_border=true" : "";
      const imgs: string[] = [];
      if (block.stats) imgs.push(`  <img height="170" src="https://github-readme-stats.vercel.app/api?username=${u}&show_icons=true&theme=${block.theme}${hb}" alt="GitHub stats" />`);
      if (block.langs) imgs.push(`  <img height="170" src="https://github-readme-stats.vercel.app/api/top-langs/?username=${u}&layout=compact&theme=${block.theme}${hb}" alt="Top languages" />`);
      if (block.streak) imgs.push(`  <img src="https://streak-stats.demolab.com?user=${u}&theme=${block.theme}${hb}" alt="GitHub streak" />`);
      if (block.trophies) imgs.push(`  <img src="https://github-profile-trophy.vercel.app/?username=${u}&theme=${block.theme === "transparent" ? "flat" : block.theme}&no-frame=true&margin-w=6&row=1" alt="Trophies" />`);
      if (block.activity) imgs.push(`  <img width="100%" src="https://github-readme-activity-graph.vercel.app/graph?username=${u}&theme=${block.theme === "transparent" ? "github-compact" : block.theme}&hide_border=${block.hideBorder}" alt="Activity graph" />`);
      return wrapAlign(block.align, imgs.join("\n"));
    }
    case "projects": {
      const cols = Math.max(1, block.columns); const rows: Project[][] = [];
      for (let i = 0; i < block.items.length; i += cols) rows.push(block.items.slice(i, i + cols));
      const width = Math.floor(100 / cols);
      return `<table>\n${rows.map((row) => `  <tr>\n${row.map((p) => `    <td width="${width}%" align="center" valign="top">
      <h3>${esc(p.icon)} ${esc(p.title)}</h3>
      <p>${esc(p.description)}</p>
      ${p.url ? `<a href="${esc(p.url)}"><strong>${esc(p.cta)} →</strong></a>` : ""}
    </td>`).join("\n")}\n  </tr>`).join("\n")}\n</table>`;
    }
    case "image": {
      const w = block.width ? ` width="${block.width}"` : "";
      let img = `<img src="${esc(block.url)}"${w} alt="${esc(block.alt)}" />`;
      if (block.darkUrl) img = `<picture>\n    <source media="(prefers-color-scheme: dark)" srcset="${esc(block.darkUrl)}" />\n    ${img}\n  </picture>`;
      return wrapAlign(block.align, `  ${block.link ? `<a href="${esc(block.link)}">${img}</a>` : img}`);
    }
    case "divider":
      if (block.kind === "hr") return "---";
      if (block.kind === "rainbow") return `<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" alt="divider" />`;
      if (block.kind === "line") return `<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/colored.png" width="100%" alt="divider" />`;
      return Array.from({ length: Math.max(1, Math.round(block.size / 20)) }, () => "<br>").join("\n");
    case "code": return "```" + block.lang + "\n" + block.content + "\n```";
    case "quote": {
      const body = block.text.split("\n").map((l) => `> ${l}`).join("\n");
      const head = block.kind === "quote" ? "" : `> [!${block.kind}]\n`;
      return `${head}${body}${block.author ? `\n>\n> — ${block.author}` : ""}`;
    }
    case "list": return block.items.split("\n").filter((l) => l.trim()).map((l, i) => block.kind === "numbered" ? `${i + 1}. ${l}` : block.kind === "task" ? `- [${l.startsWith("x ") ? "x" : " "}] ${l.replace(/^x /, "")}` : `- ${l}`).join("\n");
    case "details": return `<details${block.open ? " open" : ""}>\n<summary><b>${esc(block.summary)}</b></summary>\n\n${block.content}\n\n</details>`;
    case "table": {
      const rows = block.csv.split("\n").filter((r) => r.trim()).map((r) => r.split(",").map((c) => c.trim()));
      if (!rows.length) return "";
      const sep = block.align === "center" ? ":---:" : block.align === "right" ? "---:" : ":---";
      return [`| ${rows[0].join(" | ")} |`, `| ${rows[0].map(() => sep).join(" | ")} |`, ...rows.slice(1).map((r) => `| ${r.join(" | ")} |`)].join("\n");
    }
    case "toc": {
      const items = all.filter((b) => b.type === "heading" && b.level <= block.depth) as Extract<Block, { type: "heading" }>[];
      return `**${block.title}**\n\n${items.map((h) => `${"  ".repeat(h.level - 2)}- [${h.text}](#${slug(`${h.emoji ? h.emoji + " " : ""}${h.text}`)})`).join("\n") || "_Add section titles to fill this in_"}`;
    }
    case "snake": {
      const base = `https://raw.githubusercontent.com/${block.username}/${block.username}/output/github-contribution-grid-snake`;
      if (!block.dark) return wrapAlign(block.align, `  <img src="${base}.svg" alt="Contribution snake" />`);
      return wrapAlign(block.align, `  <picture>\n    <source media="(prefers-color-scheme: dark)" srcset="${base}-dark.svg" />\n    <img src="${base}.svg" alt="Contribution snake" />\n  </picture>`);
    }
    case "visitors": return wrapAlign(block.align, `  <img src="https://komarev.com/ghpvc/?username=${encodeURIComponent(block.username)}&label=${encodeURIComponent(block.label)}&color=${block.color.replace("#", "")}&style=${block.style}" alt="Profile views" />`);
    case "quoteapi": return wrapAlign(block.align, `  <img src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=${block.theme}" alt="Dev quote" />`);
    case "html": return block.content;
  }
}

export function renderReadme(blocks: Block[]) {
  return blocks.map((b) => renderBlock(b, blocks)).filter(Boolean).join("\n\n") + "\n";
}

export const NOTES: Partial<Record<BlockType, string>> = {
  snake: "Needs a GitHub Action (Platane/snk) in your profile repo that publishes to the `output` branch.",
  stats: "Served by public github-readme-stats instances; they can be rate-limited. Self-host for reliability.",
  toc: "Built from your Section title blocks.",
  html: "GitHub strips <style>, <script> and most attributes. Stick to align, width, height, href, src.",
};

export type Preset = { id: string; name: string; description: string; build: () => Block[] };
const mk = <T extends BlockType>(type: T, patch: Partial<Extract<Block, { type: T }>> = {}) => ({ ...createBlock(type), ...patch }) as Block;

export const PRESETS: Preset[] = [
  { id: "profile", name: "Developer profile", description: "Header, typing, stack, stats", build: () => [
    mk("header"), mk("typing"), mk("socials"), mk("divider", { kind: "space", size: 10 }),
    mk("heading", { text: "About me", emoji: "🧑‍💻" }), mk("list"),
    mk("heading", { text: "Tech stack", emoji: "🛠" }), mk("techstack"),
    mk("heading", { text: "Featured projects", emoji: "📌" }), mk("projects"),
    mk("heading", { text: "Stats", emoji: "📊" }), mk("stats"), mk("visitors"),
  ] },
  { id: "minimal", name: "Minimal", description: "A few calm lines", build: () => [
    mk("header", { emoji: "", align: "left", subtitle: "" }), mk("text"), mk("socials", { style: "flat", align: "left" }),
  ] },
  { id: "project", name: "Project README", description: "Badges, install, usage, license", build: () => [
    mk("header", { title: "Project Name", subtitle: "One sentence that explains what this does and why it matters.", emoji: "" }),
    mk("badges", { style: "flat", items: [{ label: "build", message: "passing", color: "2f6f4f", logo: "", link: "" }, { label: "license", message: "MIT", color: "3178C6", logo: "", link: "" }, { label: "version", message: "1.0.0", color: "D4572A", logo: "", link: "" }] }),
    mk("image", { url: "./assets/screenshot.png", alt: "Screenshot", width: 720 }),
    mk("toc"), mk("heading", { text: "Features" }), mk("list", { items: "Fast and lightweight\nZero configuration\nWorks everywhere" }),
    mk("heading", { text: "Installation" }), mk("code", { lang: "bash", content: "npm install project-name" }),
    mk("heading", { text: "Usage" }), mk("code", { lang: "ts", content: "import { thing } from \"project-name\";\n\nthing();" }),
    mk("quote", { kind: "NOTE", text: "Requires Node.js 22 or newer." }),
    mk("heading", { text: "Roadmap" }), mk("list", { kind: "task", items: "x Core API\nPlugin system\nDocumentation site" }),
    mk("heading", { text: "License" }), mk("text", { content: "MIT © Vladimir" }),
  ] },
  { id: "showcase", name: "Projects showcase", description: "Your original card layout", build: () => [
    mk("header", { title: "Featured Projects", subtitle: "A curated collection of things I build, explore, and improve.", emoji: "" }), mk("projects"),
  ] },
  { id: "empty", name: "Blank", description: "Start from nothing", build: () => [] },
];
