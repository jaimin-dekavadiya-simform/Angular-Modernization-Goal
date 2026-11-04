# Milestone 1: Routing, Data & Forms

> **How to use this page:** it is a workbook. Each topic has a short seed explanation, the APIs to learn, a mini-exercise, and a **My notes** block. Replace the seed text with your own words as you learn. Tick boxes as you go. Delete anything that turns out not to matter.

|                |                                                                                           |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Status**     |                                                                                           |
| **Started**    |                                                                                           |
| **Finished**   |                                                                                           |
| **Depends on** | [Milestone 0](./m0-basics.md) (components, templates, `input()`/`output()`, control flow) |
| **Roadmap**    | [ROADMAP.md → Milestone 1](../ROADMAP.md)                                                 |
| **Backend**    | [`shoplab-api`](../../../shoplab-api/README.md) running on `http://localhost:3000`        |

**Goal:** make the app multi-page, load real data over HTTP, and handle user input.

**Deliverable:** catalog list, product detail page, and a validated checkout form, all backed by `shoplab-api`.

---

## 0. Setup checklist

- [ ] `shoplab-api` is running (`npm run seed && npm run start:dev` in `../shoplab-api`)
- [ ] `curl http://localhost:3000/api/products?limit=2` returns JSON
- [ ] Swagger opens at <http://localhost:3000/api/docs>
- [ ] Angular dev server runs on port 4200 (`ng serve`), which the API allows through CORS
- [ ] `src/app/environments` or a constant holds the API base URL (`http://localhost:3000/api`), so it is not scattered through the code

**My notes**

-

---

## 1. Dependency injection and services

**Seed explanation:** a service is a plain class that holds logic or data. Angular's injector creates it and hands it to whoever asks. `providedIn: 'root'` makes one shared instance for the whole app.

**Learn**

- [ ] What problem DI solves (compare with `new ProductService()` inside a component)
- [ ] `@Injectable({ providedIn: 'root' })`
- [ ] `inject(ProductService)` vs. constructor injection (you will meet both in old code)
- [ ] Why services are the right place for HTTP calls, not components

**Exercise:** create `ProductService` in `core/` with one method that returns a hard-coded array. Inject it into the list component. Then replace the array with HTTP in topic 3.

**My notes**

-

**Questions I still have**

-

---

## 2. Routing

**Seed explanation:** the router maps a URL to a component and renders it inside `<router-outlet>`. Navigation changes the URL without reloading the page.

**Learn**

- [ ] `provideRouter(routes)` in `app.config.ts`
- [ ] The `Routes` array: `path`, `component`, `title`, `redirectTo`, `pathMatch`
- [ ] `<router-outlet>` and `routerLink` / `routerLinkActive`
- [ ] Route params (`/products/:id`) and reading them
- [ ] `withComponentInputBinding()`: receive route params as `input()`s
- [ ] Query params (`?search=...`) for filters that survive refresh
- [ ] The wildcard route `**` for a 404 page
- [ ] Programmatic navigation with `Router.navigate`

**Routes to build**

| Path            | Component           | Notes               |
| --------------- | ------------------- | ------------------- |
| `/`             | `ProductListPage`   | catalog with search |
| `/products/:id` | `ProductDetailPage` |                     |
| `/checkout`     | `CheckoutPage`      |                     |
| `**`            | `NotFoundPage`      |                     |

**Exercise:** click through the app, refresh on `/products/5`, and confirm it still works. Then type a bad URL and confirm the 404 page shows.

**My notes**

-

**Things that broke**

-

---

## 3. HttpClient

**Seed explanation:** `HttpClient` makes HTTP requests and returns **Observables**. Nothing is sent until something subscribes.

**Learn**

- [ ] `provideHttpClient()` in `app.config.ts` (and `withFetch()`, which is the recommended option for apps with SSR, like this one)
- [ ] `http.get<T>(url, { params })` with a typed response
- [ ] `HttpParams` for query strings
- [ ] Modelling the API with interfaces (`Product`, `Paginated<T>`, `Category`)
- [ ] Loading, success and error states
- [ ] Reading `error.status` and `error.error.message` from `HttpErrorResponse`

