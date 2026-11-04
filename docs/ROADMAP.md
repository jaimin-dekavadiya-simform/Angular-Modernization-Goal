# Angular Roadmap: From Zero to Modernized App

This roadmap turns the goals in [GOAL.md](./GOAL.md) into milestones. Each milestone ships one feature or module in a single project, so the repository is the proof of learning.

**Starting point:** no Angular experience. The repo is a fresh Angular 21 app (standalone, signals, SSR scaffold, Vitest).

**How to use it:** for each milestone, do theory, then build the feature, then document what you learned. Tick the checklist items. A milestone is done only when its **Definition of done** is met and its learning note is written.

---

## The Project: ShopLab

A small online shop. It is deliberately boring so the focus stays on Angular:

| Area | What it is | Used to learn |
|---|---|---|
| Catalog | Product list, search, product detail | Components, routing, HTTP, `@defer`, images |
| Cart | Add/remove items, totals | Signals, state management |
| Checkout | Multi-field form with validation | Forms |
| Admin | Create/edit products (guarded) | Guards, typed forms, lazy loading |
| Legacy Shop | A *separate* old-style Angular app | Upgrade and migration practice (Milestone 2) |

**Backend:** the sibling project [`../shoplab-api`](../../shoplab-api/README.md) (NestJS) provides every endpoint this roadmap needs: products, auth, cart, orders, admin, websockets, and practice toggles for slow and failing responses. Start it with `npm run seed && npm run start:dev` there.

### Repo layout

```
docs/
  GOAL.md
  ROADMAP.md
  learnings/          # one note per milestone (your proof of learning)
  metrics/            # before/after numbers for performance work
legacy-shop/          # old-version app used for the upgrade exercise (Milestone 2)
src/app/
  core/               # singleton services, guards, interceptors
  shared/             # presentational components, pipes, directives
  features/
    catalog/  cart/  checkout/  admin/
```

### Learning-note template

Create `docs/learnings/mN-<topic>.md` for every milestone:

```md
# Milestone N: <title>

## What I built
## Concepts (in my own words)
## What broke and how I fixed it
## Before vs. after (code or metrics)
## Open questions
```

---

## Milestone Overview

| # | Milestone | Maps to | Feature / module delivered | Est. time |
|---|---|---|---|---|
| 0 | Angular Basics | Pre-requisite | Catalog (static) | 4–5 days |
| 1 | Routing, Data & Forms | Pre-requisite | Catalog + product detail + checkout form | 4–5 days |
| 2 | Modern Foundations & Upgrade Path | Week 1 | Legacy Shop upgraded; ShopLab guards/interceptors | 1 week |
| 3 | Signals & State | Week 2 | Cart (Signals / SignalStore) | 1–1.5 weeks |
| 4 | Performance & Rendering | Week 3 | Catalog optimized (`@defer`, SSR, zoneless) | 1 week |
| 5 | Architecture, Testing & Capstone | Week 4 | Admin module, test suite, Nx/boundaries, capstone | 1–1.5 weeks |

Total: about 6–8 weeks for a beginner. Milestones 0 and 1 are not in GOAL.md, but you need them first.

---

## Milestone 0: Angular Basics

**Goal:** understand what Angular is, and build a static page out of components.

### Theory
- [ ] TypeScript essentials: types, interfaces, classes, generics, decorators, modules
- [ ] What Angular is: components, templates, the component tree, the CLI
- [ ] Project anatomy: `main.ts`, `app.config.ts`, `app.ts`, `angular.json`
- [ ] Templates: interpolation `{{ }}`, property binding `[x]`, event binding `(x)`, two-way `[(x)]`
- [ ] Built-in control flow: `@if`, `@for` (with `track`), `@switch`
- [ ] Component communication: `input()` and `output()`
- [ ] Pipes (`date`, `currency`, `async`) and a custom pipe

### Feature: Static Catalog
- [ ] `ProductCard` component (presentational): takes `product` via `input()`, emits `addToCart` via `output()`
- [ ] `ProductList` component: renders the cards with `@for`, shows an empty state with `@if`
- [ ] Hard-coded product array in a TypeScript file, with a `Product` interface in `shared/models`
- [ ] A custom `priceFormat` pipe
- [ ] Basic CSS layout (grid)

### Definition of done
- Product grid renders 10+ products, and clicking "Add" logs the product from the parent
- You can explain the data flow between parent and child without notes
- `ng test` passes with at least one component test

**Note to write:** `m0-basics.md`

---

## Milestone 1: Routing, Data & Forms

**Goal:** make the app multi-page, load real data over HTTP, and handle user input.

### Theory
- [ ] Dependency injection basics: services, `providedIn: 'root'`
- [ ] Routing: `provideRouter`, route params, `routerLink`, navigation
- [ ] `HttpClient` and `provideHttpClient`
- [ ] RxJS basics: Observable, `subscribe`, `map`, `async` pipe
- [ ] Reactive forms: `FormGroup`, `FormControl`, validators, error display
- [ ] Template-driven vs. reactive forms (know the difference, use reactive)

