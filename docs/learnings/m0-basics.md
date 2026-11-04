# Milestone 0: Angular Basics

> **How to use this page:** it is a workbook. Each topic has a short seed explanation, the APIs to learn, a mini-exercise, and a **My notes** block. Replace the seed text with your own words as you learn. Tick boxes as you go. Delete anything that turns out not to matter.

|                |                                                                  |
| -------------- | ---------------------------------------------------------------- |
| **Status**     | Started                                                          |
| **Started**    | 29 oct                                                           |
| **Finished**   |                                                                  |
| **Depends on** | Nothing. This is the starting point.                             |
| **Next**       | [Milestone 1: Routing, Data & Forms](./m1-routing-data-forms.md) |
| **Roadmap**    | [ROADMAP.md → Milestone 0](../ROADMAP.md)                        |
| **Backend**    | Not needed yet. Use a hard-coded array.                          |

**Goal:** understand what Angular is, and build a static page out of components.

**Deliverable:** a static product catalog: a grid of product cards, built from small components, with no routing and no HTTP yet.

---

## 0. Setup checklist

- [✅] Node and npm installed (`node -v`, `npm -v`)
- [✅] Angular CLI available (`npx ng version`)
- [✅] `npm install` done in this repo
- [✅] `ng serve` opens the app at <http://localhost:4200>
- [✅] `ng test` runs (this project uses Vitest) and the starter test passes
- [✅] I changed the text in `src/app/app.html`, saw the page update, and understand why

**My notes**

- ***

## 1. TypeScript essentials

**Seed explanation:** Angular is written in TypeScript, which is JavaScript plus types. The types catch mistakes before the code runs, and Angular's decorators and dependency injection rely on them.

**Learn**

- [✅] Basic types: `string`, `number`, `boolean`, arrays, tuples, `unknown`, `any` (and why to avoid `any`)
- [✅] `interface` vs. `type`
- [✅] Union types (`string | null`) and optional properties (`line2?: string`)
- [✅] Classes: properties, methods, `constructor`, `private` / `readonly`
- [✅] Generics (`Array<Product>`, `Paginated<T>`)
- [✅] Arrow functions, destructuring, spread, template strings
- [✅] `import` / `export` (ES modules)
- [✅] Decorators: what `@Component(...)` is doing (a function applied to a class)
- [✅] `strict` mode: open `tsconfig.json` and find out what it turns on

**Exercise:** in a scratch file, define a `Product` interface and a function `totalPrice(products: Product[]): number`. Make the compiler complain on purpose (wrong type, missing field) and read the error message.

**My notes**

- **Questions I still have**

- ***

## 2. What Angular is and how the project is laid out

**Seed explanation:** an Angular app is a tree of **components**. Each component owns a piece of the screen: a TypeScript class (logic), an HTML template (markup), and CSS (styles). The CLI generates and builds all of it.

**Learn**

- [ ] The component tree: one root component, many children
  - https://angular.dev/guide/components - Done
- [ ] The Angular CLI: `ng new`, `ng serve`, `ng build`, `ng generate`, `ng test`
- [ ] What the build output is (open `dist/` after `ng build`)

**Explore these files** and write one sentence for each:

| File                    | What it does |
| ----------------------- | ------------ |
| `src/main.ts`           |              |
| `src/index.html`        |              |
| `src/app/app.ts`        |              |
| `src/app/app.html`      |              |
| `src/app/app.config.ts` |              |
| `src/app/app.routes.ts` |              |
| `angular.json`          |              |
| `src/app/app.spec.ts`   |              |

**Also notice**

- [ ] This app is **standalone**: components import what they need directly, with no `NgModule`
- [ ] Look at `app.config.ts`: which change detection provider is used (zone-based or zoneless)? I will come back to this in Milestone 4.
- [ ] `src/server.ts`, `main.server.ts` and `app.config.server.ts` exist because the project was created with SSR. I can ignore them for now.

