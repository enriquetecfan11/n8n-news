/**
 * Índice de búsqueda optimizado para noticias financieras
 */

import type { CollectionEntry } from 'astro:content';
import { newsCache, searchCache } from './cache';

export interface SearchResult {
  post: CollectionEntry<'blog'>;
  score: number;
  highlights: string[];
  matchedFields: string[];
}

export interface SearchOptions {
  limit?: number;
  minScore?: number;
  includeHighlights?: boolean;
  fields?: string[];
}

export class SearchIndex {
  private index: Map<string, Set<string>> = new Map();
  private posts: CollectionEntry<'blog'>[] = [];
  private fieldWeights: Record<string, number> = {
    title: 3.0,
    description: 2.0,
    sectors: 1.5,
    tickers: 1.5,
    source: 1.0,
    content: 1.0
  };

  constructor() {
    this.loadIndex();
  }

  /**
   * Build search index from posts
   */
  buildIndex(posts: CollectionEntry<'blog'>[]): void {
    this.posts = posts;
    this.index.clear();

    for (const post of posts) {
      this.indexPost(post);
    }

    this.saveIndex();
  }

  /**
   * Index a single post
   */
  private indexPost(post: CollectionEntry<'blog'>): void {
    const postId = post.id;
    const text = this.extractText(post);
    const words = this.tokenize(text);

    for (const word of words) {
      if (!this.index.has(word)) {
        this.index.set(word, new Set());
      }
      this.index.get(word)!.add(postId);
    }
  }

  /**
   * Extract searchable text from a post
   */
  private extractText(post: CollectionEntry<'blog'>): string {
    const parts: string[] = [];

    // Title (high weight)
    if (post.data.title) {
      parts.push(post.data.title);
    }

    // Description (medium weight)
    if (post.data.description) {
      parts.push(post.data.description);
    }

    // Sectors (medium weight)
    if (post.data.sectors) {
      parts.push(...post.data.sectors);
    }

    // Tickers (medium weight)
    if (post.data.tickers) {
      parts.push(...post.data.tickers);
    }

    // Source (low weight)
    if (post.data.source) {
      parts.push(post.data.source);
    }

    return parts.join(' ');
  }

  /**
   * Tokenize text into searchable terms
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter short words
      .map(word => this.stem(word)); // Apply stemming
  }

  /**
   * Simple stemming algorithm
   */
  private stem(word: string): string {
    // Remove common suffixes
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment'];
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    
    return word;
  }

  /**
   * Search for posts matching query
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const {
      limit = 20,
      minScore = 0.1,
      includeHighlights = true,
      fields = ['title', 'description', 'sectors', 'tickers', 'source']
    } = options;

    // Check cache first
    const cacheKey = `search:${query}:${JSON.stringify(options)}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const queryWords = this.tokenize(query);
    const results = new Map<string, SearchResult>();

    // Find posts matching query words
    for (const word of queryWords) {
      const postIds = this.index.get(word);
      if (!postIds) continue;

      for (const postId of postIds) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) continue;

        const existing = results.get(postId);
        if (existing) {
          existing.score += this.calculateWordScore(word, post, fields);
        } else {
          results.set(postId, {
            post,
            score: this.calculateWordScore(word, post, fields),
            highlights: includeHighlights ? this.generateHighlights(word, post) : [],
            matchedFields: this.getMatchedFields(word, post, fields)
          });
        }
      }
    }

    // Sort by score and apply filters
    const sortedResults = Array.from(results.values())
      .filter(result => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // Cache results
    searchCache.set(cacheKey, sortedResults, 15 * 60 * 1000); // 15 minutes

    return sortedResults;
  }

  /**
   * Calculate score for a word match in a post
   */
  private calculateWordScore(word: string, post: CollectionEntry<'blog'>, fields: string[]): number {
    let score = 0;
    const text = this.extractText(post).toLowerCase();

    // Exact match bonus
    if (text.includes(word)) {
      score += 1.0;
    }

    // Field-specific scoring
    if (fields.includes('title') && post.data.title?.toLowerCase().includes(word)) {
      score += this.fieldWeights.title;
    }

    if (fields.includes('description') && post.data.description?.toLowerCase().includes(word)) {
      score += this.fieldWeights.description;
    }

    if (fields.includes('sectors') && post.data.sectors?.some(s => s.toLowerCase().includes(word))) {
      score += this.fieldWeights.sectors;
    }

    if (fields.includes('tickers') && post.data.tickers?.some(t => t.toLowerCase().includes(word))) {
      score += this.fieldWeights.tickers;
    }

    if (fields.includes('source') && post.data.source?.toLowerCase().includes(word)) {
      score += this.fieldWeights.source;
    }

    // Relevance score bonus
    if (post.data.relevanceScore) {
      score += post.data.relevanceScore / 10;
    }

    return score;
  }

  /**
   * Generate highlights for search results
   */
  private generateHighlights(word: string, post: CollectionEntry<'blog'>): string[] {
    const highlights: string[] = [];
    const text = this.extractText(post);

    // Find word occurrences
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = text.match(regex);

    if (matches) {
      highlights.push(...matches.slice(0, 3)); // Limit to 3 highlights
    }

    return highlights;
  }

