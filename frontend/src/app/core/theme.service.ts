import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'athleteiq-theme';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.readInitial());
  readonly theme = this._theme.asReadonly();

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem(STORAGE_KEY, theme);
    });
  }

  toggle() {
    this._theme.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  private readInitial(): Theme {
    if (typeof localStorage === 'undefined') return 'light';
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  }
}
