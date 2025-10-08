import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		// Metadatos financieros
		impact: z.enum(['alto', 'medio', 'bajo']).optional(),
		sectors: z.array(z.string()).optional(),
		source: z.string().optional(),
		sentiment: z.enum(['positivo', 'neutral', 'negativo']).optional(),
		relevanceScore: z.number().min(1).max(10).optional(),
		tickers: z.array(z.string()).optional(),
	}),
});

export const collections = { blog };
