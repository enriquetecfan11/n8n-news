#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Configuración de sectores y sus palabras clave
const SECTOR_KEYWORDS = {
  'tecnología': ['microsoft', 'meta', 'google', 'apple', 'nvidia', 'tesla', 'intel', 'tech', 'software', 'hardware', 'ai', 'inteligencia artificial'],
  'finanzas': ['banco', 'bank', 'fed', 'reserva federal', 'inflación', 'inflation', 'tipo de interés', 'interest rate', 'financiero', 'financial'],
  'energía': ['petróleo', 'oil', 'gas', 'energía', 'energy', 'opec', 'crude', 'petrolero'],
  'salud': ['salud', 'health', 'médico', 'medical', 'farmacéutico', 'pharmaceutical', 'vacuna', 'vaccine'],
  'consumo': ['retail', 'consumo', 'consumer', 'ventas', 'sales', 'marca', 'brand'],
  'política': ['trump', 'elección', 'election', 'gobierno', 'government', 'política', 'political', 'congreso', 'congress'],
  'economía': ['pib', 'gdp', 'economía', 'economy', 'recesión', 'recession', 'crecimiento', 'growth', 'empleo', 'employment'],
  'automotriz': ['auto', 'car', 'automotriz', 'automotive', 'ford', 'gm', 'general motors', 'vehículo', 'vehicle'],
  'comercio': ['comercio', 'trade', 'arancel', 'tariff', 'exportación', 'export', 'importación', 'import']
};

// Palabras clave para detectar impacto
const IMPACT_KEYWORDS = {
  'alto': ['fed', 'banco central', 'central bank', 'inflación', 'inflation', 'recesión', 'recession', 'crisis', 'crisis', 'trump', 'elección', 'election', 'guerra', 'war', 'pandemia', 'pandemic'],
  'medio': ['resultados', 'earnings', 'merger', 'adquisición', 'acquisition', 'alianza', 'alliance', 'acuerdo', 'agreement'],
  'bajo': ['análisis', 'analysis', 'opinión', 'opinion', 'tendencia', 'trend', 'predicción', 'prediction']
};

// Palabras clave para detectar sentimiento
const SENTIMENT_KEYWORDS = {
  'positivo': ['sube', 'crece', 'gana', 'mejora', 'aumenta', 'positivo', 'optimista', 'win', 'wins', 'gana', 'ganan', 'rise', 'growth', 'beat', 'strong', 'bullish'],
  'negativo': ['baja', 'cae', 'pierde', 'empeora', 'disminuye', 'negativo', 'pesimista', 'struggled', 'luchó', 'tumult', 'inestabilidad', 'fall', 'drop', 'decline', 'weak', 'bearish', 'crisis']
};

// Tickers conocidos para extracción
const KNOWN_TICKERS = [
  'MSFT', 'META', 'GOOGL', 'AAPL', 'NVDA', 'TSLA', 'INTC', 'AMZN', 'NFLX', 'AMD',
  'SPY', 'QQQ', 'DIA', 'VIX', 'BTC', 'ETH', 'EUR', 'USD', 'GBP', 'JPY',
  'F', 'GM', 'BAC', 'JPM', 'WFC', 'C', 'GS', 'MS', 'BLK', 'AXP'
];

// Fuentes conocidas
const KNOWN_SOURCES = [
  'Investing.com', 'Bloomberg', 'Reuters', 'CNBC', 'Financial Times', 
  'Wall Street Journal', 'MarketWatch', 'Yahoo Finance', 'Seeking Alpha'
];

interface BlogMetadata {
  impact: 'alto' | 'medio' | 'bajo';
  sectors: string[];
  source: string;
  sentiment: 'positivo' | 'neutral' | 'negativo';
  relevanceScore: number;
  tickers: string[];
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  pubDate: string;
  currentMetadata?: any;
}

class BlogMetadataAnalyzer {
  private posts: BlogPost[] = [];
  private results: Array<{ id: string; metadata: BlogMetadata; confidence: number }> = [];

  constructor() {
    this.loadPosts();
  }

