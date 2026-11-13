# AGENTS.md

This file provides guidance for AI coding agents and other automated tools working in this repository.

## Project Overview

TuringNest is a Hugo static site for a personal blog at https://blog.turingzy.cn. The content is primarily Chinese. The site uses the YinYang theme with local layout and partial overrides, and is deployed through Cloudflare Pages.

## Commands

```bash
hugo server -D                         # Start the local server, including drafts
hugo                                   # Build the site into public/
hugo new posts/<category>/<title>.md   # Create a post from archetypes/default.md
```

There is no package manager, Makefile, linter, or test suite configured. A successful `hugo` build is the primary validation check. Keep the local Hugo version aligned with the version configured for Cloudflare Pages; see the note at the top of `hugo.toml`.

## Repository Structure

- `content/posts/<category>/` contains posts grouped into categories such as algorithm, backend-development, copy, film-review, others, and travel.
- `content/about.md`, `content/games.md`, `content/travel-map.md`, and `content/photography.md` are the top-level content pages.
- `data/` contains `games.json`, `travel-spots.json`, `china-provinces.json`, and `photography.json`, providing structured data to dedicated pages.
- `themes/yinyang/layouts/` contains custom page layouts (including `games.html`, `travel-map.html`, `photography.html`, `404.html`, `terms.html`, and `index.json`).
- `themes/yinyang/` contains the full theme, styling (`assets/css/index.css`), and templates.
- `static/` contains files copied directly to the generated site.
- `archetypes/default.md` defines the front matter template for new posts.

## Content Conventions

Posts use YAML front matter. Preserve existing fields and style (`title`, `slug`, `categories`, `date`) when editing or creating content. Keep post URLs stable (`/posts/:slug/`).

## Theme Customizations

Key YinYang partials and components:

- `head.html`: Theme flash prevention, KaTeX math support, and meta/SEO tags
- `header.html`: Navigation, light/dark theme switching, and search trigger
- `search.html`: Lightweight client-side fuzzy search powered by `index.json`
- `single.html`: Table of contents, scroll-spy behavior, and post layout
- `scripts.html`: Unified gallery image lightbox (grouping, touch swipe, metadata, link bypass) and external link exit confirmation
- `ink-plum.html`: Homepage canvas-based ink plum blossom interactive animation and poetry
- `heatmap.html`: GitHub-style contribution heatmap on the homepage
- `related.html`: Weighted related post recommendations
- `giscus.html`: Comments backed by GitHub Discussions

Prefer extending the existing theme override points and page templates. Avoid modifying generated files under `public/`.

## Configuration Notes

- The canonical site URL is `https://blog.turingzy.cn`.
- The main content section is `posts`.
- Markdown permits inline math delimited by `$...$`; code highlighting uses the Monokai style with line numbers.
- Math typesetting uses KaTeX (loaded on demand for formula-bearing pages).
- Search index is generated at build time via `layouts/index.json` and fetched on demand.
- Images are commonly hosted on `cdn.img.turingzy.cn`. Regular content images and photography cards open in the unified lightbox, while images wrapped in `<a>` bypass it.
- Giscus comments use the `turingzy-dev/blog-giscus` repository.
- Permalinks for posts use `/posts/:slug/`.

## Validation and Change Scope

After changing templates, configuration, or content, run `hugo`. For interactive pages, also run `hugo server -D` and check the affected route locally. Do not commit `public/`, generated Hugo resources, local editor settings, scripts, or AI-tool configuration unless the task explicitly requires them.