### Feature: Catalog data + Product detail + Checkout form
- [ ] `ProductService` fetching from `shoplab-api` (`GET /api/products`)
- [ ] Routes: `/` (list), `/products/:id` (detail), `/checkout`, and a wildcard 404
- [ ] Search box on the list (simple filter)
- [ ] Checkout form: name, email, address, card-like field, with validation and error messages
- [ ] Loading and error states in the UI

### Definition of done
- Navigating between pages works and survives a browser refresh
- Invalid checkout submit shows field errors, valid submit shows a confirmation
- Data comes from HTTP, not from a hard-coded array

**Note to write:** `m1-routing-data-forms.md`

---

## Milestone 2: Modern Foundations & Upgrade Path (Week 1)

**Goal:** understand how Angular evolves and how to move old code to modern Angular safely.

### Theory
- [ ] Release cadence, LTS/EOL policy, [update.angular.dev](https://update.angular.dev)
- [ ] `ng update`: how it works, migrations, and why you go one major at a time
- [ ] The esbuild/Vite application builder vs. the old webpack builder
- [ ] Standalone vs. NgModules
- [ ] `*ngIf`/`*ngFor` vs. `@if`/`@for`
- [ ] `inject()` vs. constructor injection
- [ ] Functional guards, resolvers and interceptors
- [ ] How to review an AI-generated migration diff

### Feature A: Legacy Shop (the upgrade exercise)
You need a legacy app to upgrade, because ShopLab is already modern.
- [ ] Generate an old app in `legacy-shop/`, for example `npx @angular/cli@16 new legacy-shop` (needs a compatible Node version; use `nvm` if required)
- [ ] Build a tiny feature the old way: NgModules, `*ngIf`/`*ngFor`, constructor injection, class-based guard
- [ ] Commit the legacy state first, so you can diff against it
- [ ] Upgrade one major at a time with `ng update` until you reach the current version
- [ ] Run the migration schematics: standalone, control flow, `inject()`
- [ ] Switch the builder to the application builder
- [ ] Record each step and each problem in the note

### Feature B: Core module in ShopLab
- [ ] Functional `authGuard` protecting `/admin` (fake login service is fine)
- [ ] Functional HTTP interceptor: adds a header and logs request time
- [ ] Functional resolver that preloads the product for `/products/:id`
- [ ] Replace any constructor injection in ShopLab with `inject()`

### Definition of done
- `legacy-shop` runs on the latest Angular, with no `NgModule`, no `*ngIf`/`*ngFor`
- You have a written step-by-step upgrade log (the start of the migration playbook)
- ShopLab has one guard, one interceptor and one resolver, all functional

**Note to write:** `m2-upgrade-path.md`, including the upgrade log and what AI got right or wrong

---

## Milestone 3: Signals & Reactive State (Week 2)

**Goal:** manage state with Signals, and know when RxJS is still the right tool.

### Theory
- [ ] `signal`, `computed`, `effect`, `linkedSignal`
- [ ] Signal inputs/outputs, `model()`, signal queries (`viewChild`, `contentChild`)
- [ ] `toSignal` / `toObservable`; when to keep RxJS (debounce, websockets, streams)
- [ ] `resource` and `httpResource`
- [ ] Typed reactive forms; signal-based forms
- [ ] State options: service with Signals, NgRx SignalStore, classic NgRx Store, and their trade-offs
- [ ] Migrating a `BehaviorSubject` service to Signals

### Feature: Cart
- [ ] **Step 1:** build `CartService` with `BehaviorSubject` (the "old" way), with add, remove, quantity and total
- [ ] **Step 2:** migrate it to Signals (`signal` + `computed` for total and item count)
- [ ] **Step 3:** re-implement it as an NgRx SignalStore and compare the two
- [ ] Header badge showing item count (reads a `computed`)
- [ ] Cart page with quantity controls, persisted to `localStorage` through an `effect`
- [ ] Product list loads through `httpResource`; search input debounced with RxJS and bridged with `toSignal`
- [ ] Convert the checkout form to typed forms (and try signal-based forms in a branch)
- [ ] Optional: a small classic NgRx Store demo (a "recently viewed" list) just to see the boilerplate

### Definition of done
- Cart works end to end, and total updates with no manual subscriptions
- You have a comparison table in your note: service vs. SignalStore vs. NgRx Store (boilerplate, testability, devtools, when to use)
- No `BehaviorSubject` is left for plain state in the cart

**Note to write:** `m3-signals-state.md`

---

## Milestone 4: Performance & Rendering (Week 3)

**Goal:** make ShopLab measurably faster, and prove it with numbers.

### Theory
- [ ] Change detection: Default vs. OnPush, zone.js, how Signals change it
- [ ] Zoneless change detection: migration steps and pitfalls
- [ ] `@defer` triggers, placeholders, prefetching
- [ ] Lazy routes and components, preloading strategies
- [ ] SSR, hydration, incremental hydration, prerendering/SSG
- [ ] `NgOptimizedImage`, bundle budgets, tree-shaking
- [ ] Angular DevTools, Lighthouse, Core Web Vitals (LCP, INP, CLS)

### Feature: Optimized Catalog
- [ ] **Baseline first:** record Lighthouse scores and bundle size in `docs/metrics/baseline.md`
- [ ] Set `OnPush` on all presentational components
- [ ] Lazy load the `admin`, `checkout` and `cart` routes; try `PreloadAllModules` against a custom strategy
- [ ] Use `@defer (on viewport)` for reviews or recommendations on the product page, with a placeholder
- [ ] Replace `<img>` with `NgOptimizedImage` (use `priority` for the hero/first image)
- [ ] Enable zoneless change detection and fix what breaks
- [ ] Enable SSR with hydration (the scaffold already has it), then incremental hydration, then prerender static pages
- [ ] Configure bundle budgets in `angular.json` so a regression fails the build
- [ ] Profile with Angular DevTools and note one real finding

### Definition of done
- `docs/metrics/` has a before/after table (bundle size, LCP, CLS, TBT, Lighthouse score) for each change
- At least one measurable improvement is attributable to a specific technique
- The build fails if a budget is exceeded

**Note to write:** `m4-performance.md`, including the metrics tables

---

## Milestone 5: Architecture, Testing & Capstone (Week 4)

**Goal:** structure the app so it scales, test it properly, and present the whole journey.

### Theory
- [ ] Feature-based structure, smart vs. presentational components, domain boundaries
- [ ] Advanced DI: `InjectionToken`, `providedIn`, hierarchical injectors, environment providers
- [ ] Nx, module boundaries, shared libraries
- [ ] Micro-frontends: Module / Native Federation, and when they aren't worth it
- [ ] Angular CDK and Material, and design-system basics
- [ ] Testing: Vitest/Jest, Angular Testing Library, component harnesses, Playwright, AI-generated tests

### Feature A: Admin module (architecture)
- [ ] Admin feature as a lazy-loaded area: product list table, create/edit form, delete with confirmation
- [ ] Built with Angular Material and CDK (table, dialog, form fields)
- [ ] Smart container + presentational components pattern
- [ ] `API_BASE_URL` `InjectionToken` provided at the environment level, and a swappable `ProductRepository` (HTTP vs. in-memory) through DI
- [ ] A component-level provider to show hierarchical injector behaviour

### Feature B: Test suite
- [ ] Unit tests (Vitest) for services and pure logic (cart totals, pipes)
- [ ] Component tests with Angular Testing Library (user-centric queries)
- [ ] A Material component test using a component harness
- [ ] Playwright E2E: browse, add to cart, checkout; and admin login, then create product
- [ ] Generate one batch of tests with AI, then review, fix and note what it got wrong
- [ ] Coverage report and a target (for example 80% on `core` and `features`)

### Feature C: Workspace and boundaries (stretch)
- [ ] Move the project into an Nx workspace with `shop`, `ui` (shared), and `data-access` libraries
- [ ] Enforce module boundaries with lint rules, and prove a bad import fails lint
- [ ] Write a short ADR on whether micro-frontends would help ShopLab (expected answer: no, and why)

### Capstone
- [ ] `docs/CAPSTONE.md` covering the modernized app, a metrics summary, the **migration playbook** (from Milestone 2's log), and lessons learned
- [ ] A 10-minute demo: legacy app, then modern app, then metrics
- [ ] Clean README with setup steps and screenshots

### Definition of done
- All tests green locally, E2E included
- Architecture rules are enforced by tooling, not just convention
- Capstone document is complete and links every milestone note

**Note to write:** `m5-architecture-testing.md` plus `CAPSTONE.md`

---

## Progress Tracker

| Milestone | Status | Started | Finished | Note |
|---|---|---|---|---|
| 0. Angular Basics | ☐ | | | |
| 1. Routing, Data & Forms | ☐ | | | |
| 2. Modern Foundations & Upgrade | ☐ | | | |
| 3. Signals & State | ☐ | | | |
| 4. Performance & Rendering | ☐ | | | |
| 5. Architecture, Testing & Capstone | ☐ | | | |

## Study Rules

1. **Theory, then build, then write.** Never skip the note. Explaining it in your own words is the test.
2. **Commit per feature.** Use one commit or branch per milestone step, so the history shows your progress.
3. **Break it on purpose.** After a feature works, remove or misuse one thing to see the error. This teaches more than the happy path.
4. **Measure, don't guess.** In Milestone 4, no change counts without before/after numbers.
5. **Use AI as a reviewer, not an author.** Write the code first, then ask AI to critique it. Record where its advice was wrong.
6. **Primary sources first:** [angular.dev](https://angular.dev) docs and tutorials, then blogs and videos.
