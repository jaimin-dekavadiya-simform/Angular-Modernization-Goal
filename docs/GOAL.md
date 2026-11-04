# Angular Modernization Goals

## Week 1: Modern Angular Foundations & Upgrade Path

- Angular release cadence, LTS/EOL policy, and reading the official update guide (update.angular.dev)
- Upgrading across major versions with `ng update`, step by step
- The modern build system (esbuild/Vite-based application builder)
- Standalone components, directives and pipes; migrating away from NgModules with the official schematic
- Built-in control flow (`@if`, `@for`, `@switch`) replacing `*ngIf`/`*ngFor`, using the migration schematic
- `inject()` function vs. constructor injection
- Functional guards, resolvers and interceptors
- Using AI assistants alongside schematics, and reviewing AI-generated migration diffs

**Hands-on:** upgrade a legacy app and run the standalone and control-flow migrations

## Week 2: Signals & Reactive State Patterns

- Signals fundamentals: `signal`, `computed`, `effect`, `linkedSignal`
- Signal inputs, outputs and model inputs (`input()`, `output()`, `model()`), plus signal queries (`viewChild`, `contentChild`)
- RxJS interop: `toSignal` and `toObservable`; when RxJS is still the right tool (streams, debouncing, websockets)
- Async data with the `resource` / `httpResource` APIs
- Modern forms: typed reactive forms and signal-based forms
- State management options and their trade-offs:
  - Service with Signals
  - NgRx SignalStore
  - Classic NgRx Store
- Migrating `BehaviorSubject`-based services to Signals

**Hands-on:** refactor one feature's state to Signals or SignalStore

## Week 3: Performance & Rendering

- Change detection deep dive: Default vs. OnPush, and how Signals change it
- Zoneless change detection: migration steps and pitfalls
- Deferrable views (`@defer`) with triggers, placeholders and prefetching
- Lazy loading routes and components, plus preloading strategies
- SSR, hydration, incremental hydration and prerendering/SSG
- Image optimization (`NgOptimizedImage`), bundle budgets, tree-shaking
- Profiling with Angular DevTools and Lighthouse/Core Web Vitals

**Hands-on:** apply `@defer`, zoneless or SSR to the app and record before/after metrics

## Week 4: Advanced Architecture, Testing & Capstone

- Architecture patterns: feature-based structure, smart vs. presentational components, domain boundaries
- Advanced DI: injection tokens, `providedIn`, hierarchical injectors, environment providers
- Monorepos with Nx, enforcing module boundaries, shared libraries
- Micro-frontends with Module or Native Federation, and when they're worth the complexity
- Design systems and component libraries (Angular CDK, Material)
- Modern testing:
  - Vitest/Jest
  - Angular Testing Library
  - Component harnesses
  - Playwright for E2E
  - AI-generated tests

**Capstone:** present the modernized app, its metrics, the migration playbook and lessons learned
