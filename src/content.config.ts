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
		impact: z.union([
			z.enum(['alto', 'medio', 'bajo']),
			z.enum(['high', 'medium', 'low']),
			z.enum(['HIGH', 'MEDIUM', 'LOW']),
			z.enum(['Alto', 'Medio', 'Bajo']),
			z.enum(['High', 'Medium', 'Low'])
		]).transform((val) => {
			const mapping: Record<string, string> = {
				'high': 'alto',
				'medium': 'medio', 
				'low': 'bajo',
				'HIGH': 'alto',
				'MEDIUM': 'medio',
				'LOW': 'bajo',
				'High': 'alto',
				'Medium': 'medio',
				'Low': 'bajo'
			};
			return mapping[val] || val;
		}).optional(),
		sectors: z.array(z.string()).optional(),
		source: z.string().optional(),
		sentiment: z.union([
			z.enum(['positivo', 'neutral', 'negativo']),
			z.enum(['positive', 'neutral', 'negative']),
			z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE']),
			z.enum(['Positivo', 'Neutral', 'Negativo']),
			z.enum(['Positive', 'Neutral', 'Negative'])
		]).transform((val) => {
			const mapping: Record<string, string> = {
				'positive': 'positivo',
				'negative': 'negativo',
				'POSITIVE': 'positivo',
				'NEGATIVE': 'negativo',
				'Positive': 'positivo',
				'Negative': 'negativo'
			};
			return mapping[val] || val;
		}).optional(),
		relevanceScore: z.number().min(1).max(10).nullable().optional(),
		tickers: z.array(z.string()).optional(),
	}),
});

export const collections = { blog };
