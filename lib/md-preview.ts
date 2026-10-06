// Small GitHub-flavoured Markdown renderer for the live preview. It covers what the
// builder emits (HTML blocks, headings, lists, tasks, tables, alerts, code) and
// strips the things GitHub would strip anyway.

const esc = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
export const slugify = (text: string) => text.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().replace(/\s+/g, "-");

function inline(src: string) {
  const codes: string[] = [];
  let s = src.replace(/`([^`]+)`/g, (_, c) => { codes.push(`<code>${esc(c)}</code>`); return `\u0000${codes.length - 1}\u0000`; });
  // keep inline html tags, escape stray < >
  s = s.replace(/<(?!\/?[a-zA-Z][^>]*>)/g, "&lt;");
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/(^|\W)_([^_\s][^_]*)_(?=\W|$)/g, "$1<em>$2</em>")
    .replace(/~~([^~]+)~~/g, "<del>$1</del>")
    .replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, '$1<a href="$2">$2</a>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}

const ALERTS: Record<string, string> = { NOTE: "Note", TIP: "Tip", IMPORTANT: "Important", WARNING: "Warning", CAUTION: "Caution" };

export function markdownToHtml(md: string): string {
  const lines = md.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^```(\w*)/);
    if (fence) {
      const buf: string[] = []; i++;
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
      i++; out.push(`<pre><code class="lang-${fence[1]}">${esc(buf.join("\n"))}</code></pre>`); continue;
    }
    if (/^\s*</.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim()) buf.push(lines[i++]);
      out.push(buf.join("\n")); continue;
    }
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { const text = inline(h[2]); out.push(`<h${h[1].length} id="${slugify(h[2])}">${text}</h${h[1].length}>`); i++; continue; }
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { out.push("<hr />"); i++; continue; }
    if (line.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""));
      const alert = buf[0]?.match(/^\[!(\w+)\]/);
      if (alert && ALERTS[alert[1]]) out.push(`<div class="md-alert md-alert-${alert[1].toLowerCase()}"><p class="md-alert-title">${ALERTS[alert[1]]}</p>${markdownToHtml(buf.slice(1).join("\n"))}</div>`);
      else out.push(`<blockquote>${markdownToHtml(buf.join("\n"))}</blockquote>`);
      continue;
    }
    if (/^\|.*\|\s*$/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? "")) {
      const cells = (r: string) => r.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line); const aligns = cells(lines[i + 1]).map((c) => c.startsWith(":") && c.endsWith(":") ? "center" : c.endsWith(":") ? "right" : "left");
      i += 2; const body: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) body.push(cells(lines[i++]));
      out.push(`<table><thead><tr>${head.map((c, j) => `<th align="${aligns[j]}">${inline(c)}</th>`).join("")}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c, j) => `<td align="${aligns[j]}">${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      continue;
    }
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: { depth: number; text: string }[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        const m = lines[i].match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/)!; items.push({ depth: Math.floor(m[1].length / 2), text: m[3] }); i++;
      }
      const tag = ordered ? "ol" : "ul"; let html = `<${tag}>`; let depth = 0;
      for (const it of items) {
        while (it.depth > depth) { html += `<${tag}>`; depth++; }
        while (it.depth < depth) { html += `</${tag}>`; depth--; }
        const task = it.text.match(/^\[( |x)\]\s+(.*)$/i);
        html += task ? `<li class="task"><input type="checkbox" disabled ${task[1] !== " " ? "checked" : ""}/> ${inline(task[2])}</li>` : `<li>${inline(it.text)}</li>`;
      }
      while (depth-- > 0) html += `</${tag}>`;
      out.push(html + `</${tag}>`); continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*<|\s*([-*+]|\d+\.)\s|\|)/.test(lines[i])) buf.push(lines[i++]);
    if (!buf.length) { buf.push(lines[i++]); }
    out.push(`<p>${buf.map(inline).join("<br />")}</p>`);
  }
  return sanitize(out.join("\n"));
}

function sanitize(html: string) {
  return html.replace(/<(script|style|iframe|object|embed)[\s\S]*?<\/\1>/gi, "").replace(/\son\w+="[^"]*"/gi, "").replace(/javascript:/gi, "");
}