  /**
   * Get fields that matched the search
   */
  private getMatchedFields(word: string, post: CollectionEntry<'blog'>, fields: string[]): string[] {
    const matchedFields: string[] = [];

    if (fields.includes('title') && post.data.title?.toLowerCase().includes(word)) {
      matchedFields.push('title');
    }

    if (fields.includes('description') && post.data.description?.toLowerCase().includes(word)) {
      matchedFields.push('description');
    }

    if (fields.includes('sectors') && post.data.sectors?.some(s => s.toLowerCase().includes(word))) {
      matchedFields.push('sectors');
    }

    if (fields.includes('tickers') && post.data.tickers?.some(t => t.toLowerCase().includes(word))) {
      matchedFields.push('tickers');
    }

    if (fields.includes('source') && post.data.source?.toLowerCase().includes(word)) {
      matchedFields.push('source');
    }

    return matchedFields;
  }

  /**
   * Get search suggestions
   */
  getSuggestions(query: string, limit: number = 10): string[] {
    if (query.length < 2) return [];

    const cacheKey = `suggestions:${query}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const queryWords = this.tokenize(query);
    const suggestions = new Set<string>();

    for (const word of queryWords) {
      // Find words that start with the query
      for (const [indexWord] of this.index.entries()) {
        if (indexWord.startsWith(word) && indexWord !== word) {
          suggestions.add(indexWord);
        }
      }
    }

    const result = Array.from(suggestions)
      .sort()
      .slice(0, limit);

    searchCache.set(cacheKey, result, 30 * 60 * 1000); // 30 minutes
    return result;
  }

  /**
   * Get popular search terms
   */
  getPopularTerms(limit: number = 20): Array<{ term: string; count: number }> {
    const cacheKey = `popular:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const termCounts = new Map<string, number>();

    for (const [word, postIds] of this.index.entries()) {
      termCounts.set(word, postIds.size);
    }

    const result = Array.from(termCounts.entries())
      .map(([term, count]) => ({ term, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    searchCache.set(cacheKey, result, 60 * 60 * 1000); // 1 hour
    return result;
  }

  /**
   * Get related terms
   */
  getRelatedTerms(term: string, limit: number = 10): string[] {
    const cacheKey = `related:${term}:${limit}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const termPosts = this.index.get(term);
    if (!termPosts) return [];

    const relatedTerms = new Map<string, number>();

    for (const postId of termPosts) {
      const post = this.posts.find(p => p.id === postId);
      if (!post) continue;

      const text = this.extractText(post);
      const words = this.tokenize(text);

      for (const word of words) {
        if (word !== term) {
          relatedTerms.set(word, (relatedTerms.get(word) || 0) + 1);
        }
      }
    }

    const result = Array.from(relatedTerms.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([term]) => term);

    searchCache.set(cacheKey, result, 30 * 60 * 1000); // 30 minutes
    return result;
  }

  /**
   * Save index to cache
   */
  private saveIndex(): void {
    const indexData = {
      index: Array.from(this.index.entries()).map(([key, value]) => [key, Array.from(value)]),
      posts: this.posts.map(post => ({ id: post.id, data: post.data })),
      timestamp: Date.now()
    };

    newsCache.set('search_index', indexData, 60 * 60 * 1000); // 1 hour
  }

  /**
   * Load index from cache
   */
  private loadIndex(): void {
    const cached = newsCache.get('search_index');
    if (cached) {
      this.index = new Map(cached.index.map(([key, value]: [string, string[]]) => [key, new Set(value)]));
      this.posts = cached.posts;
    }
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      totalTerms: this.index.size,
      totalPosts: this.posts.length,
      averageTermsPerPost: this.posts.length > 0 ? this.index.size / this.posts.length : 0,
      mostCommonTerms: this.getPopularTerms(10)
    };
  }
}

// Global search index instance
export const searchIndex = new SearchIndex();

// Search utility functions
export function createSearchQuery(terms: string[]): string {
  return terms.join(' ');
}

export function parseSearchQuery(query: string): {
  terms: string[];
  filters: Record<string, string[]>;
  operators: string[];
} {
  const terms: string[] = [];
  const filters: Record<string, string[]> = {};
  const operators: string[] = [];

  // Simple query parsing
  const parts = query.split(/\s+/);
  
  for (const part of parts) {
    if (part.includes(':')) {
      const [key, value] = part.split(':', 2);
      if (!filters[key]) filters[key] = [];
      filters[key].push(value);
    } else if (part === 'AND' || part === 'OR' || part === 'NOT') {
      operators.push(part);
    } else {
      terms.push(part);
    }
  }

  return { terms, filters, operators };
}

export function highlightText(text: string, query: string): string {
  const words = query.split(/\s+/).filter(word => word.length > 2);
  let highlighted = text;

  for (const word of words) {
    const regex = new RegExp(`\\b(${word})\\b`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }

  return highlighted;
}
