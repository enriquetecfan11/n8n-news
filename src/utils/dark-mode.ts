// Utilidades para el manejo del dark mode
export class DarkModeManager {
  private static instance: DarkModeManager;
  private isDark = false;
  private listeners: Array<(isDark: boolean) => void> = [];

  private constructor() {
    this.init();
  }

  public static getInstance(): DarkModeManager {
    if (!DarkModeManager.instance) {
      DarkModeManager.instance = new DarkModeManager();
    }
    return DarkModeManager.instance;
  }

  private init() {
    this.loadTheme();
    this.setupSystemPreferenceListener();
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Si no hay tema guardado, usar preferencia del sistema
    if (!savedTheme) {
      this.isDark = prefersDark;
    } else {
      this.isDark = savedTheme === 'dark';
    }

    this.applyTheme();
  }

  private setupSystemPreferenceListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      const savedTheme = localStorage.getItem('theme');
      
      // Solo cambiar automáticamente si no hay preferencia guardada
      if (!savedTheme) {
        this.isDark = e.matches;
        this.applyTheme();
        this.notifyListeners();
      }
    });
  }

  private applyTheme() {
    const body = document.body;
    
    if (this.isDark) {
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
    }

    // Actualizar meta theme-color
    this.updateMetaThemeColor();
  }

  private updateMetaThemeColor() {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }

    const color = this.isDark ? '#1F2937' : '#FFFFFF';
    metaThemeColor.setAttribute('content', color);
  }

  public toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
    this.saveTheme();
    this.notifyListeners();
  }

  public setTheme(isDark: boolean) {
    this.isDark = isDark;
    this.applyTheme();
    this.saveTheme();
    this.notifyListeners();
  }

  public getIsDark(): boolean {
    return this.isDark;
  }

  private saveTheme() {
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  public subscribe(listener: (isDark: boolean) => void) {
    this.listeners.push(listener);
    
    // Retornar función de unsubscribe
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isDark));
  }

  // Método para detectar si el sistema soporta dark mode
  public supportsDarkMode(): boolean {
    return window.matchMedia('(prefers-color-scheme: dark)').media !== 'not all';
  }

  // Método para obtener la preferencia del sistema
  public getSystemPreference(): 'light' | 'dark' | 'no-preference' {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (mediaQuery.matches) {
      return 'dark';
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    } else {
      return 'no-preference';
    }
  }
}

// Función de conveniencia para obtener la instancia
export const darkMode = DarkModeManager.getInstance();

// Función para inicializar el dark mode en el cliente
export function initDarkMode() {
  if (typeof window !== 'undefined') {
    darkMode.loadTheme();
  }
}

// Función para toggle del dark mode
export function toggleDarkMode() {
  if (typeof window !== 'undefined') {
    darkMode.toggleTheme();
  }
}

// Función para obtener el estado actual
export function isDarkMode(): boolean {
  if (typeof window !== 'undefined') {
    return darkMode.getIsDark();
  }
  return false;
}