**Exercise:** draw the component tree for the finished catalog page (boxes and arrows) before writing any code. Keep the drawing for the "What I built" section.

**My notes**

- **Questions I still have**

- ***

## 3. Components

**Seed explanation:** the `@Component` decorator ties a class to a template and a CSS selector. The selector is the HTML tag you use to place the component.

**Learn**

- [ ] `ng generate component <name>` and what files it creates
- [ ] `@Component({ selector, imports, templateUrl, styleUrl })`
- [ ] The `imports` array: how a component gets access to other components, pipes and directives
- [ ] Naming and folder conventions (`shared/`, `features/`)
- [ ] Component styles are scoped to the component by default
- [ ] `ChangeDetectionStrategy.OnPush` exists (a later topic, do not worry yet)

**Exercise:** generate `ProductCard`, put its tag in `app.html`, and see it render. Then remove it from `imports` and read the error.

**My notes**

- **Things that broke**

- ***

## 4. Templates and data binding

**Seed explanation:** the template is HTML plus Angular syntax that connects it to the class. There are four kinds of binding, and almost everything else is a variation of them.

| Binding       | Syntax                | Direction       | Example                          |
| ------------- | --------------------- | --------------- | -------------------------------- |
| Interpolation | `{{ value }}`         | class → text    | `{{ product.name }}`             |
| Property      | `[prop]="expr"`       | class → element | `<img [src]="product.imageUrl">` |
| Event         | `(event)="handler()"` | element → class | `<button (click)="add()">`       |
| Two-way       | `[(ngModel)]="x"`     | both            | (you will meet this with forms)  |

**Learn**

- [ ] Interpolation, and what expressions are allowed inside `{{ }}`
- [ ] Property binding vs. HTML attribute (`[src]` vs. `src`)
- [ ] Event binding and `$event`
- [ ] Class and style bindings (`[class.sold-out]="product.stock === 0"`)
- [ ] Template reference variables (`#box`)
- [ ] Reading and writing component fields from the template
- [ ] **Signals as component state:** `signal()`, reading with `count()`, updating with `.set()` / `.update()` (a first taste, Milestone 3 goes deeper)

**Exercise:** build a counter component: a button that increments a number and a second button that resets it. Do it once with a plain field, once with a `signal`.

**My notes**

- **Things that broke**

- ***

## 5. Built-in control flow

**Seed explanation:** `@if`, `@for` and `@switch` are the template syntax for showing, repeating and choosing. They replace the older `*ngIf`, `*ngFor` and `*ngSwitch` directives, which you will still see in older code (Milestone 2 migrates them).

**Learn**

- [ ] `@if (cond) { ... } @else { ... }`
- [ ] `@for (item of items; track item.id) { ... } @empty { ... }`
- [ ] Why `track` is required and why `track item.id` beats `track $index`
- [ ] The `@for` helpers: `$index`, `$first`, `$last`, `$even`, `$count`
- [ ] `@switch (value) { @case (...) { ... } @default { ... } }`
- [ ] How the old `*ngIf` / `*ngFor` look, so I can read legacy code

**Exercise:** render the product list with `@for`, show an empty state with `@empty`, and show an "Out of stock" badge with `@if`.

**My notes**

- **Things that broke**

- ***

## 6. Component communication: `input()` and `output()`

**Seed explanation:** data flows **down** from parent to child through inputs, and events flow **up** from child to parent through outputs. A presentational component (like `ProductCard`) should not know where its data comes from.

**Learn**

- [ ] `input<T>()` and `input.required<T>()`: signal-based inputs (read them with `()`)
- [ ] Passing a value in: `<app-product-card [product]="p" />`
- [ ] `output<T>()` and `.emit(value)`
- [ ] Listening in the parent: `(addToCart)="onAdd($event)"`
- [ ] Why a child should not change the object it received
- [ ] `computed()` for values derived from inputs (for example `isSoldOut`)
- [ ] The older `@Input()` / `@Output()` decorators exist; recognise them in old code

