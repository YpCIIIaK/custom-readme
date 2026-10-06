# Readme Studio

A visual GitHub README builder for designing project sections, previewing the result in GitHub light and dark modes, and exporting clean Markdown.

## Current features

- Live GitHub-style preview
- Editable heading, introduction, and project cards
- Add, remove, and reorder projects
- Midnight, Paper, and Terminal themes
- Light and dark preview modes
- Copy generated Markdown
- Download a ready-to-use `README.md`
- Responsive editor layout

### SVG card editor

- 13 element types: text, rectangle, ellipse, line, polygon, star, blob, wave, custom path, icon (28 built-in), badge, progress bar, image
- Move, 8-handle resize (Shift keeps ratio), rotation handle (Shift snaps 15°), flip, snap-to-grid
- Multi-select, align & distribute, z-order, duplicate, copy/paste, lock/hide layers, undo/redo
- Fills: solid, linear and radial gradients with any number of stops
- Effects: drop shadow, glow, blur, blend modes
- 13 SMIL animations: fade, slide, pulse, float, bounce, spin, blink, draw, typewriter, shimmer…
- Backgrounds: gradient presets, 8 textures (grid, dots, waves, topo, noise…), vignette, border
- Templates: profile hero, project card, terminal, skill meter, wave banner, quote
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
