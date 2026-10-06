"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, ChevronUp, Clipboard, Code2, Download, Eye, GitBranch, GripVertical, LayoutTemplate, Moon, Plus, RotateCcw, Settings2, Sparkles, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type ThemeName = "midnight" | "paper" | "terminal";
type Project = { id: number; icon: string; title: string; description: string; url: string; cta: string };

const initialProjects: Project[] = [
  { id: 1, icon: "🛡️", title: "Cyber Security", description: "An interactive project about cybersecurity, digital threats, and data protection.", url: "https://ypciiiak.github.io/cyber-sec/", cta: "Explore project" },
  { id: 2, icon: "🧹", title: "Repo Anti-Rot", description: "A repository auditing tool designed to detect technical decay and maintenance issues.", url: "https://repo-anti-rot.onrender.com/", cta: "Run an audit" },
  { id: 3, icon: "💻", title: "Developer Portfolio", description: "My projects, technologies, experience, and information about me.", url: "https://ypciiiaksportfolio.vercel.app/", cta: "View portfolio" },
];

const themes: { id: ThemeName; label: string; description: string; colors: string[] }[] = [
  { id: "midnight", label: "Midnight", description: "Deep navy and electric violet", colors: ["#090b12", "#171b2b", "#8b5cf6"] },
  { id: "paper", label: "Paper", description: "Clean editorial workspace", colors: ["#f8f7f3", "#ffffff", "#191919"] },
  { id: "terminal", label: "Terminal", description: "Green phosphor developer UI", colors: ["#050806", "#0b130d", "#65f58b"] },
];

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function createMarkdown(title: string, intro: string, projects: Project[]) {
  const cells = projects.map((project) => `    <td width="${Math.floor(100 / projects.length)}%" align="center" valign="top">
      <h3>${escapeHtml(project.icon)} ${escapeHtml(project.title)}</h3>
      <p>${escapeHtml(project.description)}</p>
      <br>
      <a href="${escapeHtml(project.url)}"><strong>${escapeHtml(project.cta)} →</strong></a>
    </td>`).join("\n");

  return `<h1 align="center">${escapeHtml(title)}</h1>

<p align="center">${escapeHtml(intro)}</p>

<br>

<table>
  <tr>
${cells}
  </tr>
</table>`;
}

