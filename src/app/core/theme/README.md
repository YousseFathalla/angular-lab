# Dark/Light Theme Feature (M3 + Signals)

A modern, Signal-based theme switching system optimized for Angular Material 3.

## 📦 Requirements
- Angular Material 3

## 🛠 Setup

1. Copy the `features/theme/` folder to your `app/core/services/` (or similar).
2. Include the SCSS setup in your `styles.scss`:
   ```scss
   @use 'path-to-feature/theme-setup' as theme-setup;
   
   html {
     color-scheme: light dark;
     @include theme-setup.apply-theme();
   }
   ```
3. (Optional) Inject `ThemeService` in your root component to toggle:
   ```typescript
   themeService = inject(ThemeService);
   toggle() { this.themeService.toggleTheme(); }
   ```

## 💡 What's inside?
- **Signal-based:** Reactive theme state that updates the UI instantly.
- **Persistence:** Automatically saves user preference to `localStorage`.
- **System Preference:** Respects the user's OS dark mode setting out of the box.
- **M3 Integration:** Pre-configured to work with `color-scheme: light dark`.
