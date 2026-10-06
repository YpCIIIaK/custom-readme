"use client";

import { useState } from "react";
import { GitBranch, LayoutTemplate, Sparkles } from "lucide-react";
import { ReadmeBuilder } from "@/components/readme-builder";
import { SvgCardDesigner } from "@/components/svg-card-designer";

export default function Home() {
  const [mode, setMode] = useState<"readme" | "svg">("readme");
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><span>R</span></div><div><strong>Readme Studio</strong><small>Visual builder</small></div></div>
        <div className="studio-switch">
          <button className={mode === "readme" ? "active" : ""} onClick={() => setMode("readme")}><LayoutTemplate /> README Builder</button>
          <button className={mode === "svg" ? "active" : ""} onClick={() => setMode("svg")}><Sparkles /> SVG Cards</button>
        </div>
        <div className="top-actions"><a className="github-link" href="https://github.com/YpCIIIaK/custom-readme" target="_blank" rel="noreferrer"><GitBranch size={17} /> <span>Repository</span></a></div>
      </header>
      {mode === "readme" ? <ReadmeBuilder /> : <SvgCardDesigner />}
    </main>
  );
}
