# Reusable Angular Assets

This directory contains a collection of highly reusable Angular components, services, and pipes extracted from the Tashil Dashboard project. These assets are designed to be modular and easy to integrate into other Angular applications.

## Contents

### 1. Smart Table (`components/reusable-table`)

A powerful, generic data table component built on top of Angular Material Table.

* **Features:**
  * Server-side pagination and sorting.
  * Built-in filtering and search.
  * Excel export integration.
  * Responsive design.
  * Signal-based state management.
* **Dependencies:**
  * `@angular/material`
  * `PaginationService`
  * `ExcelExportService`
  * `LoggerService`

### 2. Pagination Service (`services/pagination`)

A generic service for handling Firestore pagination.

* **Features:**
  * Abstracts complexity of Firestore cursors.
  * Supports `next`, `prev`, `first`, and `last` page navigation.
  * Optimized "last page" fetching using reverse queries.
  * Signal-based state (loading, error, data).
* **Dependencies:**
  * `@angular/fire/firestore`
  * `runInInjection-factory` utility

### 3. Timestamp Pipe (`pipes/timestamp`)

A pipe to transform Firestore Timestamps into JavaScript Date objects.

* **Usage:** `{{ value | timestampDate | date:'short' }}`

### 4. Excel Export Service (`services/excel-export`)

A service for exporting data to Excel files.

* **Features:**
  * Lazily loads the `xlsx` library to keep bundle size small.
  * Auto-formats Dates and Firestore Timestamps.
* **Dependencies:**
  * `xlsx` (npm install xlsx)

## Integration Guide

To use these assets in a new project:

1. **Copy the files:** Copy the contents of this directory to your project's `src/app/shared` or `src/app/core` directory.
2. **Install dependencies:**

    ```bash
    npm install xlsx @angular/material @angular/fire
    ```

3. **Update Imports:**
    The files currently use path aliases (e.g., `@shared/...`). You will need to update these imports to match your project's structure or configure your `tsconfig.json` paths to match.

    * `@shared/types/pagination.types` -> `path/to/types/pagination.types`
    * `@shared/services/logger/logger.service` -> `path/to/services/logger.service`
    * etc.

4. **Register Global Services:**
    Ensure `LoggerService` and `ExcelExportService` are provided in your application (they are `providedIn: 'root'` by default, so just ensuring the files are included is usually enough).
