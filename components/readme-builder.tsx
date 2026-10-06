"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Check, ChevronDown, ChevronUp, Clipboard, Code2, Copy, Download, Eye, EyeOff, GripVertical,
  ClipboardPaste, CopyPlus, FilePlus2, History, Monitor, Moon, Plus, Redo2, Search, Smartphone, Sun, Trash2, Undo2, Upload, X,
} from "lucide-react";
import {
  BLOCK_META, createBlock, NOTES, PRESETS, QUOTE_THEMES, renderReadme, SKILL_ICONS, SOCIALS, STATS_THEMES,
  type Align, type BadgeStyle, type Block, type BlockType,
} from "@/lib/readme-blocks";
import { markdownToHtml } from "@/lib/md-preview";

const LEGACY_KEY = "readme-studio-blocks-v2";
const WORKS_KEY = "readme-studio-works-v1";
const CLIP_KEY = "readme-studio-clipboard-v1";
type Entry = { block: Block; hidden?: boolean };
type Work = { id: string; name: string; updated: number; entries: Entry[] };
type Store = { currentId: string; works: Work[] };

const freshId = () => createBlock("divider").id;
const cloneEntries = (list: Entry[]) => list.map((e) => ({ ...structuredClone(e), block: { ...structuredClone(e.block), id: freshId() } }));
const newWork = (name: string, entries: Entry[]): Work => ({ id: `w${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, name, updated: Date.now(), entries });

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(WORKS_KEY);
    if (raw) { const v = JSON.parse(raw) as Store; if (v?.works?.length) return v; }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) { const w = newWork("My README", JSON.parse(legacy) as Entry[]); return { currentId: w.id, works: [w] }; }
  } catch { /* ignore */ }
  const w = newWork("Developer profile", PRESETS[0].build().map((block) => ({ block })));
  return { currentId: w.id, works: [w] };
}
function readClip(): Entry[] { try { return JSON.parse(localStorage.getItem(CLIP_KEY) || "[]") as Entry[]; } catch { return []; } }
const ago = (t: number) => { const m = Math.round((Date.now() - t) / 60000); return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : new Date(t).toLocaleDateString(); };

export function ReadmeBuilder() {
  const [entries, setEntries] = useState<Entry[]>(() => PRESETS[0].build().map((block) => ({ block })));
  const [works, setWorks] = useState<Work[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [clipCount, setClipCount] = useState(0);
  const [view, setView] = useState<"preview" | "code" | "split">("preview");
  const [scheme, setScheme] = useState<"dark" | "light">("dark");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const history = useRef<{ past: Entry[][]; future: Entry[][] }>({ past: [], future: [] });
  const loaded = useRef(false);

  useEffect(() => {
    const st = loadStore(); const cur = st.works.find((w) => w.id === st.currentId) ?? st.works[0];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after SSR
    setWorks(st.works); setCurrentId(cur.id); setEntries(cur.entries); setClipCount(readClip().length); loaded.current = true;
  }, []);
  // autosave the current work into the library
  useEffect(() => {
    if (!loaded.current || !currentId) return;
    const t = setTimeout(() => setWorks((ws) => {
      const next = ws.map((w) => w.id === currentId ? { ...w, entries, updated: w.entries === entries ? w.updated : Date.now() } : w);
      try { localStorage.setItem(WORKS_KEY, JSON.stringify({ currentId, works: next })); } catch { /* quota */ }
      return next;
    }), 400);
    return () => clearTimeout(t);
  }, [entries, currentId]);
  const persist = (ws: Work[], id: string) => { try { localStorage.setItem(WORKS_KEY, JSON.stringify({ currentId: id, works: ws })); } catch { /* quota */ } };
  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  const commit = useCallback((fn: (e: Entry[]) => Entry[]) => setEntries((prev) => { const next = fn(prev); if (next !== prev) { history.current.past.push(prev); if (history.current.past.length > 100) history.current.past.shift(); history.current.future = []; } return next; }), []);
  const undo = useCallback(() => setEntries((cur) => { const p = history.current.past.pop(); if (!p) return cur; history.current.future.push(cur); return p; }), []);
  const redo = useCallback(() => setEntries((cur) => { const f = history.current.future.pop(); if (!f) return cur; history.current.past.push(cur); return f; }), []);

  const visible = useMemo(() => entries.filter((e) => !e.hidden).map((e) => e.block), [entries]);
  const markdown = useMemo(() => renderReadme(visible), [visible]);
  const html = useMemo(() => markdownToHtml(markdown), [markdown]);
  const active = entries.find((e) => e.block.id === selected)?.block;
  const current = works.find((w) => w.id === currentId);

  // ----- works -----
  const switchTo = (w: Work) => {
    const ws = works.map((x) => x.id === currentId ? { ...x, entries } : x);
    setWorks(ws); setCurrentId(w.id); setEntries(w.entries); persist(ws, w.id);
    history.current = { past: [], future: [] }; setSelected(null); setPicked([]); setHistoryOpen(false);
  };
  const createWork = (name: string, list: Entry[]) => {
    const w = newWork(name, list); const ws = [w, ...works.map((x) => x.id === currentId ? { ...x, entries } : x)];
    setWorks(ws); setCurrentId(w.id); setEntries(list); persist(ws, w.id);
    history.current = { past: [], future: [] }; setSelected(null); setPicked([]); flash(`Created “${name}” — previous work is in History`);
  };
  const renameWork = (name: string) => setWorks((ws) => ws.map((w) => w.id === currentId ? { ...w, name } : w));
  const deleteWork = (id: string) => {
    if (id === currentId) return;
    const ws = works.filter((w) => w.id !== id); setWorks(ws); persist(ws, currentId);
  };

  // ----- block ops -----
  const update = (patch: Partial<Block>) => active && commit((list) => list.map((e) => e.block.id === active.id ? { ...e, block: { ...e.block, ...patch } as Block } : e));
  const insertAt = (items: Entry[]) => {
    const anchor = picked.length ? picked : selected ? [selected] : [];
    commit((list) => { const idx = Math.max(-1, ...anchor.map((id) => list.findIndex((e) => e.block.id === id))); const next = [...list]; next.splice(idx < 0 ? list.length : idx + 1, 0, ...items); return next; });
    setPicked(items.map((e) => e.block.id)); setSelected(items[items.length - 1]?.block.id ?? null);
  };
  const add = (type: BlockType) => { insertAt([{ block: createBlock(type) }]); setLibraryOpen(false); setQuery(""); };
  const targets = (id?: string) => id ? (picked.includes(id) ? picked : [id]) : picked;
  const remove = (id?: string) => { const ids = targets(id); commit((list) => list.filter((e) => !ids.includes(e.block.id))); setPicked([]); if (selected && ids.includes(selected)) setSelected(null); };
  const duplicate = (id?: string) => { const ids = targets(id); insertAt(cloneEntries(entries.filter((e) => ids.includes(e.block.id)))); };
  const toggle = (id?: string) => { const ids = targets(id); commit((list) => list.map((e) => ids.includes(e.block.id) ? { ...e, hidden: !e.hidden } : e)); };
  const copyBlocks = (list: Entry[]) => { if (!list.length) return; try { localStorage.setItem(CLIP_KEY, JSON.stringify(list)); } catch { /* ignore */ } setClipCount(list.length); flash(`${list.length} block${list.length > 1 ? "s" : ""} copied — paste anywhere with Ctrl+V`); };
  const copyPicked = () => copyBlocks(entries.filter((e) => picked.includes(e.block.id)));
  const paste = () => { const clip = readClip(); if (!clip.length) return; insertAt(cloneEntries(clip)); flash(`Pasted ${clip.length} block${clip.length > 1 ? "s" : ""}`); };
  const move = (id: string, dir: -1 | 1) => commit((list) => { const i = list.findIndex((e) => e.block.id === id); const j = i + dir; if (j < 0 || j >= list.length) return list; const next = [...list]; [next[i], next[j]] = [next[j], next[i]]; return next; });
  const drop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const ids = picked.includes(dragId) ? picked : [dragId];
    if (ids.includes(targetId)) return;
    commit((list) => { const moving = list.filter((e) => ids.includes(e.block.id)); const rest = list.filter((e) => !ids.includes(e.block.id)); const to = rest.findIndex((e) => e.block.id === targetId); rest.splice(to, 0, ...moving); return rest; });
  };
  const clickItem = (id: string, ev: { shiftKey: boolean; metaKey: boolean; ctrlKey: boolean }) => {
    if (ev.metaKey || ev.ctrlKey) { setPicked((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]); setSelected(id); return; }
    if (ev.shiftKey && selected) {
      const a = entries.findIndex((e) => e.block.id === selected), b = entries.findIndex((e) => e.block.id === id);
      setPicked(entries.slice(Math.min(a, b), Math.max(a, b) + 1).map((e) => e.block.id)); return;
    }
    setSelected(id); setPicked([id]);
  };

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      const t = ev.target as HTMLElement; if (["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      const mod = ev.metaKey || ev.ctrlKey; const k = ev.key.toLowerCase();
      if (mod && k === "z") { ev.preventDefault(); if (ev.shiftKey) redo(); else undo(); }
      else if (mod && k === "y") { ev.preventDefault(); redo(); }
      else if (mod && k === "c" && picked.length && !window.getSelection()?.toString()) { ev.preventDefault(); copyPicked(); }
      else if (mod && k === "v") { ev.preventDefault(); paste(); }
      else if (mod && k === "d" && picked.length) { ev.preventDefault(); duplicate(); }
      else if (mod && k === "a") { ev.preventDefault(); setPicked(entries.map((e) => e.block.id)); }
      else if ((ev.key === "Delete" || ev.key === "Backspace") && picked.length) { ev.preventDefault(); remove(); }
      else if (ev.key === "Escape") { setLibraryOpen(false); setHistoryOpen(false); setPicked([]); }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  });

  const copy = async () => { await navigator.clipboard.writeText(markdown); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const download = () => { const a = document.createElement("a"); const url = URL.createObjectURL(new Blob([markdown], { type: "text/markdown;charset=utf-8" })); a.href = url; a.download = "README.md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); };
  const saveProject = () => { const a = document.createElement("a"); const url = URL.createObjectURL(new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" })); a.href = url; a.download = `${(current?.name || "readme").replace(/[^\w-]+/g, "-")}.readme-studio.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 500); };
  const openProject = (file?: File) => file?.text().then((t) => { try { const v = JSON.parse(t) as Entry[]; if (!Array.isArray(v)) throw 0; createWork(file.name.replace(/\.readme-studio\.json$|\.json$/, ""), v); } catch { alert("Not a Readme Studio project file"); } });

  const groups = (["Basics", "Profile", "Media", "Structure"] as const).map((g) => ({ g, items: (Object.keys(BLOCK_META) as BlockType[]).filter((t) => BLOCK_META[t].group === g && (`${BLOCK_META[t].label} ${BLOCK_META[t].hint}`).toLowerCase().includes(query.toLowerCase())) })).filter((x) => x.items.length);

  return (
    <section className="sx rb">
      {/* ------- LEFT: outline ------- */}
      <aside className="sx-left">
        <div className="rb-work">
          <input className="rb-work-name" value={current?.name ?? ""} onChange={(e) => renameWork(e.target.value)} title="Rename this README" />
          <div className="rb-mini">
            <button title="History — previous works" onClick={() => setHistoryOpen(true)}><History /></button>
            <button title="New README" onClick={() => createWork(`Untitled ${works.length + 1}`, [])}><FilePlus2 /></button>
          </div>
        </div>
        <div className="sx-group rb-left-head">
          <div className="sx-title">Blocks <em className="rb-count">{entries.length}</em></div>
          <div className="rb-mini">
            <button title={clipCount ? `Paste ${clipCount} block(s) (Ctrl+V)` : "Clipboard is empty"} disabled={!clipCount} onClick={paste}><ClipboardPaste /></button>
            <button title="Undo" onClick={undo}><Undo2 /></button><button title="Redo" onClick={redo}><Redo2 /></button>
          </div>
        </div>
        {picked.length > 1 && (
          <div className="rb-multibar">
            <span>{picked.length} selected</span>
            <button title="Copy (Ctrl+C)" onClick={copyPicked}><Copy /></button>
            <button title="Duplicate (Ctrl+D)" onClick={() => duplicate()}><CopyPlus /></button>
            <button title="Hide / show" onClick={() => toggle()}><EyeOff /></button>
            <button title="Delete" onClick={() => remove()}><Trash2 /></button>
            <button title="Clear selection" onClick={() => setPicked([])}><X /></button>
          </div>
        )}
        <div className="rb-outline">
          {entries.length === 0 && <p className="sx-empty">Nothing here yet. Add a block, paste copied ones, or start from a template below.</p>}
          {entries.map(({ block, hidden }) => (
            <div key={block.id} draggable onDragStart={(e: DragEvent) => { setDragId(block.id); e.dataTransfer.effectAllowed = "move"; }} onDragEnd={() => { setDragId(null); setOverId(null); }}
              onDragOver={(e) => { e.preventDefault(); setOverId(block.id); }} onDrop={() => { drop(block.id); setOverId(null); }}
              className={`rb-item ${selected === block.id ? "on" : ""} ${picked.includes(block.id) && picked.length > 1 ? "picked" : ""} ${hidden ? "hidden" : ""} ${overId === block.id && dragId !== block.id ? "over" : ""} ${dragId === block.id ? "dragging" : ""}`}
              onClick={(e) => clickItem(block.id, e)}>
              <GripVertical className="rb-grip" />
              <span className="rb-item-text"><strong>{BLOCK_META[block.type].label}</strong><small>{summary(block)}</small></span>
              <span className="rb-item-actions">
                <button title={hidden ? "Show" : "Hide"} onClick={(e) => { e.stopPropagation(); toggle(block.id); }}>{hidden ? <EyeOff /> : <Eye />}</button>
                <button title="Copy to clipboard" onClick={(e) => { e.stopPropagation(); copyBlocks(entries.filter((x) => targets(block.id).includes(x.block.id))); }}><Copy /></button>
                <button title="Delete" onClick={(e) => { e.stopPropagation(); remove(block.id); }}><Trash2 /></button>
              </span>
            </div>
          ))}
          <button className="rb-add" onClick={() => setLibraryOpen(true)}><Plus /> Add block</button>
          <p className="rb-tip">Ctrl/Shift-click to select several · Ctrl+C / Ctrl+V works across READMEs</p>
        </div>
        <div className="sx-group rb-presets">
          <div className="sx-title">New from template</div>
          {PRESETS.map((p) => <button key={p.id} onClick={() => createWork(p.name, p.build().map((block) => ({ block })))}><strong>{p.name}</strong><small>{p.description}</small></button>)}
        </div>
      </aside>

      {/* ------- CENTER: preview ------- */}
      <div className="sx-center">
        <div className="sx-bar">
          <div className="sx-seg rb-view">
            <button className={view === "preview" ? "on" : ""} onClick={() => setView("preview")}><Eye /> Preview</button>
            <button className={view === "split" ? "on" : ""} onClick={() => setView("split")}>Split</button>
            <button className={view === "code" ? "on" : ""} onClick={() => setView("code")}><Code2 /> Markdown</button>
          </div>
          <div className="sx-bar-group right">
            <button title="Light" className={scheme === "light" ? "on" : ""} onClick={() => setScheme("light")}><Sun /></button>
            <button title="Dark" className={scheme === "dark" ? "on" : ""} onClick={() => setScheme("dark")}><Moon /></button>
            <span className="rb-sep" />
            <button title="Desktop width" className={device === "desktop" ? "on" : ""} onClick={() => setDevice("desktop")}><Monitor /></button>
            <button title="Mobile width" className={device === "mobile" ? "on" : ""} onClick={() => setDevice("mobile")}><Smartphone /></button>
            <span className="rb-sep" />
            <button className="rb-bar-btn" onClick={copy}>{copied ? <Check /> : <Clipboard />} {copied ? "Copied" : "Copy"}</button>
            <button className="rb-bar-btn primary" onClick={download}><Download /> README.md</button>
          </div>
        </div>
        <div className={`rb-body ${view}`}>
          {view !== "code" && (
            <div className="rb-preview-wrap">
              <div className={`rb-window ${scheme} ${device}`}>
                <div className="rb-window-head"><span className="rb-book">▤</span> README.md</div>
                <article className={`md ${scheme}`} onClick={(e) => { e.preventDefault(); }} dangerouslySetInnerHTML={{ __html: html || `<p class="md-empty">Your README is empty.</p>` }} />
              </div>
            </div>
          )}
          {view !== "preview" && <pre className="rb-code">{markdown}</pre>}
        </div>
      </div>

      {/* ------- RIGHT: inspector ------- */}
      <aside className="sx-right">
        <div className="sx-inspector">
          {active ? (
            <>
              <div className="sx-el-head rb-head">
                <div><strong>{BLOCK_META[active.type].label}</strong><small>{BLOCK_META[active.type].hint}</small></div>
                <div className="rb-mini">
                  <button title="Move up" onClick={() => move(active.id, -1)}><ChevronUp /></button>
                  <button title="Move down" onClick={() => move(active.id, 1)}><ChevronDown /></button>
                  <button title="Copy block" onClick={() => copyBlocks(entries.filter((e) => e.block.id === active.id))}><Copy /></button>
                  <button title="Delete" onClick={() => remove(active.id)}><Trash2 /></button>
                </div>
              </div>
              {NOTES[active.type] && <p className="rb-note">{NOTES[active.type]}</p>}
              <BlockEditor block={active} update={update} />
            </>
          ) : (
            <>
              <Section title="Project">
                <p className="sx-note">Click a block in the list to edit it. Drag to reorder. Everything is saved in this browser automatically.</p>
                <button className="sx-btn primary" onClick={() => setLibraryOpen(true)}><Plus /> Add block</button>
                <div className="sx-row2">
                  <button className="sx-btn" onClick={saveProject}><Download /> Save JSON</button>
                  <label className="sx-btn"><Upload /> Open<input type="file" accept="application/json" hidden onChange={(e) => { openProject(e.target.files?.[0]); e.target.value = ""; }} /></label>
                </div>
              </Section>
              <Section title="Stats">
                <p className="sx-note">{visible.length} visible blocks · {markdown.split("\n").length} lines · {(new Blob([markdown]).size / 1024).toFixed(1)} KB</p>
              </Section>
            </>
          )}
        </div>
      </aside>

      {libraryOpen && (
        <div className="rb-modal" onClick={() => setLibraryOpen(false)}>
          <div className="rb-library" onClick={(e) => e.stopPropagation()}>
            <div className="rb-lib-head">
              <Search /><input autoFocus placeholder="Search blocks…" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && groups[0]) add(groups[0].items[0]); }} />
              <button onClick={() => setLibraryOpen(false)}><X /></button>
            </div>
            <div className="rb-lib-body">
              {groups.map(({ g, items }) => (
                <div key={g}><div className="sx-title">{g}</div>
                  <div className="rb-lib-grid">{items.map((t) => <button key={t} onClick={() => add(t)}><strong>{BLOCK_META[t].label}</strong><small>{BLOCK_META[t].hint}</small></button>)}</div>
                </div>
              ))}
              {!groups.length && <p className="sx-empty">No blocks match “{query}”.</p>}
            </div>
          </div>
        </div>
      )}
      {historyOpen && <HistoryModal works={works} currentId={currentId} onClose={() => setHistoryOpen(false)} onOpen={switchTo} onDelete={deleteWork}
        onInsert={(list) => { insertAt(cloneEntries(list)); setHistoryOpen(false); flash(`Inserted ${list.length} block${list.length > 1 ? "s" : ""}`); }}
        onCopy={(list) => copyBlocks(list)} />}
      {toast && <div className="rb-toast">{toast}</div>}
    </section>
  );
}