**API you will call** (full list in the [API README](../../../shoplab-api/README.md))

| Request                                                  | Returns                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| `GET /api/products?search=&category=&sort=&page=&limit=` | `{ data: Product[], meta: { total, page, limit, totalPages } }` |
| `GET /api/products/:id`                                  | `Product` (with `category`, `images[]`, `rating`, `stock`)      |
| `GET /api/categories`                                    | `Category[]`                                                    |

Useful for testing states (add to any URL): `?delay=2000` (slow), `?fail=500` (error), `?failRate=0.3` (flaky).

**Starter types** (check them against the real JSON, do not trust this blindly)

```ts
export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  images: { width: number; url: string }[];
  rating: number;
  reviewCount: number;
  category?: Category | null;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}
```

**Exercise:** show the product grid from the API. Add `?delay=2000` temporarily and make sure the user sees a loading state. Add `?fail=500` and make sure they see an error message with a retry button.

**My notes**

-

**Things that broke**

-

---

## 4. RxJS basics (just enough for now)

**Seed explanation:** an Observable is a stream of values over time. `HttpClient` returns one that emits once and completes. Milestone 3 goes deeper, so here the goal is only to read and use the basics.

**Learn**

- [ ] Observable vs. Promise (lazy, can emit many values, cancellable)
- [ ] `subscribe` and why un-subscribed calls do nothing
- [ ] `map`, `tap`, `catchError`, `finalize`
- [ ] The `async` pipe: let the template subscribe and unsubscribe for you
- [ ] `debounceTime` + `distinctUntilChanged` + `switchMap` for the search box
- [ ] Why `switchMap` cancels the previous request

**Exercise:** wire the search input to a request. Type fast and open the browser Network tab: only one request should survive, and cancelled ones show as cancelled.

**My notes**

-

**Questions I still have**

-

---

## 5. Reactive forms

**Seed explanation:** in a reactive form, the form model lives in TypeScript (`FormGroup` / `FormControl`) and the template binds to it. This makes validation and testing explicit.

**Learn**

- [ ] `ReactiveFormsModule` (or the standalone imports) and `[formGroup]` / `formControlName`
- [ ] `FormControl`, `FormGroup`, and `FormBuilder` (`inject(NonNullableFormBuilder)`)
- [ ] Built-in validators: `required`, `email`, `minLength`, `pattern`
- [ ] Control state: `touched`, `dirty`, `invalid`, `errors`
- [ ] Showing an error only after the field is touched
- [ ] Disabling submit while invalid or submitting
- [ ] `form.getRawValue()` and typed forms (you get types for free with `NonNullableFormBuilder`)
- [ ] Template-driven vs. reactive: when you would pick each (use reactive here)
- [ ] A custom validator (for example: card expiry is not in the past)

**Checkout form fields** (the backend validates the same rules, so mirror them on the client)

| Field                        | Rule                                          |
| ---------------------------- | --------------------------------------------- |
| `shippingAddress.fullName`   | required, 2–80 chars                          |
| `shippingAddress.line1`      | required, 3–120 chars                         |
| `shippingAddress.line2`      | optional                                      |
| `shippingAddress.city`       | required, 2–60 chars                          |
| `shippingAddress.postalCode` | required, 3–10 letters, digits, spaces or `-` |
| `shippingAddress.country`    | required                                      |
| `payment.cardNumber`         | exactly 16 digits                             |
| `payment.expiry`             | `MM/YY`                                       |
| `payment.cvc`                | 3 or 4 digits                                 |

**Test card:** `4242424242424242` succeeds. A number ending in `0002` is declined by the API with HTTP 402.

**Exercise:** build the form with nested groups. Submit an empty form and confirm every required field shows its error. Then fill it in and confirm the submit button enables.