  private loadPosts() {
    const blogDir = path.join(process.cwd(), 'src/content/blog');
    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));

    for (const file of files) {
      const filePath = path.join(blogDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(fileContent);
      
      this.posts.push({
        id: file.replace('.md', ''),
        title: data.title || '',
        content: content,
        pubDate: data.pubDate || '',
        currentMetadata: data
      });
    }

    console.log(`📚 Cargados ${this.posts.length} posts del blog`);
  }

  private extractTickers(text: string): string[] {
    const foundTickers: string[] = [];
    const upperText = text.toUpperCase();
    
    for (const ticker of KNOWN_TICKERS) {
      if (upperText.includes(ticker)) {
        foundTickers.push(ticker);
      }
    }

    // Buscar patrones como "NASDAQ:MSFT" o "NYSE:AAPL"
    const exchangePattern = /(NASDAQ|NYSE|AMEX):([A-Z]{1,5})/g;
    let match;
    while ((match = exchangePattern.exec(upperText)) !== null) {
      foundTickers.push(match[2]);
    }

    return [...new Set(foundTickers)]; // Eliminar duplicados
  }

  private detectSectors(text: string): string[] {
    const foundSectors: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          foundSectors.push(sector);
          break; // Solo añadir el sector una vez
        }
      }
    }

    return [...new Set(foundSectors)];
  }

  private detectImpact(text: string): 'alto' | 'medio' | 'bajo' {
    const lowerText = text.toLowerCase();
    let maxScore = 0;
    let detectedImpact: 'alto' | 'medio' | 'bajo' = 'bajo';

    for (const [impact, keywords] of Object.entries(IMPACT_KEYWORDS)) {
      let score = 0;
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score++;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        detectedImpact = impact as 'alto' | 'medio' | 'bajo';
      }
    }

    return detectedImpact;
  }

  private detectSentiment(text: string): 'positivo' | 'neutral' | 'negativo' {
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;

    for (const keyword of SENTIMENT_KEYWORDS.positivo) {
      if (lowerText.includes(keyword.toLowerCase())) {
        positiveScore++;
      }
    }

    for (const keyword of SENTIMENT_KEYWORDS.negativo) {
      if (lowerText.includes(keyword.toLowerCase())) {
        negativeScore++;
      }
    }

    if (positiveScore > negativeScore) return 'positivo';
    if (negativeScore > positiveScore) return 'negativo';
    return 'neutral';
  }

  private detectSource(text: string): string {
    const lowerText = text.toLowerCase();
    
    for (const source of KNOWN_SOURCES) {
      if (lowerText.includes(source.toLowerCase())) {
        return source;
      }
    }

    // Buscar patrones de URL
    const urlPattern = /https?:\/\/(?:www\.)?([^\/]+)/g;
    const matches = text.match(urlPattern);
    if (matches) {
      for (const url of matches) {
        const domain = url.replace(/https?:\/\/(?:www\.)?/, '').split('/')[0];
        if (domain.includes('investing.com')) return 'Investing.com';
        if (domain.includes('bloomberg.com')) return 'Bloomberg';
        if (domain.includes('reuters.com')) return 'Reuters';
        if (domain.includes('cnbc.com')) return 'CNBC';
        if (domain.includes('ft.com')) return 'Financial Times';
        if (domain.includes('wsj.com')) return 'Wall Street Journal';
      }
    }

    return 'Fuente desconocida';
  }

  private calculateRelevanceScore(
    impact: string,
    sectors: string[],
    tickers: string[],
    sentiment: string
  ): number {
    let score = 5; // Base score

    // Impacto
    if (impact === 'alto') score += 3;
    else if (impact === 'medio') score += 1;

    // Sectores (más sectores = más relevante)
    score += Math.min(sectors.length, 2);

    // Tickers (más tickers = más relevante)
    score += Math.min(tickers.length, 2);

    // Sentimiento extremo
    if (sentiment === 'positivo' || sentiment === 'negativo') score += 1;

    return Math.min(Math.max(score, 1), 10);
  }

  private calculateConfidence(metadata: BlogMetadata): number {
    let confidence = 0;
    let totalChecks = 0;

    // Verificar si se detectaron sectores
    if (metadata.sectors.length > 0) {
      confidence += 20;
      totalChecks++;
    }

    // Verificar si se detectaron tickers
    if (metadata.tickers.length > 0) {
      confidence += 20;
      totalChecks++;
    }

    // Verificar si se detectó fuente
    if (metadata.source !== 'Fuente desconocida') {
      confidence += 15;
      totalChecks++;
    }

    // Verificar si el impacto no es el por defecto
    if (metadata.impact !== 'bajo') {
      confidence += 15;
      totalChecks++;
    }

    // Verificar si el sentimiento no es neutral
    if (metadata.sentiment !== 'neutral') {
      confidence += 10;
      totalChecks++;
    }

    // Bonus por relevancia alta
    if (metadata.relevanceScore >= 8) {
      confidence += 20;
    }

    return Math.min(confidence, 100);
  }

  public analyzeAllPosts() {
    console.log('🔍 Analizando posts...\n');

    for (const post of this.posts) {
      const fullText = `${post.title} ${post.content}`;
      
      const metadata: BlogMetadata = {
        impact: this.detectImpact(fullText),
        sectors: this.detectSectors(fullText),
        source: this.detectSource(fullText),
        sentiment: this.detectSentiment(fullText),
        relevanceScore: 0, // Se calculará después
        tickers: this.extractTickers(fullText)
      };

      metadata.relevanceScore = this.calculateRelevanceScore(
        metadata.impact,
        metadata.sectors,
        metadata.tickers,
        metadata.sentiment
      );

      const confidence = this.calculateConfidence(metadata);

      this.results.push({
        id: post.id,
        metadata,
        confidence
      });

      console.log(`✅ ${post.id}`);
      console.log(`   Impacto: ${metadata.impact} | Sectores: ${metadata.sectors.join(', ') || 'Ninguno'}`);
      console.log(`   Tickers: ${metadata.tickers.join(', ') || 'Ninguno'} | Sentimiento: ${metadata.sentiment}`);
      console.log(`   Fuente: ${metadata.source} | Relevancia: ${metadata.relevanceScore}/10 | Confianza: ${confidence}%\n`);
    }
  }

  public updateBlogFiles() {
    console.log('📝 Actualizando archivos del blog...\n');

    for (const result of this.results) {
      const filePath = path.join(process.cwd(), 'src/content/blog', `${result.id}.md`);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        // Añadir metadatos
        data.impact = result.metadata.impact;
        data.sectors = result.metadata.sectors;
        data.source = result.metadata.source;
        data.sentiment = result.metadata.sentiment;
        data.relevanceScore = result.metadata.relevanceScore;
        data.tickers = result.metadata.tickers;

        // Crear nuevo contenido
        const newContent = matter.stringify(content, data);
        
        // Crear backup
        const backupPath = filePath + '.backup';
        fs.writeFileSync(backupPath, fileContent);
        
        // Escribir nuevo contenido
        fs.writeFileSync(filePath, newContent);
        
        console.log(`✅ Actualizado: ${result.id}.md (confianza: ${result.confidence}%)`);
      } catch (error) {
        console.error(`❌ Error actualizando ${result.id}.md:`, error);
      }
    }
  }

  public generateReport() {
    console.log('\n📊 REPORTE DE ANÁLISIS\n');
    console.log('='.repeat(50));

    // Estadísticas generales
    const totalPosts = this.results.length;
    const highConfidence = this.results.filter(r => r.confidence >= 70).length;
    const mediumConfidence = this.results.filter(r => r.confidence >= 40 && r.confidence < 70).length;
    const lowConfidence = this.results.filter(r => r.confidence < 40).length;

    console.log(`📈 Total de posts analizados: ${totalPosts}`);
    console.log(`🟢 Alta confianza (≥70%): ${highConfidence} (${Math.round(highConfidence/totalPosts*100)}%)`);
    console.log(`🟡 Media confianza (40-69%): ${mediumConfidence} (${Math.round(mediumConfidence/totalPosts*100)}%)`);
    console.log(`🔴 Baja confianza (<40%): ${lowConfidence} (${Math.round(lowConfidence/totalPosts*100)}%)`);

    // Distribución por impacto
    console.log('\n📊 Distribución por Impacto:');
    const impactCounts = this.results.reduce((acc, r) => {
      acc[r.metadata.impact] = (acc[r.metadata.impact] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    for (const [impact, count] of Object.entries(impactCounts)) {
      console.log(`   ${impact}: ${count} posts`);
    }

    // Distribución por sectores
    console.log('\n📊 Sectores más frecuentes:');
    const sectorCounts = this.results.reduce((acc, r) => {
      for (const sector of r.metadata.sectors) {
        acc[sector] = (acc[sector] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const sortedSectors = Object.entries(sectorCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    for (const [sector, count] of sortedSectors) {
      console.log(`   ${sector}: ${count} posts`);
    }

    // Tickers más frecuentes
    console.log('\n📊 Tickers más frecuentes:');
    const tickerCounts = this.results.reduce((acc, r) => {
      for (const ticker of r.metadata.tickers) {
        acc[ticker] = (acc[ticker] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    const sortedTickers = Object.entries(tickerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    for (const [ticker, count] of sortedTickers) {
      console.log(`   ${ticker}: ${count} posts`);
    }

    // Posts con baja confianza
    const lowConfidencePosts = this.results.filter(r => r.confidence < 40);
    if (lowConfidencePosts.length > 0) {
      console.log('\n⚠️  Posts que requieren revisión manual:');
      for (const post of lowConfidencePosts) {
        console.log(`   ${post.id} (confianza: ${post.confidence}%)`);
      }
    }

    console.log('\n✅ Análisis completado. Los archivos han sido actualizados.');
    console.log('💡 Revisa los posts con baja confianza y ajusta manualmente si es necesario.');
  }
}

// Ejecutar el análisis
async function main() {
  console.log('🚀 Iniciando análisis de metadatos del blog...\n');
  
  const analyzer = new BlogMetadataAnalyzer();
  analyzer.analyzeAllPosts();
  analyzer.updateBlogFiles();
  analyzer.generateReport();
}

main().catch(console.error);
