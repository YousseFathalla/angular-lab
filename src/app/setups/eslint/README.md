# ESLint Angular "Bleeding Edge" Setup

This setup enforces modern Angular best practices (Signals, `inject()`, modern control flow) and strict TypeScript rules.

## 📦 Installation

```bash
ng add angular-eslint
```

## create eslint.config.js at the root of the project

## 🛠 Usage

1. Copy the `eslint.config.js` from this folder to your project root.
2. Ensure you have `typescript` and `typescript-eslint` configured.

## 💡 What's inside?

- **Signals First:** Enforces `input()`, `output()`, and `model()`.
- **Modern Control Flow:** Errors on `*ngIf` and `*ngFor` in favor of `@if` and `@for`.
- **Clean Templates:** Max complexity rules and self-closing tag enforcement.
- **Dependency Injection:** Enforces `inject()` over constructor injection.
