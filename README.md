# Angular Lab 🧪

Welcome to the **Angular Lab**, a dedicated space for experimenting with, documenting, and refining modern Angular patterns and enterprise-grade setups. This project serves as a "Gold Standard" reference for new applications.

## 🚀 Key Pillars

### 1. Modern Testing Suite (Vitest)

Gone are the days of heavy Karma/Jasmine setups. This lab features a native **Vitest** integration for high-performance unit testing.

* **Location:** `src/app/setups/vitest/`
* **Features:** JSDOM environment, TypeScript path alias support, and lightning-fast execution.

### 2. Advanced Theming (Signals-based)

A robust, persistent Dark/Light theme implementation using Angular Signals and the `color-scheme` CSS property.

* **Service:** `ThemeService` handles system preferences and `localStorage` persistence.
* **Integration:** Designed to work seamlessly with Angular Material 3's `light-dark()` tokens.

### 3. Enterprise Architecture

The project follows a modular, scalable structure:

* **`core/`**: App-wide singletons (Theme, I18n, Logging).
* **`shared/`**: Highly reusable stateless components, directives, and pipes.
* **`features/`**: Domain-specific logic and UI.
* **`setups/`**: A dedicated "Knowledge Base" directory containing standalone configurations (ESLint, Vitest) ready to be exported to documentation tools like Notion.

### 4. Reusable Assets

Collection of battle-tested components extracted from production environments:

* **Smart Table (`shared/components/reusable-table`)**: A generic Material-based table with server-side pagination, sorting, and Excel export.
* **Pagination Service**: Abstracted Firestore/API pagination logic leveraging Signals.
* **Excel Service**: Lazy-loaded `xlsx` integration for performance.

## 🛠️ Tech Stack

* **Framework:** Angular 21+ (Signals, `inject()`, modern control flow).
* **Styling:** SCSS + Angular Material 3.
* **Testing:** Vitest + JSDOM.
* **Linting:** ESLint (flat config) + `angular-eslint`.
* **Internationalization:** Transloco (`core/i18n`).

## 📖 How to Use This Lab

1. **Reference Setups:** Check the `src/app/setups/` directory for copy-pasteable configurations for your next project.
2. **Reusable Components:** Import assets from `shared/` into your own workspace. Note that they often use `@shared` and `@core` path aliases.
3. **Learn Patterns:** Explore `core/theme` for a modern take on state management using Signals.

---
*Created with ❤️ to prevent re-inventing the wheel.*
