<h1 align="center">Readme Studio</h1>

<p align="center">
  A visual builder for GitHub profile READMEs and animated SVG cards — no Markdown wrestling.
</p>

<p align="center">
  <a href="https://ypciiiak.github.io/custom-readme/"><img src="https://img.shields.io/badge/Open%20the%20app-ypciiiak.github.io%2Fcustom--readme-e0703f?style=for-the-badge&logo=githubpages&logoColor=white" alt="Open the app" /></a>
</p>

<p align="center">
  <a href="https://ypciiiak.github.io/custom-readme/"><b>🚀 ypciiiak.github.io/custom-readme</b></a>
  ·
  <a href="#readme-builder">README builder</a>
  ·
  <a href="#svg-card-editor">SVG card editor</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/deployments/YpCIIIaK/custom-readme/github-pages?label=pages&style=flat-square" alt="Pages status" />
  <img src="https://img.shields.io/github/last-commit/YpCIIIaK/custom-readme?style=flat-square" alt="Last commit" />
  <img src="https://img.shields.io/badge/runs%20in-your%20browser-2f6f4f?style=flat-square" alt="Runs in your browser" />
</p>

---

Everything runs in the browser and is saved locally: no account, no server. Build a README from blocks, design SVG cards with animations, then copy the result into your profile repository.

## Current features

### README builder

- 21 block types: header with banner, section titles, markdown text, lists and task lists, GitHub alerts (NOTE/TIP/WARNING…), code, typing SVG, shields.io badges, 18 social platforms, skillicons tech stack picker, GitHub stats / languages / streak / trophies / activity graph, contribution snake, visitor counter, dev quotes, project card grid, images with dark-mode variants, tables from CSV, collapsible sections, auto table of contents, dividers, raw HTML
- Drag-and-drop ordering, hide, duplicate, undo/redo, searchable block library
- GitHub-style preview in light/dark and desktop/mobile widths, split view with live Markdown
- Templates: developer profile, minimal, project README, projects showcase
- Copy or download `README.md`; save/open projects as JSON; autosave in the browser

### SVG card editor

- Move, 8-handle resize (Shift keeps ratio), rotation handle (Shift snaps 15°), flip, snap-to-grid
- Multi-select, align & distribute, z-order, duplicate, copy/paste, lock/hide layers, undo/redo
- Fills: solid, linear and radial gradients with any number of stops
- Effects: drop shadow, glow, blur, blend modes
- Backgrounds: gradient presets, vignette, border
- 23 element types: text, shapes (rect, ellipse, line, polygon, star, triangle, heart, plus, arrow, spiral, blob, wave, path), icons, badges, speech bubbles, progress bars, ring meters, bar charts, sparklines, dot grids, images
- 25 animations, including zoom/drop/rotate-in, wiggle, swing, heartbeat, orbit, marquee, color shift, marching dashes, draw/grow
- Mesh-gradient glow (optionally moving), 17 textures with drift/angle, starfield, film grain, scanlines
- Card history: every card is autosaved; reopen old ones or copy individual layers into the current card
- Templates: profile hero, project card, terminal, skill meter, wave banner, quote, aurora mesh, stats dashboard, speech bubble
- Export SVG, PNG 1×/2×, SVG code or README embed; save/open projects as JSON
- GitHub compatibility checks (width, file size, fonts, links)

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Create a production build:

```bash
npm run build
```

## Deployment

Pushes to `main` are deployed automatically through the GitHub Pages workflow. In the repository settings, select **GitHub Actions** as the Pages source.

## Roadmap

- More README block types
- Saved templates
- Drag-and-drop structure editing
- Custom typography and color controls
- Additional SVG card layouts and animation styles
