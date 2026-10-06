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
- Visual SVG card designer with four themes
- Drag-and-drop layer positioning with exact X/Y coordinates
- README-safe canvas presets capped at 830 pixels
- Embedded PNG, JPEG, or WebP background images with cover/contain controls
- Automatic warnings for raster upscaling, oversized embeds, off-canvas layers, and experimental animation
- Standalone SVG export with optional SMIL motion
- Custom card dimensions, labels, descriptions, actions, and click destinations
- Ready-to-copy Markdown for local `assets/` files

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
