# N8N News - Automated News Aggregator

A modern news aggregation system built with Astro and N8N that automatically collects, processes, and publishes news articles.

## 🚀 Features

- Automated news collection and processing
- Modern, responsive blog layout
- SEO optimized
- Fast and lightweight
- Easy to maintain and extend

## 📝 Content Structure

### Blog Posts
Blog posts are stored in `src/content/blog/` with the following format:

```markdown
---
title: "Article Title"
description: "Brief description of the article"
pubDate: "YYYY-MM-DD"
updatedDate: "YYYY-MM-DD" # Optional
---

Article content in Markdown format...
```

### File Naming Convention
- Use the format: `YYYY-MM-DD-title-with-dashes.md`
- Example: `2024-04-18-article-title.md`

## 🎨 Project Structure

```
n8n-news/
├── src/
│   ├── components/     # Reusable components
│   ├── content/        # Blog posts and content
│   ├── layouts/        # Page layouts
│   └── pages/          # Astro pages
├── public/             # Static assets
└── package.json        # Project dependencies
```
