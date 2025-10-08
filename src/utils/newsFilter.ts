import type { CollectionEntry } from 'astro:content';

export interface FilterState {
  impacts: string[];
  sectors: string[];
  sentiments: string[];
  sources: string[];
  tickers: string[];
  dateRange: {
    start: string;
    end: string;
  } | null;
  searchQuery: string;
  sortBy: 'relevance' | 'date' | 'impact';
  sortOrder: 'asc' | 'desc';
}

export interface FilteredPost {
  post: CollectionEntry<'blog'>;
  relevanceScore: number;
  matchScore: number;
}

export class NewsFilter {
  private posts: CollectionEntry<'blog'>[];
  private cache: Map<string, FilteredPost[]> = new Map();
  private searchIndex: Map<string, Set<string>> = new Map();

  constructor(posts: CollectionEntry<'blog'>[]) {
    this.posts = posts;
    this.buildSearchIndex();
  }

  private buildSearchIndex() {
    // Crear índice invertido para búsqueda rápida
    for (const post of this.posts) {
      const text = `${post.data.title} ${post.data.description}`.toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 2);
      
      for (const word of words) {
        if (!this.searchIndex.has(word)) {
          this.searchIndex.set(word, new Set());
        }
        this.searchIndex.get(word)!.add(post.id);
      }
    }
  }

  private getCacheKey(filters: FilterState): string {
    return JSON.stringify(filters);
  }

  private calculateMatchScore(post: CollectionEntry<'blog'>, filters: FilterState): number {
    let score = 0;
    let totalChecks = 0;

    // Impacto
    if (filters.impacts.length > 0) {
      totalChecks++;
      if (post.data.impact && filters.impacts.includes(post.data.impact)) {
        score += 1;
      }
    }

    // Sectores
    if (filters.sectors.length > 0) {
      totalChecks++;
      if (post.data.sectors) {
        const matchingSectors = post.data.sectors.filter(sector => 
          filters.sectors.includes(sector)
        );
        score += matchingSectors.length / filters.sectors.length;
      }
    }

    // Sentimiento
    if (filters.sentiments.length > 0) {
      totalChecks++;
      if (post.data.sentiment && filters.sentiments.includes(post.data.sentiment)) {
        score += 1;
      }
    }

    // Fuentes
    if (filters.sources.length > 0) {
      totalChecks++;
      if (post.data.source && filters.sources.includes(post.data.source)) {
        score += 1;
      }
    }

    // Tickers
    if (filters.tickers.length > 0) {
      totalChecks++;
      if (post.data.tickers) {
        const matchingTickers = post.data.tickers.filter(ticker => 
          filters.tickers.includes(ticker)
        );
        score += matchingTickers.length / filters.tickers.length;
      }
    }

    // Rango de fechas
    if (filters.dateRange) {
      totalChecks++;
      const postDate = new Date(post.data.pubDate);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (postDate >= startDate && postDate <= endDate) {
        score += 1;
      }
    }

    // Búsqueda de texto
    if (filters.searchQuery.trim()) {
      totalChecks++;
      const searchTerms = filters.searchQuery.toLowerCase().split(/\s+/);
      const postText = `${post.data.title} ${post.data.description}`.toLowerCase();
      
      let searchScore = 0;
      for (const term of searchTerms) {
        if (postText.includes(term)) {
          searchScore += 1;
        }
      }
      score += searchScore / searchTerms.length;
    }

    return totalChecks > 0 ? score / totalChecks : 1;
  }

  private calculateRelevanceScore(post: CollectionEntry<'blog'>): number {
    let score = post.data.relevanceScore || 5;

    // Bonus por impacto alto
    if (post.data.impact === 'alto') {
      score += 2;
    } else if (post.data.impact === 'medio') {
      score += 1;
    }

    // Bonus por múltiples sectores
    if (post.data.sectors && post.data.sectors.length > 1) {
      score += 1;
    }

    // Bonus por múltiples tickers
    if (post.data.tickers && post.data.tickers.length > 1) {
      score += 1;
    }

    // Bonus por sentimiento extremo
    if (post.data.sentiment === 'positivo' || post.data.sentiment === 'negativo') {
      score += 1;
    }

    return Math.min(Math.max(score, 1), 10);
  }

  public filter(filters: FilterState): FilteredPost[] {
    const cacheKey = this.getCacheKey(filters);
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const results: FilteredPost[] = [];

    for (const post of this.posts) {
      const matchScore = this.calculateMatchScore(post, filters);
      const relevanceScore = this.calculateRelevanceScore(post);

      // Solo incluir posts que cumplan al menos un criterio
      if (matchScore > 0 || this.hasActiveFilters(filters)) {
        results.push({
          post,
          relevanceScore,
          matchScore
        });
      }
    }

    // Ordenar resultados
    this.sortResults(results, filters);

    // Guardar en caché
    this.cache.set(cacheKey, results);

    return results;
  }

  private hasActiveFilters(filters: FilterState): boolean {
    return (
      filters.impacts.length > 0 ||
      filters.sectors.length > 0 ||
      filters.sentiments.length > 0 ||
      filters.sources.length > 0 ||
      filters.tickers.length > 0 ||
      filters.dateRange !== null ||
      filters.searchQuery.trim() !== ''
    );
  }

  private sortResults(results: FilteredPost[], filters: FilterState) {
    results.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.relevanceScore - a.relevanceScore;
          break;
        case 'date':
          comparison = b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime();
          break;
        case 'impact':
          const impactOrder = { 'alto': 3, 'medio': 2, 'bajo': 1 };
          const aImpact = impactOrder[a.post.data.impact as keyof typeof impactOrder] || 0;
          const bImpact = impactOrder[b.post.data.impact as keyof typeof impactOrder] || 0;
          comparison = bImpact - aImpact;
          break;
        default:
          // Orden por relevancia por defecto
          comparison = b.relevanceScore - a.relevanceScore;
      }

      // Si hay empate, usar match score
      if (comparison === 0) {
        comparison = b.matchScore - a.matchScore;
      }

      // Aplicar orden
      return filters.sortOrder === 'asc' ? -comparison : comparison;
    });
  }

  public search(query: string): CollectionEntry<'blog'>[] {
    if (!query.trim()) {
      return this.posts;
    }

    const searchTerms = query.toLowerCase().split(/\s+/);
    const matchingPostIds = new Set<string>();

    for (const term of searchTerms) {
      if (this.searchIndex.has(term)) {
        const postIds = this.searchIndex.get(term)!;
        for (const postId of postIds) {
          matchingPostIds.add(postId);
        }
      }
    }

    return this.posts.filter(post => matchingPostIds.has(post.id));
  }

  public getAvailableFilters(): {
    impacts: string[];
    sectors: string[];
    sentiments: string[];
    sources: string[];
    tickers: string[];
  } {
    const impacts = new Set<string>();
    const sectors = new Set<string>();
    const sentiments = new Set<string>();
    const sources = new Set<string>();
    const tickers = new Set<string>();

    for (const post of this.posts) {
      if (post.data.impact) impacts.add(post.data.impact);
      if (post.data.sectors) {
        for (const sector of post.data.sectors) {
          sectors.add(sector);
        }
      }
      if (post.data.sentiment) sentiments.add(post.data.sentiment);
      if (post.data.source) sources.add(post.data.source);
      if (post.data.tickers) {
        for (const ticker of post.data.tickers) {
          tickers.add(ticker);
        }
      }
    }

    return {
      impacts: Array.from(impacts).sort(),
      sectors: Array.from(sectors).sort(),
      sentiments: Array.from(sentiments).sort(),
      sources: Array.from(sources).sort(),
      tickers: Array.from(tickers).sort()
    };
  }

  public getFilterStats(filters: FilterState): {
    total: number;
    filtered: number;
    byImpact: Record<string, number>;
    bySector: Record<string, number>;
    bySentiment: Record<string, number>;
  } {
    const results = this.filter(filters);
    
    const stats = {
      total: this.posts.length,
      filtered: results.length,
      byImpact: {} as Record<string, number>,
      bySector: {} as Record<string, number>,
      bySentiment: {} as Record<string, number>
    };

    for (const result of results) {
      const post = result.post;
      
      // Impacto
      if (post.data.impact) {
        stats.byImpact[post.data.impact] = (stats.byImpact[post.data.impact] || 0) + 1;
      }

      // Sectores
      if (post.data.sectors) {
        for (const sector of post.data.sectors) {
          stats.bySector[sector] = (stats.bySector[sector] || 0) + 1;
        }
      }

      // Sentimiento
      if (post.data.sentiment) {
        stats.bySentiment[post.data.sentiment] = (stats.bySentiment[post.data.sentiment] || 0) + 1;
      }
    }

    return stats;
  }

  public clearCache() {
    this.cache.clear();
  }

  public getRelatedPosts(postId: string, limit: number = 5): CollectionEntry<'blog'>[] {
    const targetPost = this.posts.find(p => p.id === postId);
    if (!targetPost) return [];

    const relatedPosts = this.posts
      .filter(p => p.id !== postId)
      .map(post => ({
        post,
        similarity: this.calculateSimilarity(targetPost, post)
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => item.post);

    return relatedPosts;
  }

  private calculateSimilarity(post1: CollectionEntry<'blog'>, post2: CollectionEntry<'blog'>): number {
    let similarity = 0;
    let totalChecks = 0;

    // Sectores comunes
    if (post1.data.sectors && post2.data.sectors) {
      totalChecks++;
      const commonSectors = post1.data.sectors.filter(sector => 
        post2.data.sectors!.includes(sector)
      );
      similarity += commonSectors.length / Math.max(post1.data.sectors.length, post2.data.sectors.length);
    }

    // Tickers comunes
    if (post1.data.tickers && post2.data.tickers) {
      totalChecks++;
      const commonTickers = post1.data.tickers.filter(ticker => 
        post2.data.tickers!.includes(ticker)
      );
      similarity += commonTickers.length / Math.max(post1.data.tickers.length, post2.data.tickers.length);
    }

    // Mismo impacto
    if (post1.data.impact && post2.data.impact) {
      totalChecks++;
      if (post1.data.impact === post2.data.impact) {
        similarity += 1;
      }
    }

    // Mismo sentimiento
    if (post1.data.sentiment && post2.data.sentiment) {
      totalChecks++;
      if (post1.data.sentiment === post2.data.sentiment) {
        similarity += 1;
      }
    }

    // Misma fuente
    if (post1.data.source && post2.data.source) {
      totalChecks++;
      if (post1.data.source === post2.data.source) {
        similarity += 0.5;
      }
    }

    return totalChecks > 0 ? similarity / totalChecks : 0;
  }
}

// Funciones de utilidad para trabajar con filtros
export function createDefaultFilters(): FilterState {
  return {
    impacts: [],
    sectors: [],
    sentiments: [],
    sources: [],
    tickers: [],
    dateRange: null,
    searchQuery: '',
    sortBy: 'relevance',
    sortOrder: 'desc'
  };
}

export function filtersToUrlParams(filters: FilterState): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.impacts.length > 0) {
    params.set('impacts', filters.impacts.join(','));
  }
  if (filters.sectors.length > 0) {
    params.set('sectors', filters.sectors.join(','));
  }
  if (filters.sentiments.length > 0) {
    params.set('sentiments', filters.sentiments.join(','));
  }
  if (filters.sources.length > 0) {
    params.set('sources', filters.sources.join(','));
  }
  if (filters.tickers.length > 0) {
    params.set('tickers', filters.tickers.join(','));
  }
  if (filters.dateRange) {
    params.set('dateStart', filters.dateRange.start);
    params.set('dateEnd', filters.dateRange.end);
  }
  if (filters.searchQuery.trim()) {
    params.set('search', filters.searchQuery);
  }
  if (filters.sortBy !== 'relevance') {
    params.set('sortBy', filters.sortBy);
  }
  if (filters.sortOrder !== 'desc') {
    params.set('sortOrder', filters.sortOrder);
  }
  
  return params;
}

