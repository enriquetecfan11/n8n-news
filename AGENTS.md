# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**N8N News** is an automated news aggregation system built with **Astro** that collects, processes, and publishes financial and technology news articles. It features a modern blog layout with filtering, search, sector and stock ticker navigation, and SEO optimization.

## Development Commands

### Common Tasks
- **Start dev server**: `npm run dev` (Astro dev server on localhost:3000)
- **Build for production**: `npm run build`
- **Preview built site**: `npm run preview`

### Content Validation
These commands validate markdown frontmatter and clean invalid files:
- **Validate all posts**: `npm run validate` or `npm run v`
- **Auto-fix frontmatter issues**: `npm run vfix` (fixes malformed dates/comments)
- **Delete invalid markdown files**: `npm run vdel`
- **Fix and delete**: `npm run vfixa` (combines both operations)
- **Start dev with cleanup**: Run `./start-dev.sh` (validates, pulls changes, commits cleanups, then starts dev server)

## Content Structure

### Blog Post Format
Blog posts are stored in `src/content/blog/` as Markdown files with YAML frontmatter.

**File naming convention**: `YYYY-MM-DD-title-with-dashes.md`
Example: `2024-04-18-stock-market-analysis.md`

**Required frontmatter fields**:
```yaml
title: "Article Title"
description: "Brief summary (recommended max 200 chars)"
pubDate: "YYYY-MM-DD"
```

**Optional financial metadata fields**:
```yaml
updatedDate: "YYYY-MM-DD"
impact: "alto" | "medio" | "bajo"  # Market impact level
sectors: ["tecnología", "finanzas", "energía", ...]  # Affected sectors
sentiment: "positivo" | "neutral" | "negativo"  # Market sentiment
source: "Source name"  # News source
tickers: ["AAPL", "MSFT", ...]  # Stock tickers
relevanceScore: 1-10  # Custom relevance (integer)
```

See `parametros-noticia.md` for detailed field descriptions and sector/ticker guidelines.

## Architecture & Key Files

### Content System
- **`src/content.config.ts`**: Astro content collection schema with field validation and transformations
- **`src/content/blog/`**: All blog post markdown files
- Content is loaded as a collection via Astro's content loader (glob pattern)
- Fields like `impact` and `sentiment` support multiple case variants and are normalized to Spanish lowercase

### Pages & Routing
- **`src/pages/index.astro`**: Main blog listing page (posts grouped by date, newest first)
- **`src/pages/blog/[...slug].astro`**: Individual blog post pages (dynamic routing by post ID)
- **`src/pages/blog/sector/`**: Sector-based post filtering
- **`src/pages/blog/ticker/`**: Stock ticker-based post filtering
- **`src/pages/about.astro`**: About page
- **`src/pages/market-overview.astro`**: Market overview page
- **`src/pages/rss.xml.js`**: RSS feed generation

### Key Utilities
- **`src/utils/newsFilter.ts`**: `NewsFilter` class with caching, search indexing, and filtering by impact/sector/sentiment/ticker/date/search query. Supports relevance/date/impact sorting. Used for dynamic filtering UI.
- **`src/utils/searchIndex.ts`**: Search indexing utilities
- **`src/utils/dark-mode.ts`**: Theme toggle logic
- **`src/utils/lazy-load.ts`**: Lazy loading for performance
- **`src/utils/cache.ts`**: Caching utilities

### Layout & Components
- **`src/layouts/BaseLayout.astro`**: Base page layout
- **`src/layouts/BlogPost.astro`**: Blog post detail layout
- **`src/components/Header.astro`**, **Footer.astro**: Page chrome
- **`src/components/SearchBar.astro`**: Search functionality
- **`src/components/ThemeToggle.astro`**: Dark mode toggle
- Various finance-related and news display components

### Build & Config
- **`astro.config.mjs`**: Astro configuration (integrations: MDX, sitemap, React)
- **`tsconfig.json`**: TypeScript configuration
- **`package.json`**: Dependencies (Astro 6.4, React 19, TypeScript support, RSS/sitemap plugins)

### Metadata & Validation
- **`validate-md.js`**: Node.js script that validates markdown frontmatter, auto-fixes malformed dates/comments, and optionally deletes invalid files. Uses `chalk` for colored output.
- **`scripts/addMetadataToBlogs.ts`**: TypeScript script for enriching blog posts with financial metadata
- **`parametros-noticia.md`**: Complete documentation of all news parameters, sectors, and impact criteria

## Common Development Patterns

### Adding a New Blog Post
1. Create file: `src/content/blog/YYYY-MM-DD-title.md`
2. Add required frontmatter (title, description, pubDate)
3. Add optional metadata (impact, sectors, sentiment, tickers, source, relevanceScore)
4. Write markdown content
5. Run `npm run validate` to check for issues

### Filtering & Searching Posts
The `NewsFilter` class handles complex filtering:
- Filter by multiple attributes simultaneously (impact, sectors, sentiment, tickers, date range)
- Full-text search with word-based matching
- Sort by relevance (default), date, or impact level
- Results are cached for performance
- Related post discovery by similarity (shared sectors/tickers/impact/sentiment)

### Dynamic Routing
Blog posts are indexed by their file ID (e.g., `2024-04-18-title` becomes a slug). Dynamic routes in `[...slug].astro` render individual posts. Sector and ticker routes filter the collection accordingly.

## Validation & Content Quality

The validation system ensures data integrity:
- Frontmatter must be valid YAML between `---` delimiters
- Required fields are checked (title, description, pubDate)
- Dates are automatically cleaned (removes trailing comments, converts to ISO format)
- Invalid files can be auto-deleted with `npm run vdel`
- The system is case-insensitive for enum fields (impact, sentiment) and normalizes to Spanish lowercase

## Deployment & Build
- Production build: `npm run build` generates static files in `dist/`
- Site URL configured in `astro.config.mjs` (currently `example.com` — update for deployment)
- Sitemap and RSS feed are auto-generated by Astro integrations
- Vercel Analytics integration included