**Exercise:** `ProductCard` takes `product` (required) and emits `addToCart` with the product. The parent logs it. Then add a `computed` called `isSoldOut` inside the card.

**My notes**

- **Questions I still have**

- ***

## 7. Pipes

**Seed explanation:** a pipe transforms a value for display only, directly in the template. The original data is not changed.

**Learn**

- [ ] Built-ins: `currency`, `date`, `uppercase`, `titlecase`, `percent`, `json`, `slice`
- [ ] Pipe parameters: `{{ price | currency:'USD' }}`
- [ ] Chaining pipes
- [ ] `async` pipe (you will use it properly in Milestone 1)
- [ ] Writing a custom pipe: `@Pipe({ name: '...' })` with a `transform` method
- [ ] Pure vs. impure pipes (why pure is the default)
- [ ] Pipe vs. method call in the template (why a pipe is usually better)

**Exercise:** write a `priceFormat` pipe that formats `19.5` as `$19.50` and shows `Free` for `0`. Unit test it.

**My notes**

- ***

## Feature: Static Catalog

**What to build** (mirrors the roadmap)

- [ ] `Product` interface in `shared/models`
- [ ] Hard-coded `products` array (10 or more items, include at least one with `stock: 0`)
- [ ] `ProductCard` component (presentational): `input.required<Product>()`, `output` called `addToCart`
- [ ] `ProductList` component: renders cards with `@for`, shows an empty state with `@empty`
- [ ] `priceFormat` pipe
- [ ] Basic CSS grid layout
- [ ] Parent logs the product when "Add" is clicked

**Suggested folders**

```
src/app/
  shared/
    models/product.ts
    pipes/price-format.pipe.ts
    components/product-card/
  features/
    catalog/product-list/
```

**Hints, not answers**

- Keep the array in its own file so it is easy to replace with HTTP in Milestone 1.
- `ProductCard` should work with any `Product`, with no data fetching inside it.
- Test the empty state by passing an empty array.

---

## Testing basics

- [ ] How `app.spec.ts` is structured (`TestBed`, `fixture`, `detectChanges`)
- [ ] Run `ng test` and read the output
- [ ] Write one component test for `ProductCard`: renders the name, and clicking "Add" emits the product
- [ ] Write one test for the `priceFormat` pipe (plain function call, no `TestBed` needed)

**My notes**

- ***

## Definition of done

- [ ] The product grid renders 10 or more products, and clicking "Add" logs the product from the parent
- [ ] I can explain the data flow between parent and child without notes
- [ ] `ng test` passes with at least one component test
- [ ] `ng build` succeeds
- [ ] The sections below are filled in

---

## What I built

<!-- Short description, the component tree drawing, a screenshot, links to the commits. -->

## Concepts in my own words

<!-- Write these last. If you cannot explain a concept simply, go back to its section. -->

| Concept                                      | In my own words |
| -------------------------------------------- | --------------- |
| Component (class, template, styles)          |                 |
| Interpolation vs. property vs. event binding |                 |
| `@for` and why `track` matters               |                 |
| `input()` vs. `output()`                     |                 |
| Signal vs. plain field                       |                 |
| Pure pipe                                    |                 |
| Standalone component                         |                 |

## What broke and how I fixed it

| Symptom | Cause | Fix |
| ------- | ----- | --- |
|         |       |     |

## Before vs. after

<!-- Example: plain field counter → signal counter; method call in template → pipe. Paste a small before/after snippet. -->

## Open questions

-

## Resources I used

- [angular.dev: Essentials](https://angular.dev/essentials)
- [angular.dev: Components](https://angular.dev/guide/components)
- [angular.dev: Templates](https://angular.dev/guide/templates)
- [angular.dev: Pipes](https://angular.dev/guide/templates/pipes)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
