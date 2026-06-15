# Badge, Alert, Card, Spinner components + Storybook stories + showcase docs

## Context

`usli-button` (`projects/ui-sdk/src/lib/components/button/`) establishes the library's
component pattern:

- Standalone Angular component, `ChangeDetectionStrategy.OnPush`
- A `computed` `classes` signal that combines a USLI base class, the matching
  Bootstrap base class, and a `<thing>-usli-<variant>` modifier class
- The modifier class overrides Bootstrap's component-scoped CSS custom properties
  (e.g. `--bs-btn-*`) using tokens from `usli-palette.scss`, each with a hardcoded
  hex fallback (`var(--blue-500, #00338e)`)
- `ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'info' | 'success'`,
  exported from `usli-button.component.ts`

This spec adds four more components following the same conventions: **Badge**,
**Alert**, **Card**, **Spinner** — plus Storybook stories and showcase docs pages
for each.

Bootstrap is loaded globally (`bootstrap.min.css`) in both the ui-sdk Storybook
config and the showcase app, so `.badge`, `.alert`, `.card`, `.spinner-border`,
`.btn-close`, `.visually-hidden`, etc. are all available without extra imports.

## Shared conventions

- File layout per component: `projects/ui-sdk/src/lib/components/<name>/`
  - `usli-<name>.component.ts`
  - `usli-<name>.component.html`
  - `usli-<name>.component.scss`
  - `index.ts` → `export * from './usli-<name>.component'`
- Add `export * from './<name>'` to `projects/ui-sdk/src/lib/components/index.ts`
- Badge, Card, and Spinner reuse `ButtonVariant` (imported from the button barrel,
  e.g. `import type { ButtonVariant } from '../button'`).
- Alert gets a new semantic-only type: `AlertVariant = 'error' | 'warning' | 'info' | 'success'`,
  exported from `usli-alert.component.ts`.

## Component specs

### Badge — `usli-badge`

- **Inputs**
  - `variant: ButtonVariant` — default `'primary'`
  - `pill: boolean` — default `false`; adds `rounded-pill`
  - `label: string` — default `''`; used when no content is projected
- **classes**: `usli-badge badge badge-usli-${variant}` (+ `rounded-pill` when `pill`)
- **Template**: `<span [class]="classes()"><ng-content>{{ label() }}</ng-content></span>`
- **SCSS variants** — Bootstrap badges have no `--bs-badge-bg` var, so each modifier
  class sets `background-color` directly plus `--bs-badge-color`:
  - `primary`: bg `blue-500`, text `white`
  - `secondary`: bg `blue-50`, text `blue-700` (soft)
  - `tertiary`: bg `gray-100`, text `gray-700` (soft)
  - `error`: bg `error-500`, text `white`
  - `warning`: bg `warning-500`, text `warning-900`
  - `info`: bg `info-600`, text `white`
  - `success`: bg `success-500`, text `white`

### Alert — `usli-alert`

- **Inputs**
  - `variant: AlertVariant` — default `'info'`
  - `title?: string` — optional heading rendered as `.alert-heading`
  - `dismissible: boolean` — default `false`
- **Output**: `dismissed: void`
- **Internal state**: `visible` signal, starts `true`. Dismiss button sets it to
  `false` (removes the alert from the DOM via `@if`) and emits `dismissed`.
- **classes**: `usli-alert alert alert-usli-${variant}` (+ `alert-dismissible` when
  `dismissible`)
- **Template**:
  ```html
  @if (visible()) {
    <div [class]="classes()" role="alert">
      @if (title()) { <h4 class="alert-heading">{{ title() }}</h4> }
      <ng-content />
      @if (dismissible()) {
        <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()"></button>
      }
    </div>
  }
  ```
- **SCSS variants** override `--bs-alert-bg`, `--bs-alert-color`,
  `--bs-alert-border-color`, `--bs-alert-link-color` using subtle/emphasis palette
  tones, e.g. `error`: bg `error-50`, color `error-700`, border `error-200`. Same
  shape for `warning`, `info`, `success`.

### Card — `usli-card`

- **Inputs**
  - `variant?: ButtonVariant` — optional accent color, default `undefined`
  - `title?: string`
  - `subtitle?: string`
- **classes**: `usli-card card` (+ `card-usli-${variant}` when `variant` is set)
- **Template**:
  ```html
  <div [class]="classes()">
    <div class="card-body">
      @if (title()) { <h5 class="card-title">{{ title() }}</h5> }
      @if (subtitle()) { <h6 class="card-subtitle mb-2 usli-card__subtitle">{{ subtitle() }}</h6> }
      <ng-content />
    </div>
  </div>
  ```
  Single body slot only — no header/footer slots (out of scope).
- **SCSS variants**: each `card-usli-<variant>` sets `border-top-width: 3px` and
  `border-top-color` as direct longhand overrides (not via `--bs-card-border-color`,
  which would re-color every edge). Source order after `.card` makes the longhand
  win over Bootstrap's `border` shorthand. Accent colors per variant (the
  variant's "identifying" color, not necessarily its button background):
  - `primary`: `blue-500`
  - `secondary`: `blue-300`
  - `tertiary`: `gray-400`
  - `error`: `error-500`
  - `warning`: `warning-500`
  - `info`: `info-600`
  - `success`: `success-500`

### Spinner — `usli-spinner`

- **Inputs**
  - `variant?: ButtonVariant` — optional, default `undefined` (inherits `currentColor`)
  - `size: 'small' | 'medium' | 'large'` — default `'medium'`
  - `type: 'border' | 'grow'` — default `'border'`
  - `label: string` — default `'Loading...'`; rendered as visually-hidden text
- **classes**: `usli-spinner spinner-${type}` + size modifier (`spinner-${type}-sm`
  for `small`, `spinner-usli-lg` for `large`, nothing extra for `medium`) +
  `spinner-usli-${variant}` when `variant` is set
- **Template**: `<div [class]="classes()" role="status"><span class="visually-hidden">{{ label() }}</span></div>`
- **SCSS**: `.spinner-usli-<variant>` sets `color` only (drives `currentColor` for
  both border and grow spinners), one rule per `ButtonVariant`. `.spinner-usli-lg`
  sets `--bs-spinner-width` / `--bs-spinner-height` to `3rem`.

## Storybook stories

New files in `projects/ui-sdk/src/stories/` (no `usli-` prefix):

- `badge.stories.ts` — title `Components/Badge`
- `alert.stories.ts` — title `Components/Alert`
- `card.stories.ts` — title `Components/Card`
- `spinner.stories.ts` — title `Components/Spinner`

Each: `Meta<Usli*Component>`, `tags: ['autodocs']`, `argTypes` with `select`
controls for variant/size/type/etc., and stories covering the variant set plus a
size/type matrix where relevant — same shape as the scaffolded `Example/Button`
stories (Primary/Secondary/Large/Small), adapted per component. These are placed
alongside the existing scaffolded `Example/*` stories as a new top-level
`Components/*` group.

## Showcase docs pages

New folders under `projects/showcase/src/app/pages/components/{badge,alert,card,spinner}/`,
each with `.ts` / `.html` / `.scss`, mirroring `button-docs`:

- Page header + lead paragraph
- "Variants" section with live examples + code block
- A second section for the component's other key option (pill / dismissible /
  accent variant / size & type) + code block
- API table (inputs, and outputs where applicable)

New routes added to `projects/showcase/src/app/app.routes.ts`:
`/components/badge`, `/components/alert`, `/components/card`, `/components/spinner`.

New sidebar entries added to `projects/showcase/src/app/layout/sidebar/sidebar.ts`
under the existing "Components" section, alongside "Button".
