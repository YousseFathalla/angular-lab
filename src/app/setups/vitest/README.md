# Vitest Angular Setup

## vitest.config.ts at the root of the project

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
  },
});
```

## tsconfig.spec.json at the root of the project

### note: add src/test-providers.ts to tsconfig.spec.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./out-tsc/spec",
    "types": ["vitest/globals"],
    "target": "ES2022",
  },
  "files": ["src/test-providers.ts"], //note: add this
  "include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
}
```

## angular.json at the root of the project

```json
"test": {
   "builder": "@angular/build:unit-test",
    "options": {
        "providersFile": "src/test-providers.ts"
    }
},
```