export default function Home() {
  const [title, setTitle] = useState("Featured Projects");
  const [intro, setIntro] = useState("A curated collection of things I build, explore, and improve.");
  const [projects, setProjects] = useState(initialProjects);
  const [theme, setTheme] = useState<ThemeName>("midnight");
  const [previewMode, setPreviewMode] = useState<"dark" | "light">("dark");
  const [selected, setSelected] = useState(1);
  const [copied, setCopied] = useState(false);
  const markdown = useMemo(() => createMarkdown(title, intro, projects), [title, intro, projects]);
  const activeProject = projects.find((project) => project.id === selected) ?? projects[0];

  const updateProject = (field: keyof Project, value: string) => setProjects((items) => items.map((item) => item.id === selected ? { ...item, [field]: value } : item));
  const moveProject = (direction: -1 | 1) => setProjects((items) => {
    const index = items.findIndex((item) => item.id === selected);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= items.length) return items;
    const next = [...items];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  });
  const addProject = () => {
    const id = Math.max(0, ...projects.map((project) => project.id)) + 1;
    setProjects((items) => [...items, { id, icon: "✨", title: "New Project", description: "Describe what makes this project worth exploring.", url: "https://github.com/", cta: "View project" }]);
    setSelected(id);
  };
  const removeProject = () => {
    if (projects.length === 1) return;
    const remaining = projects.filter((project) => project.id !== selected);
    setProjects(remaining); setSelected(remaining[0].id);
  };
  const copyMarkdown = async () => { await navigator.clipboard.writeText(markdown); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "README.md"; anchor.click(); URL.revokeObjectURL(url);
  };

  return (
    <main className={`app-shell theme-${theme}`}>
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><span>R</span></div><div><strong>Readme Studio</strong><small>Visual builder</small></div></div>
        <div className="document-title"><span className="status-dot" /> README.md <span>/</span> Featured projects</div>
        <div className="top-actions"><a className="github-link" href="https://github.com/YpCIIIaK/custom-readme" target="_blank" rel="noreferrer"><GitBranch size={17} /> <span>Repository</span></a><Button className="export-button" onClick={downloadMarkdown}><Download size={16} /> Export</Button></div>
      </header>

      <section className="workspace">
        <aside className="left-panel panel">
          <div className="panel-heading"><div><span>Structure</span><small>{projects.length + 1} blocks</small></div><Button size="icon" variant="ghost" aria-label="Add project" onClick={addProject}><Plus size={17} /></Button></div>
          <nav className="block-list" aria-label="README blocks">
            <button className="block-item static-block"><GripVertical /><span className="block-icon"><LayoutTemplate /></span><span><strong>Header</strong><small>Title & introduction</small></span></button>
            {projects.map((project, index) => <button key={project.id} className={`block-item ${selected === project.id ? "active" : ""}`} onClick={() => setSelected(project.id)}><GripVertical /><span className="emoji-icon">{project.icon}</span><span><strong>{project.title}</strong><small>Project card {index + 1}</small></span></button>)}
          </nav>
          <Button variant="outline" className="add-block" onClick={addProject}><Plus size={16} /> Add project</Button>
          <div className="panel-divider" /><div className="section-label"><Sparkles size={14} /> Theme</div>
          <div className="theme-list">{themes.map((item) => <button key={item.id} className={`theme-option ${theme === item.id ? "selected" : ""}`} onClick={() => setTheme(item.id)}><span className="swatches">{item.colors.map((color) => <i key={color} style={{ background: color }} />)}</span><span><strong>{item.label}</strong><small>{item.description}</small></span>{theme === item.id && <Check size={15} />}</button>)}</div>
        </aside>

        <section className="canvas-panel panel"><div className="canvas-toolbar">
          <Tabs defaultValue="preview"><TabsList><TabsTrigger value="preview"><Eye size={15} /> Preview</TabsTrigger><TabsTrigger value="code"><Code2 size={15} /> Markdown</TabsTrigger></TabsList>
            <TabsContent value="preview"><div className="preview-wrap">
              <div className="preview-controls"><span>GitHub preview</span><div><button className={previewMode === "light" ? "active" : ""} onClick={() => setPreviewMode("light")} aria-label="Light preview"><Sun size={14} /></button><button className={previewMode === "dark" ? "active" : ""} onClick={() => setPreviewMode("dark")} aria-label="Dark preview"><Moon size={14} /></button></div></div>
              <article className={`github-preview ${previewMode}`}><h1>{title}</h1><p className="intro">{intro}</p><div className="project-grid">{projects.map((project, index) => <a key={project.id} className="project-card" href={project.url} target="_blank" rel="noreferrer"><span className="project-number">{String(index + 1).padStart(2, "0")}</span><span className="project-emoji">{project.icon}</span><h3>{project.title}</h3><p>{project.description}</p><strong>{project.cta} <span>→</span></strong></a>)}</div></article>
            </div></TabsContent>
            <TabsContent value="code"><div className="code-view"><div className="code-header"><span>README.md</span><Button variant="ghost" size="sm" onClick={copyMarkdown}>{copied ? <Check size={14} /> : <Clipboard size={14} />} {copied ? "Copied" : "Copy"}</Button></div><pre>{markdown}</pre></div></TabsContent>
          </Tabs>
        </div></section>

        <aside className="right-panel panel">
          <div className="panel-heading"><div><span>Customize</span><small>{activeProject?.title}</small></div><Settings2 size={17} /></div>
          <div className="editor-section"><div className="section-title"><span>Page heading</span></div><Label htmlFor="page-title">Title</Label><Input id="page-title" value={title} onChange={(event) => setTitle(event.target.value)} /><Label htmlFor="page-intro">Introduction</Label><Textarea id="page-intro" value={intro} onChange={(event) => setIntro(event.target.value)} rows={3} /></div>
          {activeProject && <div className="editor-section"><div className="section-title"><span>Selected project</span><div><button aria-label="Move project up" onClick={() => moveProject(-1)}><ChevronUp /></button><button aria-label="Move project down" onClick={() => moveProject(1)}><ChevronDown /></button></div></div><div className="field-row"><div><Label htmlFor="icon">Icon</Label><Input id="icon" className="icon-input" value={activeProject.icon} onChange={(event) => updateProject("icon", event.target.value)} /></div><div><Label htmlFor="project-title">Project title</Label><Input id="project-title" value={activeProject.title} onChange={(event) => updateProject("title", event.target.value)} /></div></div><Label htmlFor="description">Description</Label><Textarea id="description" value={activeProject.description} onChange={(event) => updateProject("description", event.target.value)} rows={4} /><Label htmlFor="url">Project URL</Label><Input id="url" value={activeProject.url} onChange={(event) => updateProject("url", event.target.value)} /><Label htmlFor="cta">Link label</Label><Input id="cta" value={activeProject.cta} onChange={(event) => updateProject("cta", event.target.value)} /><Button variant="ghost" className="delete-button" onClick={removeProject} disabled={projects.length === 1}><Trash2 size={15} /> Remove project</Button></div>}
          <div className="right-footer"><Button variant="outline" onClick={() => { setTitle("Featured Projects"); setIntro("A curated collection of things I build, explore, and improve."); setProjects(initialProjects); setSelected(1); }}><RotateCcw size={15} /> Reset</Button><Button onClick={copyMarkdown}>{copied ? <Check size={15} /> : <Clipboard size={15} />} {copied ? "Copied" : "Copy Markdown"}</Button></div>
        </aside>
      </section>
    </main>
  );
}