**My notes**

-

**Things that broke**

-

---

## 6. Submitting the checkout

> ⚠️ **Decision needed.** `POST /api/orders` requires a logged-in user and a non-empty server cart. Login guards and interceptors are Milestone 2, so pick one for now:
>
> - **Option A (simplest):** validate on the client and show a local confirmation. Wire it to the API in Milestone 2/3.
> - **Option B (more realistic):** add a temporary `DevAuthService` that calls `POST /api/auth/login` with `user@shoplab.dev` / `User123!`, then `POST /api/cart/items`, then `POST /api/orders`, sending `Authorization: Bearer <token>` by hand. Remove it in Milestone 2 when the interceptor replaces it.

**My choice:** ☐ A ☐ B

**Why:**

**If you chose B, learn**

- [ ] Sending headers with `HttpHeaders`
- [ ] Handling the error cases below

| Response                    | Meaning                       | What the UI should do                                   |
| --------------------------- | ----------------------------- | ------------------------------------------------------- |
| `201`                       | Order created                 | Show confirmation with the order id and total           |
| `400` + `message: string[]` | Validation failed             | Show the messages (never trust client validation alone) |
| `400` "Cart is empty"       | Nothing to buy                | Tell the user                                           |
| `401`                       | Not logged in / token expired | (Milestone 2)                                           |
| `402`                       | Card declined                 | Show "payment declined" on the card field               |
| `409`                       | Not enough stock              | Show which product                                      |

**My notes**

-

---

## 7. States, errors and polish

- [ ] Loading state on the list, the detail page and the submit button
- [ ] Error state with a retry action
- [ ] Empty state ("No products match your search")
- [ ] Product not found (404 from the API) shows a friendly page
- [ ] Out-of-stock products are visibly marked (`stock === 0`; the seed data has some)
- [ ] Prices formatted with the `currency` pipe

**My notes**

-

---

## Feature checklist

Mirrors the roadmap. Tick when it works in the browser, not when the code is written.

- [ ] `ProductService` fetching from `shoplab-api` (`GET /api/products`)
- [ ] Routes: `/`, `/products/:id`, `/checkout`, wildcard 404
- [ ] Search box on the list (debounced)
- [ ] Checkout form with validation and error messages
- [ ] Loading and error states in the UI

## Definition of done

- [ ] Navigating between pages works and survives a browser refresh
- [ ] An invalid checkout submit shows field errors; a valid submit shows a confirmation
- [ ] Data comes from HTTP, not from a hard-coded array
- [ ] I can explain, without notes, what happens between typing in the search box and the grid updating
- [ ] `ng test` passes, with at least one test each for `ProductService` and the checkout form validation
- [ ] The sections below are filled in

---

## What I built

<!-- Short description, screenshots, links to the commits. -->

## Concepts in my own words

<!-- Write these last. If you cannot explain a concept simply, go back to its section. -->

| Concept                           | In my own words |
| --------------------------------- | --------------- |
| Dependency injection              |                 |
| `providedIn: 'root'`              |                 |
| Router, route params              |                 |
| `HttpClient` and Observables      |                 |
| `switchMap`                       |                 |
| `async` pipe                      |                 |
| Reactive form vs. template-driven |                 |
| Validators and control state      |                 |

## What broke and how I fixed it

| Symptom | Cause | Fix |
| ------- | ----- | --- |
|         |       |     |

## Before vs. after

<!-- Example: hard-coded array → HTTP; subscribe in component → async pipe. Paste a small before/after snippet. -->

## Open questions

-

## Resources I used

- [angular.dev: Routing](https://angular.dev/guide/routing)
- [angular.dev: HTTP client](https://angular.dev/guide/http)
- [angular.dev: Reactive forms](https://angular.dev/guide/forms/reactive-forms)
- [angular.dev: Dependency injection](https://angular.dev/guide/di)
- [RxJS: operators](https://rxjs.dev/guide/operators)
