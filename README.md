# 🍹 Cocktail Bar Application

A modern **Angular cocktail discovery application** for exploring recipes, searching cocktails by name or ingredient, managing favorites, and preserving user preferences across sessions.

The project focuses on **modern Angular patterns**, reactive state management with **Signals**, performance optimization with **CDK Virtual Scrolling**, and a comprehensive testing strategy using **Vitest** and **Playwright**.

---

## ✨ Features

- 🔎 Search cocktails by **name or ingredient**
- 🍸 Browse a dynamic cocktail catalog
- ❤️ Add and remove cocktails from **favorites**
- ⭐ Persistent favorites using `localStorage`
- 🔄 Dynamic client-side filtering
- 📌 Persistent user preferences and UI state
- 📜 Persistent scroll position
- ⚡ Efficient rendering with **Angular CDK Virtual Scrolling**
- 🪟 Cocktail details displayed in an **Angular Material dialog**
- 📱 Responsive UI
- 🧪 Unit testing with **Vitest**
- 🎭 End-to-end testing with **Playwright**
- 🌐 Multi-browser E2E testing across Chromium, Firefox, and WebKit

---

## 🏗️ Architecture

The application follows a **feature-driven architecture** that separates domain models, business logic, shared state, and UI features.

```text
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── cocktail.ts
│   │   │
│   │   └── services/
│   │       ├── cocktail-api.service.ts
│   │       ├── cocktail-state.ts
│   │       └── favorites.ts
│   │
│   ├── features/
│   │   ├── cocktail-list/
│   │   │   └── ...
│   │   │
│   │   └── cocktail-detail-dialog/
│   │       └── ...
│   │
│   ├── app.component.ts
│   └── app.config.ts
│
├── tests/
│   └── app-init.spec.ts
│
├── playwright.config.ts
└── vitest.config.ts
```

### Core

Contains application-wide services, state management, and domain models.

- **`cocktail-api.service.ts`**
  Responsible for communication with the cocktail API.

- **`cocktail-state.ts`**
  Manages application-level UI state such as filters, favorite view state, and scroll position.

- **`favorites.ts`**
  Handles favorite cocktail state and persistence.

- **`models/`**
  Contains strongly typed TypeScript models and application types.

### Features

UI functionality is organized by domain rather than by technical type.

- **`cocktail-list/`**
  Main catalog, search/filtering functionality, favorites view, and virtual scrolling.

- **`cocktail-detail-dialog/`**
  Displays detailed cocktail information inside an Angular Material dialog.

This structure makes individual features easier to maintain, test, and extend.

---

## 🛠️ Technical Decisions

### Angular Signals

The application uses modern Angular **Signals** for reactive state management.

```ts
signal();
computed();
```

Signals provide fine-grained reactivity and are particularly useful for local and application state where a full RxJS stream is unnecessary.

`computed()` is used for derived state such as filtered cocktail collections and other values that depend on reactive state.

This approach keeps state management explicit while reducing unnecessary RxJS boilerplate.

---

### 💾 Persistent State with `localStorage`

Application state is persisted through `localStorage`.

The persisted state includes:

- User filters
- Search configuration
- Favorite-view preferences
- Scroll position
- Favorite cocktails

This allows the application to restore the user's previous state after a page reload or browser restart.

The persistence logic is encapsulated inside the state/favorites services rather than being coupled directly to UI components.

---

### ⚡ CDK Virtual Scrolling

The cocktail catalog uses Angular CDK's:

```ts
CdkVirtualScrollViewport;
```

Virtual scrolling prevents the application from rendering the entire cocktail collection into the DOM at once.

Instead, only the items currently visible in the viewport are rendered.

This is especially useful when working with larger datasets because it:

- Reduces DOM size
- Improves rendering performance
- Reduces memory usage
- Keeps scrolling responsive
- Avoids unnecessary component creation

---

### 🎨 Angular Material

Angular Material is used for UI components that benefit from accessible and consistent behavior.

For example:

```ts
MatDialog;
```

is used to display cocktail details without requiring a separate route.

Angular Material also provides keyboard interaction, accessibility support, and responsive behavior out of the box.

---

## 🧪 Testing Strategy

The project uses two complementary testing tools.

### Unit Tests — Vitest

**Vitest** is used for unit-level testing of application logic and components.

It was chosen instead of the traditional Karma/Jasmine setup because of its:

- Fast execution
- Modern mocking APIs
- Simple configuration
- Excellent developer experience
- Good integration with modern Angular tooling

Run tests in watch mode:

```bash
npm run test:cov
```

---

### End-to-End Tests — Playwright

**Playwright** is used to validate complete user flows in a real browser environment.

The test suite can run against:

- Chromium
- Firefox
- WebKit

Playwright also provides automatic waiting, browser isolation, screenshots, traces, and HTML reporting.

Run E2E tests:

```bash
npx playwright test
```

Run Playwright UI mode:

```bash
npx playwright test --ui
```

View the generated report:

```bash
npx playwright show-report
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js **18+**
- npm

### Installation

Clone the repository:

```bash
git clone <repository-url>
```

Navigate into the project:

```bash
cd cocktail-bar
```

Install dependencies:

```bash
npm install
```

---

## ▶️ Running the Application

Start the Angular development server:

```bash
npm run start
```

Or:

```bash
ng serve
```

Open:

```text
http://localhost:4200/
```

The application will automatically reload when source files are modified.

---

## 🧪 Running Tests

### Unit Tests

Watch mode:

```bash
npm run test
```

Single execution:

```bash
npx vitest run
```

### E2E Tests

Run all Playwright tests:

```bash
npx playwright test
```

Interactive mode:

```bash
npx playwright test --ui
```

Generate/view the HTML report:

```bash
npx playwright show-report
```

---

## 📚 Tech Stack

| Technology           | Purpose                           |
| -------------------- | --------------------------------- |
| **Angular**          | Frontend framework                |
| **TypeScript**       | Type-safe application development |
| **Angular Signals**  | Reactive state management         |
| **Angular CDK**      | Virtual scrolling                 |
| **Angular Material** | UI components and dialogs         |
| **Vitest**           | Unit testing                      |
| **Playwright**       | End-to-end testing                |
| **localStorage**     | Client-side state persistence     |
| **Cocktail API**     | Cocktail data source              |

---

## 🎯 Key Engineering Goals

This project was built with a focus on:

- **Modern Angular architecture**
- **Reactive state management**
- **Separation of concerns**
- **Strong TypeScript typing**
- **Performance optimization**
- **Accessible UI components**
- **Persistent client-side state**
- **Testability**
- **Maintainable feature-driven organization**

The architecture is designed to make the application easy to extend with additional features such as pagination, advanced filtering, authentication, additional cocktail categories, or a more sophisticated backend data layer.
