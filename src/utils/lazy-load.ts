// Utilidades de lazy loading con Intersection Observer
export interface LazyLoadOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  once?: boolean;
  onLoad?: (element: Element) => void;
  onError?: (element: Element, error: Error) => void;
}

export class LazyLoader {
  private observer: IntersectionObserver | null = null;
  private options: LazyLoadOptions;
  private loadedElements = new Set<Element>();

  constructor(options: LazyLoadOptions = {}) {
    this.options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      once: true,
      ...options
    };
  }

  public init() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      // Fallback para navegadores sin soporte
      this.loadAllElements();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    this.observeElements();
  }

  public observe(element: Element) {
    if (this.observer && !this.loadedElements.has(element)) {
      this.observer.observe(element);
    }
  }

  public unobserve(element: Element) {
    if (this.observer) {
      this.observer.unobserve(element);
    }
  }

  public destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private observeElements() {
    const elements = document.querySelectorAll('[data-lazy]');
    elements.forEach(element => this.observe(element));
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadElement(entry.target);
        
        if (this.options.once) {
          this.unobserve(entry.target);
        }
      }
    });
  }

  private loadElement(element: Element) {
    if (this.loadedElements.has(element)) {
      return;
    }

    try {
      this.loadImage(element);
      this.loadContent(element);
      this.loadedElements.add(element);
      
      if (this.options.onLoad) {
        this.options.onLoad(element);
      }
    } catch (error) {
      if (this.options.onError) {
        this.options.onError(element, error as Error);
      }
    }
  }

  private loadImage(element: Element) {
    const img = element.querySelector('img[data-src]') as HTMLImageElement;
    if (!img) return;

    const src = img.dataset.src;
    if (!src) return;

    // Crear nueva imagen para preload
    const newImg = new Image();
    
    newImg.onload = () => {
      img.src = src;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      
      // Remover atributos de lazy loading
      img.removeAttribute('data-src');
      img.removeAttribute('loading');
    };

    newImg.onerror = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      
      // Mostrar imagen de placeholder o error
      img.src = '/images/placeholder-error.svg';
    };

    img.classList.add('lazy-loading');
    newImg.src = src;
  }

  private loadContent(element: Element) {
    const content = element.querySelector('[data-lazy-content]');
    if (!content) return;

    const contentSrc = content.getAttribute('data-lazy-content');
    if (!contentSrc) return;

    // Cargar contenido dinámico
    fetch(contentSrc)
      .then(response => response.text())
      .then(html => {
        content.innerHTML = html;
        content.classList.remove('lazy-loading');
        content.classList.add('lazy-loaded');
        content.removeAttribute('data-lazy-content');
      })
      .catch(error => {
        content.classList.remove('lazy-loading');
        content.classList.add('lazy-error');
        console.error('Error loading lazy content:', error);
      });
  }

  private loadAllElements() {
    // Fallback: cargar todos los elementos inmediatamente
    const elements = document.querySelectorAll('[data-lazy]');
    elements.forEach(element => this.loadElement(element));
  }
}

// Función de conveniencia para inicializar lazy loading
export function initLazyLoading(options?: LazyLoadOptions): LazyLoader {
  const loader = new LazyLoader(options);
  loader.init();
  return loader;
}

// Función para lazy load de imágenes específicas
export function lazyLoadImage(img: HTMLImageElement, options?: LazyLoadOptions) {
  if (!img.dataset.src) return;

  const loader = new LazyLoader({
    ...options,
    once: true
  });

  loader.observe(img);
}

// Función para lazy load de contenido específico
export function lazyLoadContent(element: Element, options?: LazyLoadOptions) {
  if (!element.hasAttribute('data-lazy')) return;

  const loader = new LazyLoader({
    ...options,
    once: true
  });

  loader.observe(element);
}

// Función para precargar imágenes críticas
export function preloadCriticalImages(selectors: string[]) {
  if (typeof window === 'undefined') return;

  selectors.forEach(selector => {
    const img = document.querySelector(selector) as HTMLImageElement;
    if (img && img.src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src;
      document.head.appendChild(link);
    }
  });
}

// Función para optimizar imágenes con WebP
export function optimizeImageFormat(img: HTMLImageElement) {
  if (!img.src) return;

  // Verificar soporte de WebP
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = 1;
  canvas.height = 1;
  
  const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  if (webpSupported && !img.src.includes('.webp')) {
    // Intentar cargar versión WebP
    const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    const webpImg = new Image();
    
    webpImg.onload = () => {
      img.src = webpSrc;
    };
    
    webpImg.onerror = () => {
      // Mantener formato original si WebP falla
    };
    
    webpImg.src = webpSrc;
  }
}

// Función para generar srcset responsive
export function generateResponsiveSrcset(baseSrc: string, sizes: number[]): string {
  return sizes
    .map(size => `${baseSrc}?w=${size} ${size}w`)
    .join(', ');
}

// Función para detectar conexión lenta
export function isSlowConnection(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;
  
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' || 
         connection.saveData === true;
}

// Función para ajustar calidad de imagen basada en conexión
export function adjustImageQuality(img: HTMLImageElement) {
  if (isSlowConnection()) {
    // Reducir calidad para conexiones lentas
    const url = new URL(img.src);
    url.searchParams.set('q', '60');
    img.src = url.toString();
  }
}

// Inicialización automática
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initLazyLoading({
      rootMargin: '50px',
      threshold: 0.1,
      once: true
    });
  });
}
