# Recipe Book

An Angular 14 recipe manager with a Firebase backend: keep the recipes you love,
open any of them for the full ingredient list, push what you need onto a shopping
list, and sync the whole book to the cloud.

Accounts come in **two roles** — **Admin** (can create, edit and delete recipes)
and **Customer** (view only) — chosen when you sign up and enforced by a route
guard.

> This repository is a fork of the Angular course project
> [`umangutkarsh/recipe-book`](https://github.com/umangutkarsh/recipe-book),
> maintained by [@17ramya](https://github.com/17ramya). The UI has been rebuilt on
> top of a global design system, and role-based access has been added on top of the
> original functionality.

<p align="center">
  <img alt="Angular 14" src="https://img.shields.io/badge/Angular-14.2-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
  <img alt="TypeScript 4.7" src="https://img.shields.io/badge/TypeScript-4.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img alt="RxJS 6" src="https://img.shields.io/badge/RxJS-6.6-B7178C?style=for-the-badge&logo=reactivex&logoColor=white" />
  <img alt="Bootstrap 3" src="https://img.shields.io/badge/Bootstrap-3.4-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-Auth%20%2B%20Realtime%20DB-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" />
</p>

## Contents

- [Features](#features)
- [Roles: Admin vs Customer](#roles-admin-vs-customer)
- [Tools and technologies](#tools-and-technologies)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Testing](#testing)
- [Angular concepts used](#angular-concepts-used)
- [Deploy to Firebase Hosting](#deploy-to-firebase-hosting)
- [Roadmap](#roadmap)
- [Credits](#credits)

## Features

- **Authentication** — email/password sign-up and sign-in against the Firebase
  Identity Toolkit REST API, with auto-login, token-expiry auto-logout and an HTTP
  interceptor that attaches the ID token to outgoing requests.
- **Role-based access** — every account is created as an **Admin** or a
  **Customer**, and the recipes area adapts to the role.
- **Recipe management** — create, edit and delete recipes through a reactive form
  (name, image URL, description, ingredients) with live validation.
- **Recipe browsing** — a scrollable recipe list plus a hero detail view with an
  ingredient breakdown and a one-click "add to shopping list".
- **Shopping list** — add, update and delete ingredients, or copy the complete
  ingredient set of a recipe in a single click.
- **Cloud sync** — save the recipe book to and fetch it from the Firebase Realtime
  Database.
- **Design system** — a single token layer in `src/styles.css` (colour, spacing,
  radii, shadow, motion) plus Bootstrap 3 component overrides, shared by every
  view, with component styles kept inside the CLI budget.
- **Lazy loading** — the recipes, shopping-list and auth areas are separate
  lazy-loaded feature modules.
- **Unit tests** — Karma + Jasmine specs for the role model, the role store and the
  admin guard.

## Roles: Admin vs Customer

The role is chosen in the sign-up form (the "Sign up as" cards) and remembered per
email address, so it survives a logout, a page refresh and token expiry.

| Capability | Customer | Admin |
| --- | :---: | :---: |
| Sign up / sign in / log out | ✅ | ✅ |
| Browse the recipe list | ✅ | ✅ |
| Open the details of a recipe | ✅ | ✅ |
| Add a recipe's ingredients to the shopping list | ✅ | ✅ |
| Create a recipe (`/recipes/new`) | ❌ | ✅ |
| Edit a recipe (`/recipes/:id/edit`) | ❌ | ✅ |
| Delete a recipe | ❌ | ✅ |
| Save the book to the cloud | ❌ | ✅ |
| Fetch the book from the cloud | ✅ | ✅ |

Customers never see the "New recipe" button, the "Edit recipe" / "Delete recipe"
menu entries or "Save to cloud". Instead they get a **View only** chip, and the
routes behind those actions are blocked even if the URL is typed by hand.

### Where the role lives

| Layer | File | Responsibility |
| --- | --- | --- |
| Model | `src/app/auth/user-role.model.ts` | `UserRole`, `ADMIN_ROLE` / `CUSTOMER_ROLE`, `DEFAULT_USER_ROLE` and the `USER_ROLE_OPTIONS` that drive the sign-up picker |
| Storage | `src/app/auth/user-role.service.ts` | `UserRoleService` remembers `email → role` in `localStorage` under `recipeBook.userRoles`; anything it cannot resolve falls back to the read-only customer role |
| Session | `src/app/auth/user.model.ts`, `src/app/auth/auth.service.ts` | `User` carries `role` and exposes `isAdmin`; `signup()` records the chosen role while `login()` and `autoLogin()` resolve it again |
| Guard | `src/app/auth/admin.guard.ts` | `AdminGuard` blocks `/recipes/new` and `/recipes/:id/edit`: customers are redirected to `/recipes`, anonymous visitors to `/auth`. Guards run *before* resolvers, so a blocked edit URL fetches nothing at all |
| UI | `header`, `recipe-list`, `recipe-detail` | Hide every editing control and show the role chip |

### Promote an existing account to Admin

Accounts that cannot be resolved to a stored role default to the read-only
**Customer** role. To promote one, set it in the browser console and reload:

```js
localStorage.setItem(
  'recipeBook.userRoles',
  JSON.stringify({ 'you@example.com': 'admin' })
);
```

> **Security note** — the role is stored client-side because the Firebase REST
> sign-up endpoint cannot attach a custom claim without the Admin SDK, and the
> sign-up form deliberately lets the user pick "Admin". That is fine for a learning
> project, but it is not tamper-proof. For a real deployment, move the role into
> Firebase **custom claims** and enforce it with **Realtime Database security
> rules** — see the [roadmap](#roadmap).

## Tools and technologies

| Technology | Version | Used for |
| --- | --- | --- |
| [Angular](https://angular.io/) | 14.2 | Components, modules, routing, DI, forms |
| TypeScript | 4.7 | Application language (`strictTemplates` is enabled) |
| [RxJS](https://rxjs.dev/) | 6.6 | Observables, subjects, operators, HTTP streams |
| [Bootstrap](https://getbootstrap.com/docs/3.4/) | 3.4.1 | Grid and component base, kept so the existing markup keeps working |
| [Firebase](https://firebase.google.com/) | REST API v1 | Identity Toolkit (authentication) + Realtime Database (recipe storage) |
| Karma + Jasmine | 6.4 / 4.3 | Unit tests |
| Google Fonts | Poppins / Inter | Typography, with a system-font fallback when offline |

## Project structure

```text
Angular-Cook-Book-Recipe/
|-- src/
|   |-- app/
|   |   |-- auth/                       # sign-up, sign-in, roles and guards
|   |   |   |-- auth.component.*            # auth screen + role picker
|   |   |   |-- auth.service.ts             # Firebase auth REST calls, session, auto-login
|   |   |   |-- auth.guard.ts               # "is signed in" guard
|   |   |   |-- admin.guard.ts              # "is an admin" guard for authoring routes
|   |   |   |-- auth-interceptor.service.ts # attaches the ID token to requests
|   |   |   |-- user.model.ts               # User + isAdmin
|   |   |   |-- user-role.model.ts          # UserRole, role options, helpers
|   |   |   +-- user-role.service.ts        # remembers each email's role
|   |   |-- header/                     # navigation bar, role chip, cloud sync menu
|   |   |-- recipes/                    # lazy-loaded recipes feature module
|   |   |   |-- recipe-list/recipe-item/
|   |   |   |-- recipe-detail/
|   |   |   |-- recipe-edit/            # reactive form (admin only)
|   |   |   |-- recipe-start/
|   |   |   |-- recipe-routing.module.ts    # routes + AuthGuard / AdminGuard
|   |   |   +-- recipes-resolver.service.ts
|   |   |-- shopping-list/              # lazy-loaded shopping list feature module
|   |   |-- shared/                     # alert, loading spinner, dropdown, placeholder
|   |   |   |-- data-storage.service.ts     # Firebase Realtime DB save / fetch
|   |   |   +-- shared.module.ts
|   |   +-- app.module.ts, app-routing.module.ts, core.module.ts
|   |-- environments/                   # development + production Firebase config
|   |-- styles.css                      # the global design system
|   +-- index.html, main.ts, polyfills.ts, favicon.ico
|-- angular.json, karma.conf.js, tsconfig*.json, package.json
+-- README.md
```

## Getting started

### Prerequisites

- **Node.js 16.20.2** (recommended) with npm. Angular CLI 14.2 declares
  `node: ^14.15.0 || >=16.10.0`; newer majors (18/20/22/24) still build, but the CLI
  prints `Node: ... (Unsupported)`.
- A **Firebase project** with Email/Password authentication enabled — see
  [configuration](#configuration).

### Commands

Run everything from the repository root:

```bash
# 1. install the dependencies
npm install

# 2. start the development server -> http://localhost:4200
npm start

#    ...or choose the port and open the browser automatically
npx ng serve --port 4200 --open

#    silence the one-time analytics prompt (fresh shell / CI)
#    PowerShell:  $env:NG_CLI_ANALYTICS='false'
#    bash:        export NG_CLI_ANALYTICS=false

# 3. production build -> dist/first-app
npm run build -- --configuration production

# 4. unit tests, single headless run
npm test -- --watch=false --browsers=ChromeHeadless

# 5. optional: serve the production build locally
npx http-server dist/first-app -p 8080
```

### Always use the local CLI

This project pins `@angular/cli` 14 in `package.json`. If a different major is
installed globally (`ng --version` reporting 15+), a bare `ng build` fails with an
unhelpful error. Use `npm start`, `npm run build` or `npx ng ...` so the local 14.2
CLI is the one that runs.

## Configuration

The app talks to Firebase over REST, so only an API key and a database URL are
needed — no Admin SDK.

### 1. Firebase API key

Replace the placeholder in **both** environment files:

```ts
// src/environments/environment.ts       (development)
// src/environments/environment.prod.ts  (production)
export const environment = {
  production: false, // true in environment.prod.ts
  firebaseAPIKey: '<your-firebase-web-api-key>',
};
```

### 2. Realtime Database URL

Replace the database URL in **two** places in
`src/app/shared/data-storage.service.ts` — `storeRecipes()` (the `PUT`) and
`fetchRecipes()` (the `GET`):

```ts
private readonly dbUrl =
  'https://<your-project>-default-rtdb.<region>.firebasedatabase.app';
```

### 3. Firebase project settings

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Authentication → Sign-in method**: enable **Email/Password**.
3. **Build → Realtime Database**: create a database, then use rules that require an
   authenticated user, for example:

```json
{
  "rules": {
    "recipes": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

> **Heads-up** — the API key and database URL committed in this repository point at
> the **original author's** Firebase project, so authentication and
> "Save / Fetch from cloud" will not work until you replace them with your own. A
> web API key is not a secret, but your database rules are: keep write access
> limited to authenticated users, and remember that the app identifies admins on the
> client only (see the [security note](#roles-admin-vs-customer)).

## Testing

Unit tests run on Karma + Jasmine and cover the role model, the role store and the
admin guard.

| Spec | What it verifies |
| --- | --- |
| `src/app/auth/user-role.service.spec.ts` | unknown, invalid and corrupted entries fall back to the read-only customer role; roles are matched case-insensitively; accounts keep separate roles; a customer can be promoted to admin |
| `src/app/auth/user.model.spec.ts` | `isAdmin` is true only for the admin role, and the role survives the persisted-session round trip |
| `src/app/auth/admin.guard.spec.ts` | an admin passes, a signed-in customer is redirected to `/recipes`, an anonymous visitor to `/auth` |

```bash
# watch mode: re-runs on save and opens a browser
npm test

# one headless run, as used in CI
npm test -- --watch=false --browsers=ChromeHeadless
```

Chrome must be installed. If it is not on the default path, point Karma at it with
the `CHROME_BIN` environment variable.

## Angular concepts used

- **Components** — `AuthComponent`, `RecipeListComponent`, `RecipeDetailComponent`
  and friends split the UI into encapsulated, reusable pieces.
- **Modules & lazy loading** — `RecipesModule`, `ShoppingListModule` and
  `AuthModule` are lazy-loaded from `AppRoutingModule` with `PreloadAllModules`.
- **Routing & nested routes** — `/recipes` renders the list with child routes for
  `new`, `:id` and `:id/edit`.
- **Route guards** — `AuthGuard` requires a session; `AdminGuard` additionally
  requires the admin role and returns a `UrlTree` to redirect.
- **Resolver** — `RecipesResolverService` loads the recipes before a recipe route
  activates.
- **Reactive forms** — the recipe editor builds the ingredient rows from a
  `FormBuilder` + `FormArray`, with validation state read through getters.
- **Template-driven forms** — the auth form and the shopping-list form use `ngModel`,
  `NgForm` and the built-in validators.
- **Directives** — `*ngIf` / `*ngFor` plus two custom ones: `appDropdown` for the
  menus and `appPlaceholder` for dynamic component loading.
- **Dynamic component creation** — `PlaceholderDirective` and
  `ComponentFactoryResolver` create the alert component at runtime.
- **Services & dependency injection** — `AuthService`, `RecipeService`,
  `ShoppingListService`, `DataStorageService` and `UserRoleService`, provided in
  root or through `CoreModule`.
- **HTTP interceptor** — `AuthInterceptorService` clones every request and appends
  the auth token.
- **Observables, subjects & operators** — a `BehaviorSubject` for the user stream,
  `EventEmitter` for the shopping list, and `map`, `take`, `tap`, `catchError` and
  `exhaustMap` for the HTTP pipelines.
- **Data binding** — interpolation, property binding, event binding and two-way
  binding.
- **Environment build configurations** — `environment.ts` is swapped for
  `environment.prod.ts` during a production build.
- **Unit testing** — Karma + Jasmine with `TestBed`.
- **Design tokens** — CSS custom properties consumed by every component style.

## Deploy to Firebase Hosting

```bash
# 1. install the Firebase CLI (once per machine)
npm install -g firebase-tools

# 2. sign in (opens a browser window)
firebase login

# 3. initialise hosting from the repository root
firebase init hosting
```

Answer the prompts like this:

| Prompt | Answer |
| --- | --- |
| Project setup | your own Firebase project |
| Public directory | **`dist/first-app`** — the `outputPath` in `angular.json` |
| Configure as a single-page app? | **Yes** (rewrites every URL to `/index.html`) |
| Set up automatic builds with GitHub? | optional |
| Overwrite `dist/first-app/index.html`? | **No** |

```bash
# 4. build the app and deploy it
npm run build -- --configuration production
firebase deploy
```

The CLI prints the Hosting URL when it finishes. If `firebase init` guessed a
different public directory, set `hosting.public` to `dist/first-app` in
`firebase.json` before deploying.

## Roadmap

- [x] Rebuild the UI on top of a global design system
- [x] Admin / Customer roles with guarded recipe authoring
- [x] Unit tests for the role model, the role store and the admin guard
- [x] Rewrite this README for the fork and its commands
- [ ] Move roles to Firebase **custom claims** (Admin SDK) and enforce them with
      Realtime Database security rules, so a client cannot grant itself admin
- [ ] Persist the role server-side so it follows the account across devices
- [ ] Decide whether the shopping list should also be read-only for customers
- [ ] Password reset and email verification screens
- [ ] Offline-first caching of the recipe book with a service worker

## Credits

- Original course project:
  [`umangutkarsh/recipe-book`](https://github.com/umangutkarsh/recipe-book) —
  configured as the `upstream` remote of this fork.
- Redesigned UI, design system and role-based access:
  [@17ramya](https://github.com/17ramya), in
  [`17ramya/Angular-Cook-Book-Recipe`](https://github.com/17ramya/Angular-Cook-Book-Recipe).
- Generated with Angular CLI 14.2 and built on the Firebase REST APIs.

## License

ISC — see the upstream project for the original terms.

