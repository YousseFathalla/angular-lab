import { EnvironmentProviders, importProvidersFrom, Provider } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from '../../../../public/i18n/en.json';
import ar from '../../../../public/i18n/ar.json';

const testProviders: (Provider | EnvironmentProviders)[] = [
  // Use TranslocoTestingModule instead of provideTransloco() to avoid HTTP calls
  // that cause "NG0205: Injector has already been destroyed" errors
  importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en: en, ar: ar },
      translocoConfig: {
        availableLangs: ['en', 'ar'],
        defaultLang: 'en',
      },
      preloadLangs: true,
    })
  ),
  // Keep these for any other tests that need HTTP mocking
  provideHttpClient(),
  provideHttpClientTesting(),
];
export default testProviders;
