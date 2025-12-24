import { Direction } from '@angular/cdk/bidi';
import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { SupportedLanguage } from "../transloco.config";

@Injectable({ providedIn: 'root' })
export class LangService {
  private readonly transloco = inject(TranslocoService);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly currentLang = signal<SupportedLanguage>('en');
  readonly direction = signal<Direction>('ltr');

  constructor() {
    this.initLanguage();

    effect(() => {
      const lang = this.currentLang();
      const dir = lang === 'ar' ? 'rtl' : 'ltr';

      this.direction.set(dir);
      this.transloco.setActiveLang(lang);
      this.updateDocumentDirection(dir);
      this.updateDocumentLanguage(lang);

      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('lang', lang);
      }
    });
  }

  private initLanguage() {
    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang') as SupportedLanguage;
      if (savedLang && ['en', 'ar', 'hi'].includes(savedLang)) {
        this.currentLang.set(savedLang);
      } else {
        this.currentLang.set('en');
      }
    }
  }

  setLanguage(lang: SupportedLanguage) {
    this.currentLang.set(lang);
  }

  private updateDocumentDirection(dir: Direction) {
    this.document.documentElement.dir = dir;
    this.document.body.dir = dir;
  }

  private updateDocumentLanguage(lang: string) {
    this.document.documentElement.lang = lang;
  }
}
