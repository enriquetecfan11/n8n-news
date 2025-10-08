// Datos mock para sentimiento del mercado
export interface MarketSentiment {
  overall: 'positivo' | 'neutral' | 'negativo';
  score: number; // -100 a 100
  sectors: {
    [sector: string]: {
      sentiment: 'positivo' | 'neutral' | 'negativo';
      score: number;
      change: number; // cambio porcentual
    };
  };
  volatility: 'alta' | 'media' | 'baja';
  fearGreedIndex: number; // 0-100
}

export const mockMarketSentiment: MarketSentiment = {
  overall: 'positivo',
  score: 65,
  sectors: {
    'tecnología': {
      sentiment: 'positivo',
      score: 75,
      change: 2.3
    },
    'finanzas': {
      sentiment: 'neutral',
      score: 50,
      change: 0.1
    },
    'energía': {
      sentiment: 'negativo',
      score: 25,
      change: -1.8
    },
    'salud': {
      sentiment: 'positivo',
      score: 60,
      change: 1.2
    },
    'consumo': {
      sentiment: 'neutral',
      score: 45,
      change: -0.3
    }
  },
  volatility: 'media',
  fearGreedIndex: 65
};

// Función para obtener sentimiento por sector
export function getSectorSentiment(sector: string): MarketSentiment['sectors'][string] | null {
  return mockMarketSentiment.sectors[sector] || null;
}

// Función para obtener sentimiento general
export function getOverallSentiment(): MarketSentiment {
  return mockMarketSentiment;
}