function HistoryModal({ works, currentId, onClose, onOpen, onDelete, onInsert, onCopy }: { works: Work[]; currentId: string; onClose: () => void; onOpen: (w: Work) => void; onDelete: (id: string) => void; onInsert: (e: Entry[]) => void; onCopy: (e: Entry[]) => void }) {
  const sorted = [...works].sort((a, b) => b.updated - a.updated);
  const [viewId, setViewId] = useState<string>(sorted.find((w) => w.id !== currentId)?.id ?? currentId);
  const [checked, setChecked] = useState<string[]>([]);
  const work = works.find((w) => w.id === viewId);
  const chosen = useMemo(() => work ? work.entries.filter((e) => checked.includes(e.block.id)) : [], [work, checked]);
  const previewHtml = useMemo(() => work ? markdownToHtml(renderReadme((chosen.length ? chosen : work.entries).filter((e) => !e.hidden).map((e) => e.block))) : "", [work, chosen]);
  const pick = (w: Work) => { setViewId(w.id); setChecked([]); };
  return (
    <div className="rb-modal" onClick={onClose}>
      <div className="rb-history" onClick={(e) => e.stopPropagation()}>
        <div className="rb-hist-col rb-hist-works">
          <div className="rb-hist-title"><History /> History <em>{works.length}</em></div>
          {sorted.map((w) => (
            <button key={w.id} className={`rb-hist-work ${w.id === viewId ? "on" : ""}`} onClick={() => pick(w)}>
              <strong>{w.name || "Untitled"}{w.id === currentId && <i>current</i>}</strong>
              <small>{w.entries.length} blocks · {ago(w.updated)}</small>
            </button>
          ))}
        </div>
        <div className="rb-hist-col rb-hist-blocks">
          {work && <>
            <div className="rb-hist-title">
              <label className="rb-check"><input type="checkbox" checked={checked.length === work.entries.length && checked.length > 0} onChange={(e) => setChecked(e.target.checked ? work.entries.map((x) => x.block.id) : [])} /> Blocks</label>
              <em>{checked.length ? `${checked.length} selected` : "pick blocks to reuse"}</em>
            </div>
            <div className="rb-hist-list">
              {work.entries.map((e) => (
                <label key={e.block.id} className={`rb-hist-block ${checked.includes(e.block.id) ? "on" : ""}`}>
                  <input type="checkbox" checked={checked.includes(e.block.id)} onChange={() => setChecked((c) => c.includes(e.block.id) ? c.filter((x) => x !== e.block.id) : [...c, e.block.id])} />
                  <span><strong>{BLOCK_META[e.block.type].label}</strong><small>{summary(e.block)}</small></span>
                </label>
              ))}
              {!work.entries.length && <p className="sx-empty">This README is empty.</p>}
            </div>
            <div className="rb-hist-actions">
              <button className="sx-btn primary" disabled={!chosen.length} onClick={() => onInsert(chosen)}><Plus /> Insert {chosen.length || ""} into current</button>
              <button className="sx-btn" disabled={!chosen.length} onClick={() => onCopy(chosen)}><Copy /> Copy</button>
              <span className="rb-flex" />
              {work.id !== currentId && <button className="sx-btn" onClick={() => onOpen(work)}>Open this README</button>}
              {work.id !== currentId && <button className="sx-btn rb-danger" title="Delete from history" onClick={() => { if (confirm(`Delete “${work.name}” from history?`)) { onDelete(work.id); setViewId(sorted.find((w) => w.id !== work.id)?.id ?? currentId); } }}><Trash2 /></button>}
            </div>
          </>}
        </div>
        <div className="rb-hist-col rb-hist-preview">
          <div className="rb-hist-title">{chosen.length ? "Selected blocks" : "Preview"}<button className="rb-close" onClick={onClose}><X /></button></div>
          <article className="md dark rb-hist-md" dangerouslySetInnerHTML={{ __html: previewHtml || `<p class="md-empty">Nothing to show.</p>` }} />
        </div>
      </div>
    </div>
  );
}

