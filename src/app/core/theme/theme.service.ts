import { Injectable, signal, effect, inject, RendererFactory2 } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  // Initialize from localStorage or System Preference
  private readonly darkMode = signal<boolean>(
    localStorage.getItem('user-theme') === 'dark' ||
      (!localStorage.getItem('user-theme') &&
        typeof globalThis.matchMedia === 'function' &&
        globalThis.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  readonly isDarkMode = this.darkMode.asReadonly();
  constructor() {
    // Effect to handle the actual switching
    effect(() => {
      const isDark = this.darkMode();

      // The "Magic": We just update the style property on the document element
      // This triggers all mat.theme() tokens defined with light-dark()
      this.renderer.setStyle(document.documentElement, 'color-scheme', isDark ? 'dark' : 'light');

      // Persist choice
      localStorage.setItem('user-theme', isDark ? 'dark' : 'light');
    });
  }

  toggleTheme() {
    this.darkMode.update((v) => !v);
  }
}