export function urlParamsToFilters(params: URLSearchParams): FilterState {
  const filters = createDefaultFilters();
  
  const impacts = params.get('impacts');
  if (impacts) {
    filters.impacts = impacts.split(',').filter(Boolean);
  }
  
  const sectors = params.get('sectors');
  if (sectors) {
    filters.sectors = sectors.split(',').filter(Boolean);
  }
  
  const sentiments = params.get('sentiments');
  if (sentiments) {
    filters.sentiments = sentiments.split(',').filter(Boolean);
  }
  
  const sources = params.get('sources');
  if (sources) {
    filters.sources = sources.split(',').filter(Boolean);
  }
  
  const tickers = params.get('tickers');
  if (tickers) {
    filters.tickers = tickers.split(',').filter(Boolean);
  }
  
  const dateStart = params.get('dateStart');
  const dateEnd = params.get('dateEnd');
  if (dateStart && dateEnd) {
    filters.dateRange = { start: dateStart, end: dateEnd };
  }
  
  const search = params.get('search');
  if (search) {
    filters.searchQuery = search;
  }
  
  const sortBy = params.get('sortBy');
  if (sortBy && ['relevance', 'date', 'impact'].includes(sortBy)) {
    filters.sortBy = sortBy as 'relevance' | 'date' | 'impact';
  }
  
  const sortOrder = params.get('sortOrder');
  if (sortOrder && ['asc', 'desc'].includes(sortOrder)) {
    filters.sortOrder = sortOrder as 'asc' | 'desc';
  }
  
  return filters;
}

export function getFilterDisplayName(filterType: string, value: string): string {
  const displayNames: Record<string, Record<string, string>> = {
    impact: {
      'alto': 'Alto Impacto',
      'medio': 'Medio Impacto',
      'bajo': 'Bajo Impacto'
    },
    sentiment: {
      'positivo': 'Sentimiento Positivo',
      'neutral': 'Sentimiento Neutral',
      'negativo': 'Sentimiento Negativo'
    },
    sectors: {
      'tecnología': 'Tecnología',
      'finanzas': 'Finanzas',
      'energía': 'Energía',
      'salud': 'Salud',
      'consumo': 'Consumo',
      'política': 'Política',
      'economía': 'Economía',
      'automotriz': 'Automotriz',
      'comercio': 'Comercio'
    }
  };

  return displayNames[filterType]?.[value] || value;
}