function summary(b: Block): string {
  switch (b.type) {
    case "header": return b.title; case "heading": return b.text; case "text": return b.content.slice(0, 40);
    case "typing": return b.lines.split(";")[0]; case "badges": return b.items.map((i) => i.message).join(", ");
    case "socials": return b.items.map((i) => SOCIALS[i.platform]?.label).join(", "); case "techstack": return b.icons;
    case "stats": case "snake": case "visitors": return `@${b.username}`; case "projects": return `${b.items.length} projects`;
    case "image": return b.url; case "code": return b.lang || "plain"; case "quote": return b.text.slice(0, 40);
    case "list": return b.items.split("\n")[0]; case "details": return b.summary; case "table": return b.csv.split("\n")[0];
    case "divider": return b.kind; case "toc": return b.title; case "quoteapi": return b.theme; case "html": return b.content.slice(0, 40);
  }
}

/* ---------------- form helpers ---------------- */
function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return <div className="sx-section"><div className="sx-section-head"><span>{title}</span>{aside}</div>{children}</div>;
}
function F({ label, children }: { label: string; children: ReactNode }) { return <label className="sx-field"><span>{label}</span>{children}</label>; }
function T({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <F label={label}><input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></F>;
}
function TA({ label, value, onChange, rows = 4, mono }: { label: string; value: string; onChange: (v: string) => void; rows?: number; mono?: boolean }) {
  return <F label={label}><textarea rows={rows} className={mono ? "mono" : ""} value={value} onChange={(e) => onChange(e.target.value)} spellCheck={!mono} /></F>;
}
function N({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return <F label={label}><input type="number" value={value} min={min} max={max} onChange={(e) => onChange(Number(e.target.value))} /></F>;
}
function Sel<T extends string | number>({ label, value, options, onChange }: { label: string; value: T; options: readonly (T | [T, string])[]; onChange: (v: T) => void }) {
  return <F label={label}><select value={String(value)} onChange={(e) => { const o = options.map((x) => Array.isArray(x) ? x[0] : x).find((x) => String(x) === e.target.value); if (o !== undefined) onChange(o); }}>{options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, String(o)]; return <option key={String(v)} value={String(v)}>{l}</option>; })}</select></F>;
}
function Tog({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="sx-toggle"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /> {label}</label>;
}
function AlignPick({ value, onChange }: { value: Align; onChange: (a: Align) => void }) {
  return <div className="sx-chips">{([["left", <AlignLeft key="l" />], ["center", <AlignCenter key="c" />], ["right", <AlignRight key="r" />]] as const).map(([a, icon]) => <button key={a} title={a} className={`rb-icon-chip ${value === a ? "on" : ""}`} onClick={() => onChange(a)}>{icon}</button>)}</div>;
}
function Hex({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = `#${value.replace("#", "").padEnd(6, "0").slice(0, 6)}`;
  return <F label={label}><div className="sx-color"><input type="color" value={hex} onChange={(e) => onChange(e.target.value.slice(1).toUpperCase())} /><input value={value} onChange={(e) => onChange(e.target.value.replace("#", ""))} /></div></F>;
}
const BADGE_STYLES: BadgeStyle[] = ["flat", "flat-square", "for-the-badge", "plastic", "social"];

function ListEditor<T>({ items, onChange, make, render, label }: { items: T[]; onChange: (v: T[]) => void; make: () => T; render: (item: T, set: (p: Partial<T>) => void) => ReactNode; label: string }) {
  const set = (i: number, p: Partial<T>) => onChange(items.map((x, j) => j === i ? { ...x, ...p } : x));
  const mv = (i: number, d: -1 | 1) => { const j = i + d; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="rb-list">
      {items.map((item, i) => (
        <div key={i} className="rb-list-item">
          <div className="rb-list-head"><span>{label} {i + 1}</span><span className="rb-mini">
            <button onClick={() => mv(i, -1)}><ChevronUp /></button><button onClick={() => mv(i, 1)}><ChevronDown /></button>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 /></button></span></div>
          {render(item, (p) => set(i, p))}
        </div>
      ))}
      <button className="sx-link" onClick={() => onChange([...items, make()])}><Plus /> Add {label.toLowerCase()}</button>
    </div>
  );
}

function BlockEditor({ block: b, update }: { block: Block; update: (p: Partial<Block>) => void }) {
  const u = update as (p: Record<string, unknown>) => void;
  const align = "align" in b ? <Section title="Alignment"><AlignPick value={b.align} onChange={(align) => u({ align })} /></Section> : null;
  switch (b.type) {
    case "header": return <>
      <Section title="Content">
        <T label="Title" value={b.title} onChange={(title) => u({ title })} />
        <div className="sx-row2"><T label="Emoji" value={b.emoji} onChange={(emoji) => u({ emoji })} /><Sel label="Size" value={b.level} options={[[1, "H1 — large"], [2, "H2 — medium"]]} onChange={(level) => u({ level })} /></div>
        <TA label="Subtitle" value={b.subtitle} rows={2} onChange={(subtitle) => u({ subtitle })} />
        <p className="sx-note">Wave/Soft banners are generated by the free capsule-render.vercel.app service. Or use your own SVG card.</p>
        <T label="Banner image URL (optional)" value={b.banner} placeholder="./assets/banner.svg" onChange={(banner) => u({ banner })} />
        <div className="sx-chips wrap">{[["Wave banner", "https://capsule-render.vercel.app/api?type=waving&color=D4572A&height=160&section=header"], ["Soft banner", "https://capsule-render.vercel.app/api?type=soft&color=2f6f4f&height=120"], ["SVG card", "./assets/profile-card.svg"]].map(([l, url]) => <button key={l} onClick={() => u({ banner: url })}>{l}</button>)}</div>
      </Section>{align}</>;
    case "heading": return <><Section title="Content">
      <T label="Text" value={b.text} onChange={(text) => u({ text })} />
      <div className="sx-row2"><T label="Emoji" value={b.emoji} onChange={(emoji) => u({ emoji })} /><Sel label="Level" value={b.level} options={[[2, "H2"], [3, "H3"], [4, "H4"]]} onChange={(level) => u({ level })} /></div>
      <div className="sx-chips wrap">{["🚀", "🛠", "📊", "📌", "🧑‍💻", "📫", "⚡", "🌱", "🎯", "💼"].map((e) => <button key={e} onClick={() => u({ emoji: e })}>{e}</button>)}</div>
    </Section>{align}</>;
    case "text": return <><Section title="Markdown"><TA label="Content" rows={8} value={b.content} onChange={(content) => u({ content })} />
      <p className="sx-note">**bold**, *italic*, `code`, [link](url), ~~strike~~</p></Section>{align}</>;
    case "typing": return <><Section title="Lines">
      <TA label="One line per row" rows={4} value={b.lines.split(";").join("\n")} onChange={(v) => u({ lines: v.split("\n").join(";") })} />
    </Section><Section title="Style">
      <Sel label="Font" value={b.font} options={["Fira Code", "JetBrains Mono", "Roboto Mono", "Source Code Pro", "Inter", "Space Grotesk", "Press Start 2P", "Montserrat", "Ubuntu"]} onChange={(font) => u({ font })} />
      <Hex label="Color" value={b.color} onChange={(color) => u({ color })} />
      <div className="sx-grid3"><N label="Size" value={b.size} onChange={(size) => u({ size })} /><N label="Width" value={b.width} onChange={(width) => u({ width })} /><N label="Height" value={b.height} onChange={(height) => u({ height })} /></div>
      <N label="Typing duration (ms)" value={b.duration} onChange={(duration) => u({ duration })} />
      <Tog label="Center text in box" checked={b.center} onChange={(center) => u({ center })} />
    </Section>{align}</>;
    case "badges": return <><Section title="Badges">
      <ListEditor label="Badge" items={b.items} onChange={(items) => u({ items })} make={() => ({ label: "", message: "New", color: "D4572A", logo: "", link: "" })} render={(it, set) => <>
        <div className="sx-row2"><T label="Label" value={it.label} placeholder="optional" onChange={(label) => set({ label })} /><T label="Message" value={it.message} onChange={(message) => set({ message })} /></div>
        <div className="sx-row2"><Hex label="Color" value={it.color} onChange={(color) => set({ color })} /><T label="Logo (simple-icons)" value={it.logo} placeholder="react" onChange={(logo) => set({ logo })} /></div>
        <T label="Link" value={it.link} placeholder="https://…" onChange={(link) => set({ link })} />
      </>} />
    </Section><Section title="Style"><Sel label="Badge style" value={b.style} options={BADGE_STYLES} onChange={(style) => u({ style })} /></Section>{align}</>;
    case "socials": return <><Section title="Links">
      <ListEditor label="Link" items={b.items} onChange={(items) => u({ items })} make={() => ({ platform: "linkedin", value: "" })} render={(it, set) => <div className="sx-row2">
        <Sel label="Platform" value={it.platform} options={Object.entries(SOCIALS).map(([k, v]) => [k, v.label] as [string, string])} onChange={(platform) => set({ platform })} />
        <T label="Value" value={it.value} placeholder={SOCIALS[it.platform]?.placeholder} onChange={(value) => set({ value })} />
      </div>} />
    </Section><Section title="Style"><Sel label="Badge style" value={b.style} options={BADGE_STYLES} onChange={(style) => u({ style })} /><Tog label="Icons only" checked={b.iconsOnly} onChange={(iconsOnly) => u({ iconsOnly })} /></Section>{align}</>;
    case "techstack": {
      const set = new Set(b.icons.split(",").map((s) => s.trim()).filter(Boolean));
      const flip = (i: string) => { const n = new Set(set); if (n.has(i)) n.delete(i); else n.add(i); u({ icons: [...n].join(",") }); };
      return <><Section title={`Icons · ${set.size} selected`}>
        <div className="rb-icons">{SKILL_ICONS.map((i) => <button key={i} className={set.has(i) ? "on" : ""} onClick={() => flip(i)} title={i}><img src={`https://skillicons.dev/icons?i=${i}`} alt={i} loading="lazy" /></button>)}</div>
        <T label="Order / custom ids (comma separated)" value={b.icons} onChange={(icons) => u({ icons })} />
      </Section><Section title="Layout"><div className="sx-row2"><N label="Per line" value={b.perline} min={1} max={50} onChange={(perline) => u({ perline })} /><Sel label="Theme" value={b.theme} options={["dark", "light"] as const} onChange={(theme) => u({ theme })} /></div></Section>{align}</>;
    }
    case "stats": return <><Section title="Account"><T label="GitHub username" value={b.username} onChange={(username) => u({ username })} /></Section>
      <Section title="Cards">
        <Tog label="Stats card" checked={b.stats} onChange={(stats) => u({ stats })} />
        <Tog label="Top languages" checked={b.langs} onChange={(langs) => u({ langs })} />
        <Tog label="Streak" checked={b.streak} onChange={(streak) => u({ streak })} />
        <Tog label="Trophies" checked={b.trophies} onChange={(trophies) => u({ trophies })} />
        <Tog label="Activity graph" checked={b.activity} onChange={(activity) => u({ activity })} />
      </Section><Section title="Look"><Sel label="Theme" value={b.theme} options={STATS_THEMES} onChange={(theme) => u({ theme })} /><Tog label="Hide border" checked={b.hideBorder} onChange={(hideBorder) => u({ hideBorder })} /></Section>{align}</>;
    case "projects": return <><Section title="Grid"><N label="Columns" value={b.columns} min={1} max={4} onChange={(columns) => u({ columns: Math.max(1, Math.min(4, columns)) })} /></Section>
      <Section title="Projects"><ListEditor label="Project" items={b.items} onChange={(items) => u({ items })} make={() => ({ icon: "✨", title: "New project", description: "What makes it worth a look.", url: "https://github.com/", cta: "View project" })} render={(it, set) => <>
        <div className="rb-icon-title"><T label="Icon" value={it.icon} onChange={(icon) => set({ icon })} /><T label="Title" value={it.title} onChange={(title) => set({ title })} /></div>
        <TA label="Description" rows={2} value={it.description} onChange={(description) => set({ description })} />
        <div className="sx-row2"><T label="URL" value={it.url} onChange={(url) => set({ url })} /><T label="Link label" value={it.cta} onChange={(cta) => set({ cta })} /></div>
      </>} /></Section></>;
    case "image": return <><Section title="Image">
      <T label="Image URL" value={b.url} onChange={(url) => u({ url })} />
      <T label="Dark-mode variant (optional)" value={b.darkUrl} placeholder="./assets/card-dark.svg" onChange={(darkUrl) => u({ darkUrl })} />
      <div className="sx-row2"><T label="Alt text" value={b.alt} onChange={(alt) => u({ alt })} /><N label="Width (0 = auto)" value={b.width} onChange={(width) => u({ width })} /></div>
      <T label="Click link" value={b.link} placeholder="https://…" onChange={(link) => u({ link })} />
      <p className="sx-note">Tip: make a card on the SVG Cards tab, commit it to <code>assets/</code> and point here.</p>
    </Section>{align}</>;
    case "divider": return <Section title="Divider">
      <div className="sx-chips wrap">{([["hr", "Rule"], ["line", "Colored line"], ["rainbow", "Rainbow"], ["space", "Empty space"]] as const).map(([k, l]) => <button key={k} className={b.kind === k ? "on" : ""} onClick={() => u({ kind: k })}>{l}</button>)}</div>
      {b.kind === "space" && <N label="Height" value={b.size} onChange={(size) => u({ size })} />}
    </Section>;
    case "code": return <Section title="Code">
      <Sel label="Language" value={b.lang} options={["", "bash", "ts", "js", "tsx", "python", "go", "rust", "json", "yaml", "diff", "sql", "html", "css", "java", "kotlin", "cpp"]} onChange={(lang) => u({ lang })} />
      <TA label="Source" rows={10} mono value={b.content} onChange={(content) => u({ content })} />
    </Section>;
    case "quote": return <Section title="Quote">
      <div className="sx-chips wrap">{(["quote", "NOTE", "TIP", "IMPORTANT", "WARNING", "CAUTION"] as const).map((k) => <button key={k} className={`${b.kind === k ? "on" : ""} rb-alert-chip ${k.toLowerCase()}`} onClick={() => u({ kind: k })}>{k.toLowerCase()}</button>)}</div>
      <TA label="Text" rows={3} value={b.text} onChange={(text) => u({ text })} />
      <T label="Author (optional)" value={b.author} onChange={(author) => u({ author })} />
    </Section>;
    case "list": return <Section title="List">
      <div className="sx-chips">{(["bullet", "numbered", "task"] as const).map((k) => <button key={k} className={b.kind === k ? "on" : ""} onClick={() => u({ kind: k })}>{k}</button>)}</div>
      <TA label="One item per line" rows={7} value={b.items} onChange={(items) => u({ items })} />
      {b.kind === "task" && <p className="sx-note">Start a line with <code>x </code> to mark it done.</p>}
    </Section>;
    case "details": return <Section title="Collapsible">
      <T label="Summary" value={b.summary} onChange={(summary) => u({ summary })} />
      <TA label="Hidden content (markdown)" rows={7} value={b.content} onChange={(content) => u({ content })} />
      <Tog label="Open by default" checked={b.open} onChange={(open) => u({ open })} />
    </Section>;
    case "table": return <><Section title="Table">
      <TA label="CSV — first row is the header" rows={7} mono value={b.csv} onChange={(csv) => u({ csv })} />
    </Section><Section title="Column alignment"><AlignPick value={b.align} onChange={(align) => u({ align })} /></Section></>;
    case "toc": return <Section title="Contents">
      <T label="Title" value={b.title} onChange={(title) => u({ title })} />
      <Sel label="Depth" value={b.depth} options={[[2, "H2 only"], [3, "H2 + H3"]]} onChange={(depth) => u({ depth })} />
    </Section>;
    case "snake": return <><Section title="Snake"><T label="GitHub username" value={b.username} onChange={(username) => u({ username })} /><Tog label="Dark variant via <picture>" checked={b.dark} onChange={(dark) => u({ dark })} /></Section>{align}</>;
    case "visitors": return <><Section title="Counter">
      <T label="GitHub username" value={b.username} onChange={(username) => u({ username })} />
      <T label="Label" value={b.label} onChange={(label) => u({ label })} />
      <div className="sx-row2"><Hex label="Color" value={b.color} onChange={(color) => u({ color })} /><Sel label="Style" value={b.style} options={BADGE_STYLES} onChange={(style) => u({ style })} /></div>
    </Section>{align}</>;
    case "quoteapi": return <><Section title="Quote card"><Sel label="Theme" value={b.theme} options={QUOTE_THEMES} onChange={(theme) => u({ theme })} /></Section>{align}</>;
    case "html": return <Section title="HTML"><TA label="Raw HTML / Markdown" rows={12} mono value={b.content} onChange={(content) => u({ content })} /></Section>;
  }
}
