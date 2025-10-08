// Datos mock para scoring de impacto de noticias
export interface NewsImpact {
  [newsId: string]: {
    impact: 'alto' | 'medio' | 'bajo';
    relevanceScore: number; // 1-10
    sectors: string[];
    sentiment: 'positivo' | 'neutral' | 'negativo';
    source: string;
    tickers: string[];
    marketReaction: {
      expected: 'alcista' | 'bajista' | 'neutral';
      confidence: number; // 0-100
    };
  };
}

export const mockNewsImpact: NewsImpact = {
  '2025-04-29-todos-atentos-a-microsoft-y-meta-aproveche-al-maximo-esta-estrategia': {
    impact: 'alto',
    relevanceScore: 9,
    sectors: ['tecnología', 'finanzas'],
    sentiment: 'positivo',
    source: 'Investing.com',
    tickers: ['MSFT', 'META'],
    marketReaction: {
      expected: 'alcista',
      confidence: 85
    }
  },
  '2025-04-29-que-nos-dira-manana-el-pib-de-eeuu-recesion-ojo-a-este-experto': {
    impact: 'alto',
    relevanceScore: 8,
    sectors: ['finanzas', 'economía'],
    sentiment: 'neutral',
    source: 'Financial Times',
    tickers: ['SPY', 'QQQ', 'DIA'],
    marketReaction: {
      expected: 'neutral',
      confidence: 70
    }
  },
  '2025-04-29-mark-carneys-liberals-win-pivotal-canadian-election': {
    impact: 'medio',
    relevanceScore: 6,
    sectors: ['política', 'finanzas'],
    sentiment: 'positivo',
    source: 'Reuters',
    tickers: ['EWC', 'CAD=X'],
    marketReaction: {
      expected: 'alcista',
      confidence: 60
    }
  },
  '2025-04-29-top-trump-adviser-struggled-to-soothe-investors-in-talks-after-market-tumult': {
    impact: 'alto',
    relevanceScore: 7,
    sectors: ['política', 'finanzas'],
    sentiment: 'negativo',
    source: 'Bloomberg',
    tickers: ['SPY', 'VIX'],
    marketReaction: {
      expected: 'bajista',
      confidence: 75
    }
  },
  '2025-04-29-trump-to-sign-order-later-tuesday-easing-auto-tariff-impact': {
    impact: 'medio',
    relevanceScore: 5,
    sectors: ['automotriz', 'comercio'],
    sentiment: 'positivo',
    source: 'CNBC',
    tickers: ['F', 'GM', 'TSLA'],
    marketReaction: {
      expected: 'alcista',
      confidence: 55
    }
  }
};

// Función para obtener datos de impacto por ID de noticia
export function getNewsImpact(newsId: string): NewsImpact[string] | null {
  return mockNewsImpact[newsId] || null;
}

// Función para obtener todas las noticias por nivel de impacto
export function getNewsByImpact(impact: 'alto' | 'medio' | 'bajo'): string[] {
  return Object.keys(mockNewsImpact).filter(id => 
    mockNewsImpact[id].impact === impact
  );
}

// Función para obtener noticias por sector
export function getNewsBySector(sector: string): string[] {
  return Object.keys(mockNewsImpact).filter(id => 
    mockNewsImpact[id].sectors.includes(sector)
  );
}

// Función para obtener top noticias por relevancia
export function getTopNewsByRelevance(limit: number = 5): string[] {
  return Object.keys(mockNewsImpact)
    .sort((a, b) => mockNewsImpact[b].relevanceScore - mockNewsImpact[a].relevanceScore)
    .slice(0, limit);
}
