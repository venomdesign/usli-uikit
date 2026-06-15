# Badge, Alert, Card, Spinner Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Badge, Alert, Card, and Spinner components to the `ui-sdk` library, each with a unit test, a Storybook story, and a showcase documentation page, following the conventions established by `usli-button`.

**Architecture:** Each component is a standalone, `OnPush` Angular component living in its own folder under `projects/ui-sdk/src/lib/components/<name>/`, with a `computed` `classes` signal that combines a USLI base class, the Bootstrap base class, and a `<thing>-usli-<variant>` modifier class. Modifier classes override Bootstrap's component-scoped CSS custom properties using tokens from `usli-palette.scss`. Badge, Card, and Spinner reuse the existing `ButtonVariant` type; Alert defines its own `AlertVariant`. Each component's `classes()` output is fully determined by its inputs, so the spec test (run via vitest) is written alongside the implementation and serves as the verification gate for each task — there's no separate "stub then fix" step since the design doc already fully specifies the expected output for each input combination.

**Tech Stack:** Angular 21 (standalone components, signals, `@if` control flow), Bootstrap 5.3 (CSS custom property overrides), Storybook 10 (`@storybook/angular`), vitest (via `@angular/build:unit-test`).

---

## Reference: design spec

Full component specs are in `docs/superpowers/specs/2026-06-10-badge-alert-card-spinner-components-design.md`. Read it before starting if anything below is unclear.

---

### Task 1: Badge component (`usli-badge`)

**Files:**
- Create: `projects/ui-sdk/src/lib/components/badge/usli-badge.component.ts`
- Create: `projects/ui-sdk/src/lib/components/badge/usli-badge.component.html`
- Create: `projects/ui-sdk/src/lib/components/badge/usli-badge.component.scss`
- Create: `projects/ui-sdk/src/lib/components/badge/usli-badge.component.spec.ts`
- Create: `projects/ui-sdk/src/lib/components/badge/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`
- Create: `projects/ui-sdk/src/stories/badge.stories.ts`
- Create: `projects/showcase/src/app/pages/components/badge/badge-docs.ts`
- Create: `projects/showcase/src/app/pages/components/badge/badge-docs.html`
- Create: `projects/showcase/src/app/pages/components/badge/badge-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create the component class**

Create `projects/ui-sdk/src/lib/components/badge/usli-badge.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ButtonVariant } from '../button';

@Component({
  selector: 'usli-badge',
  standalone: true,
  templateUrl: './usli-badge.component.html',
  styleUrl: './usli-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliBadgeComponent {
  /** Semantic variant */
  variant = input<ButtonVariant>('primary');

  /** Renders a fully rounded pill shape */
  pill = input(false);

  /** Label text — used when no content is projected */
  label = input('');

  protected classes = computed(() => {
    const v = this.variant();
    const pillClass = this.pill() ? ' rounded-pill' : '';
    return `usli-badge badge badge-usli-${v}${pillClass}`;
  });
}
```

- [ ] **Step 2: Create the template**

Create `projects/ui-sdk/src/lib/components/badge/usli-badge.component.html`:

```html
<span [class]="classes()"><ng-content>{{ label() }}</ng-content></span>
```

- [ ] **Step 3: Create the styles**

Create `projects/ui-sdk/src/lib/components/badge/usli-badge.component.scss`:

```scss
:host {
  display: inline-block;
}

.usli-badge {
  font-family: var(--font-roboto, 'Roboto', sans-serif);
  font-weight: var(--fw-medium, 500);
}

// ── Primary — filled USLI Blue ─────────────────────────────────────────────
.badge-usli-primary {
  --bs-badge-color: var(--white, #ffffff);
  background-color: var(--blue-500, #00338e);
}

// ── Secondary — soft blue ───────────────────────────────────────────────────
.badge-usli-secondary {
  --bs-badge-color: var(--blue-700, #00216a);
  background-color: var(--blue-50, #e3e9f6);
}

// ── Tertiary — soft gray ─────────────────────────────────────────────────────
.badge-usli-tertiary {
  --bs-badge-color: var(--gray-700, #616161);
  background-color: var(--gray-100, #f5f5f5);
}

// ── Error ────────────────────────────────────────────────────────────────────
.badge-usli-error {
  --bs-badge-color: var(--white, #ffffff);
  background-color: var(--error-500, #b10505);
}

// ── Warning ──────────────────────────────────────────────────────────────────
.badge-usli-warning {
  --bs-badge-color: var(--warning-900, #4d3c00);
  background-color: var(--warning-500, #efc100);
}

// ── Info ─────────────────────────────────────────────────────────────────────
.badge-usli-info {
  --bs-badge-color: var(--white, #ffffff);
  background-color: var(--info-600, #4996e3);
}

// ── Success ──────────────────────────────────────────────────────────────────
.badge-usli-success {
  --bs-badge-color: var(--white, #ffffff);
  background-color: var(--success-500, #14661a);
}
```

- [ ] **Step 4: Create the barrel export**

Create `projects/ui-sdk/src/lib/components/badge/index.ts`:

```typescript
export * from './usli-badge.component';
```

- [ ] **Step 5: Register the component in the components barrel**

Modify `projects/ui-sdk/src/lib/components/index.ts`. Current content:

```typescript
export * from './button';
```

New content:

```typescript
export * from './button';
export * from './badge';
```

- [ ] **Step 6: Write the spec test**

Create `projects/ui-sdk/src/lib/components/badge/usli-badge.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliBadgeComponent } from './usli-badge.component';

describe('UsliBadgeComponent', () => {
  let fixture: ComponentFixture<UsliBadgeComponent>;
  let component: UsliBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliBadgeComponent);
    component = fixture.componentInstance;
  });

  it('defaults to the primary variant', () => {
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.className).toBe('usli-badge badge badge-usli-primary');
  });

  it('applies the requested variant', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.className).toBe('usli-badge badge badge-usli-success');
  });

  it('adds rounded-pill when pill is true', () => {
    fixture.componentRef.setInput('pill', true);
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.className).toBe('usli-badge badge badge-usli-primary rounded-pill');
  });

  it('renders the label when no content is projected', () => {
    fixture.componentRef.setInput('label', 'New');
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.textContent?.trim()).toBe('New');
  });
});
```

- [ ] **Step 7: Run the tests**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS — all 4 tests in `UsliBadgeComponent` pass (plus the existing `UiSdk` spec).

- [ ] **Step 8: Create the Storybook story**

Create `projects/ui-sdk/src/stories/badge.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/angular';

import { UsliBadgeComponent } from 'ui-sdk';

const meta: Meta<UsliBadgeComponent> = {
  title: 'Components/Badge',
  component: UsliBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
    pill: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    label: 'Badge',
    pill: false,
  },
};

export default meta;
type Story = StoryObj<UsliBadgeComponent>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Error: Story = { args: { variant: 'error' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Info: Story = { args: { variant: 'info' } };
export const Success: Story = { args: { variant: 'success' } };
export const Pill: Story = { args: { variant: 'primary', label: 'New', pill: true } };
```

- [ ] **Step 9: Create the showcase docs page component**

Create `projects/showcase/src/app/pages/components/badge/badge-docs.ts`:

```typescript
import { Component } from '@angular/core';
import { UsliBadgeComponent } from 'ui-sdk';

@Component({
  selector: 'app-badge-docs',
  standalone: true,
  imports: [UsliBadgeComponent],
  templateUrl: './badge-docs.html',
  styleUrl: './badge-docs.scss',
})
export class BadgeDocs {}
```

- [ ] **Step 10: Create the showcase docs page styles**

Create `projects/showcase/src/app/pages/components/badge/badge-docs.scss`:

```scss
@use '../../docs-page';
```

- [ ] **Step 11: Create the showcase docs page template**

Create `projects/showcase/src/app/pages/components/badge/badge-docs.html`:

```html
<div class="page">

  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Badge</span>
    </nav>
    <h1 class="page-title">Badge</h1>
    <p class="page-lead">
      Small status descriptors for UI elements. Badges support the same semantic
      variants as Button, plus an optional pill shape for counts and status dots.
    </p>
  </header>

  <!-- Variants -->
  <section class="section">
    <h2 class="section__title">Variants</h2>
    <p class="section__desc">
      Use the variant input to choose the visual style. primary, secondary, and
      tertiary provide neutral emphasis levels; error, warning, info, and success
      communicate status.
    </p>
    <div class="example-box">
      <usli-badge variant="primary">Primary</usli-badge>
      <usli-badge variant="secondary">Secondary</usli-badge>
      <usli-badge variant="tertiary">Tertiary</usli-badge>
      <usli-badge variant="error">Error</usli-badge>
      <usli-badge variant="warning">Warning</usli-badge>
      <usli-badge variant="info">Info</usli-badge>
      <usli-badge variant="success">Success</usli-badge>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-badge variant="primary"&gt;Primary&lt;/usli-badge&gt;
&lt;usli-badge variant="secondary"&gt;Secondary&lt;/usli-badge&gt;
&lt;usli-badge variant="tertiary"&gt;Tertiary&lt;/usli-badge&gt;
&lt;usli-badge variant="error"&gt;Error&lt;/usli-badge&gt;
&lt;usli-badge variant="warning"&gt;Warning&lt;/usli-badge&gt;
&lt;usli-badge variant="info"&gt;Info&lt;/usli-badge&gt;
&lt;usli-badge variant="success"&gt;Success&lt;/usli-badge&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- Pill shape -->
  <section class="section">
    <h2 class="section__title">Pill shape</h2>
    <p class="section__desc">Set [pill]="true" for a fully rounded badge, useful for counts and status dots.</p>
    <div class="example-box">
      <usli-badge variant="primary" [pill]="true">New</usli-badge>
      <usli-badge variant="success" [pill]="true">Active</usli-badge>
      <usli-badge variant="error" [pill]="true">3</usli-badge>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-badge variant="primary" [pill]="true"&gt;New&lt;/usli-badge&gt;
&lt;usli-badge variant="success" [pill]="true"&gt;Active&lt;/usli-badge&gt;
&lt;usli-badge variant="error" [pill]="true"&gt;3&lt;/usli-badge&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- API -->
  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">variant</span></td>
          <td><span class="prop-type">'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'info' | 'success'</span></td>
          <td><span class="prop-default">'primary'</span></td>
          <td>Semantic color variant.</td>
        </tr>
        <tr>
          <td><span class="prop-name">pill</span></td>
          <td><span class="prop-type">boolean</span></td>
          <td><span class="prop-default">false</span></td>
          <td>Renders a fully rounded pill shape.</td>
        </tr>
        <tr>
          <td><span class="prop-name">label</span></td>
          <td><span class="prop-type">string</span></td>
          <td><span class="prop-default">''</span></td>
          <td>Text content. Overridden by projected content.</td>
        </tr>
      </tbody>
    </table>
  </section>

</div>
```

- [ ] **Step 12: Add the route**

Modify `projects/showcase/src/app/app.routes.ts`. Current relevant lines:

```typescript
  {
    path: 'components/button',
    loadComponent: () => import('./pages/components/button/button-docs').then(m => m.ButtonDocs),
  },
  {
    path: 'design/colors',
```

New (insert the badge route between button and design/colors):

```typescript
  {
    path: 'components/button',
    loadComponent: () => import('./pages/components/button/button-docs').then(m => m.ButtonDocs),
  },
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/components/badge/badge-docs').then(m => m.BadgeDocs),
  },
  {
    path: 'design/colors',
```

- [ ] **Step 13: Add the sidebar entry**

Modify `projects/showcase/src/app/layout/sidebar/sidebar.ts`. Current relevant lines:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
      ],
    },
```

New:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
        { label: 'Badge',  path: '/components/badge' },
      ],
    },
```

- [ ] **Step 14: Run the tests again**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS

- [ ] **Step 15: Commit**

```bash
git add projects/ui-sdk/src/lib/components/badge projects/ui-sdk/src/lib/components/index.ts projects/ui-sdk/src/stories/badge.stories.ts projects/showcase/src/app/pages/components/badge projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "Add usli-badge component with story and showcase docs"
```

---

### Task 2: Alert component (`usli-alert`)

**Files:**
- Create: `projects/ui-sdk/src/lib/components/alert/usli-alert.component.ts`
- Create: `projects/ui-sdk/src/lib/components/alert/usli-alert.component.html`
- Create: `projects/ui-sdk/src/lib/components/alert/usli-alert.component.scss`
- Create: `projects/ui-sdk/src/lib/components/alert/usli-alert.component.spec.ts`
- Create: `projects/ui-sdk/src/lib/components/alert/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`
- Create: `projects/ui-sdk/src/stories/alert.stories.ts`
- Create: `projects/showcase/src/app/pages/components/alert/alert-docs.ts`
- Create: `projects/showcase/src/app/pages/components/alert/alert-docs.html`
- Create: `projects/showcase/src/app/pages/components/alert/alert-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create the component class**

Create `projects/ui-sdk/src/lib/components/alert/usli-alert.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'usli-alert',
  standalone: true,
  templateUrl: './usli-alert.component.html',
  styleUrl: './usli-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliAlertComponent {
  /** Semantic variant */
  variant = input<AlertVariant>('info');

  /** Optional heading rendered above the projected content */
  title = input<string | undefined>();

  /** Shows a close button that hides the alert */
  dismissible = input(false);

  /** Emitted when the close button is clicked */
  dismissed = output<void>();

  protected visible = signal(true);

  protected classes = computed(() => {
    const v = this.variant();
    const dismissibleClass = this.dismissible() ? ' alert-dismissible' : '';
    return `usli-alert alert alert-usli-${v}${dismissibleClass}`;
  });

  protected dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
```

- [ ] **Step 2: Create the template**

Create `projects/ui-sdk/src/lib/components/alert/usli-alert.component.html`:

```html
@if (visible()) {
  <div [class]="classes()" role="alert">
    @if (title()) {
      <h4 class="alert-heading">{{ title() }}</h4>
    }
    <ng-content></ng-content>
    @if (dismissible()) {
      <button type="button" class="btn-close" aria-label="Close" (click)="dismiss()"></button>
    }
  </div>
}
```

- [ ] **Step 3: Create the styles**

Create `projects/ui-sdk/src/lib/components/alert/usli-alert.component.scss`:

```scss
:host {
  display: block;
}

.usli-alert {
  font-family: var(--font-roboto, 'Roboto', sans-serif);
}

// ── Error ────────────────────────────────────────────────────────────────────
.alert-usli-error {
  --bs-alert-color: var(--error-700, #770303);
  --bs-alert-bg: var(--error-50, #fff0f0);
  --bs-alert-border-color: var(--error-200, #f09090);
  --bs-alert-link-color: var(--error-700, #770303);
}

// ── Warning ──────────────────────────────────────────────────────────────────
.alert-usli-warning {
  --bs-alert-color: var(--warning-900, #4d3c00);
  --bs-alert-bg: var(--warning-50, #fffde7);
  --bs-alert-border-color: var(--warning-200, #fff59d);
  --bs-alert-link-color: var(--warning-900, #4d3c00);
}

// ── Info ─────────────────────────────────────────────────────────────────────
.alert-usli-info {
  --bs-alert-color: var(--info-800, #235aa0);
  --bs-alert-bg: var(--info-50, #e8f4ff);
  --bs-alert-border-color: var(--info-200, #90c8fe);
  --bs-alert-link-color: var(--info-800, #235aa0);
}

// ── Success ──────────────────────────────────────────────────────────────────
.alert-usli-success {
  --bs-alert-color: var(--success-700, #0d4411);
  --bs-alert-bg: var(--success-50, #edfaee);
  --bs-alert-border-color: var(--success-200, #88d58b);
  --bs-alert-link-color: var(--success-700, #0d4411);
}
```

- [ ] **Step 4: Create the barrel export**

Create `projects/ui-sdk/src/lib/components/alert/index.ts`:

```typescript
export * from './usli-alert.component';
```

- [ ] **Step 5: Register the component in the components barrel**

Modify `projects/ui-sdk/src/lib/components/index.ts`. Current content:

```typescript
export * from './button';
export * from './badge';
```

New content:

```typescript
export * from './button';
export * from './badge';
export * from './alert';
```

- [ ] **Step 6: Write the spec test**

Create `projects/ui-sdk/src/lib/components/alert/usli-alert.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliAlertComponent } from './usli-alert.component';

describe('UsliAlertComponent', () => {
  let fixture: ComponentFixture<UsliAlertComponent>;
  let component: UsliAlertComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliAlertComponent);
    component = fixture.componentInstance;
  });

  it('defaults to the info variant', () => {
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div[role="alert"]');
    expect(div.className).toBe('usli-alert alert alert-usli-info');
  });

  it('applies the requested variant and dismissible class', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div[role="alert"]');
    expect(div.className).toBe('usli-alert alert alert-usli-error alert-dismissible');
  });

  it('renders the title as an alert-heading', () => {
    fixture.componentRef.setInput('title', 'Heads up');
    fixture.detectChanges();
    const heading: HTMLElement = fixture.nativeElement.querySelector('.alert-heading');
    expect(heading.textContent?.trim()).toBe('Heads up');
  });

  it('hides itself and emits dismissed when the close button is clicked', () => {
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    let dismissed = false;
    component.dismissed.subscribe(() => (dismissed = true));

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-close');
    closeButton.click();
    fixture.detectChanges();

    expect(dismissed).toBe(true);
    expect(fixture.nativeElement.querySelector('div[role="alert"]')).toBeNull();
  });
});
```

- [ ] **Step 7: Run the tests**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS — all 4 tests in `UsliAlertComponent` pass (plus existing specs).

- [ ] **Step 8: Create the Storybook story**

Create `projects/ui-sdk/src/stories/alert.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/angular';

import { UsliAlertComponent } from 'ui-sdk';

const meta: Meta<UsliAlertComponent> = {
  title: 'Components/Alert',
  component: UsliAlertComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
    },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'info',
    dismissible: false,
  },
  render: (args) => ({
    props: args,
    template: `<usli-alert [variant]="variant" [title]="title" [dismissible]="dismissible">This is an alert message.</usli-alert>`,
  }),
};

export default meta;
type Story = StoryObj<UsliAlertComponent>;

export const Info: Story = { args: { variant: 'info' } };
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Error: Story = { args: { variant: 'error' } };
export const WithTitle: Story = { args: { variant: 'success', title: 'Saved' } };
export const Dismissible: Story = { args: { variant: 'warning', title: 'Heads up', dismissible: true } };
```

- [ ] **Step 9: Create the showcase docs page component**

Create `projects/showcase/src/app/pages/components/alert/alert-docs.ts`:

```typescript
import { Component } from '@angular/core';
import { UsliAlertComponent } from 'ui-sdk';

@Component({
  selector: 'app-alert-docs',
  standalone: true,
  imports: [UsliAlertComponent],
  templateUrl: './alert-docs.html',
  styleUrl: './alert-docs.scss',
})
export class AlertDocs {}
```

- [ ] **Step 10: Create the showcase docs page styles**

Create `projects/showcase/src/app/pages/components/alert/alert-docs.scss`:

```scss
@use '../../docs-page';
```

- [ ] **Step 11: Create the showcase docs page template**

Create `projects/showcase/src/app/pages/components/alert/alert-docs.html`:

```html
<div class="page">

  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Alert</span>
    </nav>
    <h1 class="page-title">Alert</h1>
    <p class="page-lead">
      Provide contextual feedback messages for typical user actions. Alerts come in
      four semantic variants and can optionally include a heading and a dismiss
      button.
    </p>
  </header>

  <!-- Variants -->
  <section class="section">
    <h2 class="section__title">Variants</h2>
    <p class="section__desc">
      Use the variant input to choose the visual style: error, warning, info, or
      success.
    </p>
    <div class="example-box">
      <usli-alert variant="info">An informational message.</usli-alert>
      <usli-alert variant="success">Your changes were saved successfully.</usli-alert>
      <usli-alert variant="warning">This action cannot be undone.</usli-alert>
      <usli-alert variant="error">Something went wrong. Please try again.</usli-alert>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-alert variant="info"&gt;An informational message.&lt;/usli-alert&gt;
&lt;usli-alert variant="success"&gt;Your changes were saved successfully.&lt;/usli-alert&gt;
&lt;usli-alert variant="warning"&gt;This action cannot be undone.&lt;/usli-alert&gt;
&lt;usli-alert variant="error"&gt;Something went wrong. Please try again.&lt;/usli-alert&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- Title and dismiss -->
  <section class="section">
    <h2 class="section__title">Heading and dismiss button</h2>
    <p class="section__desc">
      Set the title input for a bold heading, and [dismissible]="true" to show a
      close button. Dismissing emits the dismissed output and removes the alert.
    </p>
    <div class="example-box">
      <usli-alert variant="success" title="Saved" [dismissible]="true">
        Your policy has been updated.
      </usli-alert>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-alert variant="success" title="Saved" [dismissible]="true" (dismissed)="onDismiss()"&gt;
  Your policy has been updated.
&lt;/usli-alert&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- API -->
  <section class="section">
    <h2 class="section__title">Inputs</h2>
    <table class="api-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">variant</span></td>
          <td><span class="prop-type">'error' | 'warning' | 'info' | 'success'</span></td>
          <td><span class="prop-default">'info'</span></td>
          <td>Semantic color variant.</td>
        </tr>
        <tr>
          <td><span class="prop-name">title</span></td>
          <td><span class="prop-type">string | undefined</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>Optional heading rendered above the projected content.</td>
        </tr>
        <tr>
          <td><span class="prop-name">dismissible</span></td>
          <td><span class="prop-type">boolean</span></td>
          <td><span class="prop-default">false</span></td>
          <td>Shows a close button that hides the alert.</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="section">
    <h2 class="section__title">Outputs</h2>
    <table class="api-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">dismissed</span></td>
          <td><span class="prop-type">OutputEmitterRef&lt;void&gt;</span></td>
          <td>Emitted when the close button is clicked.</td>
        </tr>
      </tbody>
    </table>
  </section>

</div>
```

- [ ] **Step 12: Add the route**

Modify `projects/showcase/src/app/app.routes.ts`. Current relevant lines:

```typescript
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/components/badge/badge-docs').then(m => m.BadgeDocs),
  },
  {
    path: 'design/colors',
```

New (insert the alert route between badge and design/colors):

```typescript
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/components/badge/badge-docs').then(m => m.BadgeDocs),
  },
  {
    path: 'components/alert',
    loadComponent: () => import('./pages/components/alert/alert-docs').then(m => m.AlertDocs),
  },
  {
    path: 'design/colors',
```

- [ ] **Step 13: Add the sidebar entry**

Modify `projects/showcase/src/app/layout/sidebar/sidebar.ts`. Current relevant lines:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
        { label: 'Badge',  path: '/components/badge' },
      ],
    },
```

New:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
        { label: 'Badge',  path: '/components/badge' },
        { label: 'Alert',  path: '/components/alert' },
      ],
    },
```

- [ ] **Step 14: Run the tests again**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS

- [ ] **Step 15: Commit**

```bash
git add projects/ui-sdk/src/lib/components/alert projects/ui-sdk/src/lib/components/index.ts projects/ui-sdk/src/stories/alert.stories.ts projects/showcase/src/app/pages/components/alert projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "Add usli-alert component with story and showcase docs"
```

---

### Task 3: Card component (`usli-card`)

**Files:**
- Create: `projects/ui-sdk/src/lib/components/card/usli-card.component.ts`
- Create: `projects/ui-sdk/src/lib/components/card/usli-card.component.html`
- Create: `projects/ui-sdk/src/lib/components/card/usli-card.component.scss`
- Create: `projects/ui-sdk/src/lib/components/card/usli-card.component.spec.ts`
- Create: `projects/ui-sdk/src/lib/components/card/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`
- Create: `projects/ui-sdk/src/stories/card.stories.ts`
- Create: `projects/showcase/src/app/pages/components/card/card-docs.ts`
- Create: `projects/showcase/src/app/pages/components/card/card-docs.html`
- Create: `projects/showcase/src/app/pages/components/card/card-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create the component class**

Create `projects/ui-sdk/src/lib/components/card/usli-card.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ButtonVariant } from '../button';

@Component({
  selector: 'usli-card',
  standalone: true,
  templateUrl: './usli-card.component.html',
  styleUrl: './usli-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliCardComponent {
  /** Optional accent color applied as a top border */
  variant = input<ButtonVariant | undefined>();

  /** Card title rendered above the projected content */
  title = input<string | undefined>();

  /** Card subtitle rendered below the title */
  subtitle = input<string | undefined>();

  protected classes = computed(() => {
    const v = this.variant();
    const variantClass = v ? ` card-usli-${v}` : '';
    return `usli-card card${variantClass}`;
  });
}
```

- [ ] **Step 2: Create the template**

Create `projects/ui-sdk/src/lib/components/card/usli-card.component.html`:

```html
<div [class]="classes()">
  <div class="card-body">
    @if (title()) {
      <h5 class="card-title">{{ title() }}</h5>
    }
    @if (subtitle()) {
      <h6 class="card-subtitle mb-2 usli-card__subtitle">{{ subtitle() }}</h6>
    }
    <ng-content></ng-content>
  </div>
</div>
```

- [ ] **Step 3: Create the styles**

Create `projects/ui-sdk/src/lib/components/card/usli-card.component.scss`:

```scss
:host {
  display: block;
}

.usli-card {
  font-family: var(--font-roboto, 'Roboto', sans-serif);
}

.usli-card__subtitle {
  color: var(--gray-600, #757575);
}

// ── Primary ──────────────────────────────────────────────────────────────────
.card-usli-primary {
  border-top-width: 3px;
  border-top-color: var(--blue-500, #00338e);
}

// ── Secondary ────────────────────────────────────────────────────────────────
.card-usli-secondary {
  border-top-width: 3px;
  border-top-color: var(--blue-300, #4d78c9);
}

// ── Tertiary ─────────────────────────────────────────────────────────────────
.card-usli-tertiary {
  border-top-width: 3px;
  border-top-color: var(--gray-400, #bdbdbd);
}

// ── Error ────────────────────────────────────────────────────────────────────
.card-usli-error {
  border-top-width: 3px;
  border-top-color: var(--error-500, #b10505);
}

// ── Warning ──────────────────────────────────────────────────────────────────
.card-usli-warning {
  border-top-width: 3px;
  border-top-color: var(--warning-500, #efc100);
}

// ── Info ─────────────────────────────────────────────────────────────────────
.card-usli-info {
  border-top-width: 3px;
  border-top-color: var(--info-600, #4996e3);
}

// ── Success ──────────────────────────────────────────────────────────────────
.card-usli-success {
  border-top-width: 3px;
  border-top-color: var(--success-500, #14661a);
}
```

- [ ] **Step 4: Create the barrel export**

Create `projects/ui-sdk/src/lib/components/card/index.ts`:

```typescript
export * from './usli-card.component';
```

- [ ] **Step 5: Register the component in the components barrel**

Modify `projects/ui-sdk/src/lib/components/index.ts`. Current content:

```typescript
export * from './button';
export * from './badge';
export * from './alert';
```

New content:

```typescript
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
```

- [ ] **Step 6: Write the spec test**

Create `projects/ui-sdk/src/lib/components/card/usli-card.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliCardComponent } from './usli-card.component';

describe('UsliCardComponent', () => {
  let fixture: ComponentFixture<UsliCardComponent>;
  let component: UsliCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliCardComponent);
    component = fixture.componentInstance;
  });

  it('renders without a variant class by default', () => {
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('usli-card card');
  });

  it('applies the requested variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('usli-card card card-usli-success');
  });

  it('renders the title and subtitle', () => {
    fixture.componentRef.setInput('title', 'Policy Summary');
    fixture.componentRef.setInput('subtitle', 'Updated today');
    fixture.detectChanges();
    const titleEl: HTMLElement = fixture.nativeElement.querySelector('.card-title');
    const subtitleEl: HTMLElement = fixture.nativeElement.querySelector('.card-subtitle');
    expect(titleEl.textContent?.trim()).toBe('Policy Summary');
    expect(subtitleEl.textContent?.trim()).toBe('Updated today');
  });
});
```

- [ ] **Step 7: Run the tests**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS — all 3 tests in `UsliCardComponent` pass (plus existing specs).

- [ ] **Step 8: Create the Storybook story**

Create `projects/ui-sdk/src/stories/card.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/angular';

import { UsliCardComponent } from 'ui-sdk';

const meta: Meta<UsliCardComponent> = {
  title: 'Components/Card',
  component: UsliCardComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `<usli-card [variant]="variant" [title]="title" [subtitle]="subtitle" style="max-width: 20rem;">Some quick example text to build on the card and make up the bulk of its content.</usli-card>`,
  }),
};

export default meta;
type Story = StoryObj<UsliCardComponent>;

export const Default: Story = { args: { title: 'Card title', subtitle: 'Card subtitle' } };
export const Primary: Story = { args: { variant: 'primary', title: 'Primary accent' } };
export const Success: Story = { args: { variant: 'success', title: 'Success accent' } };
export const Error: Story = { args: { variant: 'error', title: 'Error accent' } };
export const NoTitle: Story = { args: {} };
```

- [ ] **Step 9: Create the showcase docs page component**

Create `projects/showcase/src/app/pages/components/card/card-docs.ts`:

```typescript
import { Component } from '@angular/core';
import { UsliCardComponent } from 'ui-sdk';

@Component({
  selector: 'app-card-docs',
  standalone: true,
  imports: [UsliCardComponent],
  templateUrl: './card-docs.html',
  styleUrl: './card-docs.scss',
})
export class CardDocs {}
```

- [ ] **Step 10: Create the showcase docs page styles**

Create `projects/showcase/src/app/pages/components/card/card-docs.scss`:

```scss
@use '../../docs-page';

.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;

  usli-card {
    flex: 1 1 16rem;
    max-width: 20rem;
  }
}
```

- [ ] **Step 11: Create the showcase docs page template**

Create `projects/showcase/src/app/pages/components/card/card-docs.html`:

```html
<div class="page">

  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Card</span>
    </nav>
    <h1 class="page-title">Card</h1>
    <p class="page-lead">
      A flexible content container with an optional title, subtitle, and accent
      color. Project any content into the card body.
    </p>
  </header>

  <!-- Basic usage -->
  <section class="section">
    <h2 class="section__title">Basic usage</h2>
    <p class="section__desc">
      Set title and/or subtitle for a heading block above the projected content.
    </p>
    <div class="example-box card-grid">
      <usli-card title="Card title" subtitle="Card subtitle">
        Some quick example text to build on the card and make up the bulk of its content.
      </usli-card>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-card title="Card title" subtitle="Card subtitle"&gt;
  Some quick example text to build on the card and make up the bulk of its content.
&lt;/usli-card&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- Variants -->
  <section class="section">
    <h2 class="section__title">Accent variants</h2>
    <p class="section__desc">
      Set the variant input to add a colored top-border accent. Accepts the same
      values as Button.
    </p>
    <div class="example-box card-grid">
      <usli-card variant="primary" title="Primary accent">Used for highlighted or featured content.</usli-card>
      <usli-card variant="success" title="Success accent">Used to confirm a completed step.</usli-card>
      <usli-card variant="error" title="Error accent">Used to flag content needing attention.</usli-card>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-card variant="primary" title="Primary accent"&gt;Used for highlighted or featured content.&lt;/usli-card&gt;
&lt;usli-card variant="success" title="Success accent"&gt;Used to confirm a completed step.&lt;/usli-card&gt;
&lt;usli-card variant="error" title="Error accent"&gt;Used to flag content needing attention.&lt;/usli-card&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- API -->
  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">variant</span></td>
          <td><span class="prop-type">'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'info' | 'success' | undefined</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>Optional accent color applied as a top border.</td>
        </tr>
        <tr>
          <td><span class="prop-name">title</span></td>
          <td><span class="prop-type">string | undefined</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>Card title rendered above the projected content.</td>
        </tr>
        <tr>
          <td><span class="prop-name">subtitle</span></td>
          <td><span class="prop-type">string | undefined</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>Card subtitle rendered below the title.</td>
        </tr>
      </tbody>
    </table>
  </section>

</div>
```

- [ ] **Step 12: Add the route**

Modify `projects/showcase/src/app/app.routes.ts`. Current relevant lines:

```typescript
  {
    path: 'components/alert',
    loadComponent: () => import('./pages/components/alert/alert-docs').then(m => m.AlertDocs),
  },
  {
    path: 'design/colors',
```

New (insert the card route between alert and design/colors):

```typescript
  {
    path: 'components/alert',
    loadComponent: () => import('./pages/components/alert/alert-docs').then(m => m.AlertDocs),
  },
  {
    path: 'components/card',
    loadComponent: () => import('./pages/components/card/card-docs').then(m => m.CardDocs),
  },
  {
    path: 'design/colors',
```

- [ ] **Step 13: Add the sidebar entry**

Modify `projects/showcase/src/app/layout/sidebar/sidebar.ts`. Current relevant lines:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
        { label: 'Badge',  path: '/components/badge' },
        { label: 'Alert',  path: '/components/alert' },
      ],
    },
```

New:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
        { label: 'Badge',  path: '/components/badge' },
        { label: 'Alert',  path: '/components/alert' },
        { label: 'Card',   path: '/components/card' },
      ],
    },
```

- [ ] **Step 14: Run the tests again**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS

- [ ] **Step 15: Commit**

```bash
git add projects/ui-sdk/src/lib/components/card projects/ui-sdk/src/lib/components/index.ts projects/ui-sdk/src/stories/card.stories.ts projects/showcase/src/app/pages/components/card projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "Add usli-card component with story and showcase docs"
```

---

### Task 4: Spinner component (`usli-spinner`)

**Files:**
- Create: `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.ts`
- Create: `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.html`
- Create: `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.scss`
- Create: `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.spec.ts`
- Create: `projects/ui-sdk/src/lib/components/spinner/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`
- Create: `projects/ui-sdk/src/stories/spinner.stories.ts`
- Create: `projects/showcase/src/app/pages/components/spinner/spinner-docs.ts`
- Create: `projects/showcase/src/app/pages/components/spinner/spinner-docs.html`
- Create: `projects/showcase/src/app/pages/components/spinner/spinner-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create the component class**

Create `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ButtonVariant } from '../button';

@Component({
  selector: 'usli-spinner',
  standalone: true,
  templateUrl: './usli-spinner.component.html',
  styleUrl: './usli-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliSpinnerComponent {
  /** Optional semantic color */
  variant = input<ButtonVariant | undefined>();

  /** Spinner size */
  size = input<'small' | 'medium' | 'large'>('medium');

  /** Animation style */
  type = input<'border' | 'grow'>('border');

  /** Visually-hidden text for screen readers */
  label = input('Loading...');

  protected classes = computed(() => {
    const t = this.type();
    const size = this.size();
    const v = this.variant();

    const sizeMap = { small: `spinner-${t}-sm`, medium: '', large: 'spinner-usli-lg' } as const;
    const sizeClass = sizeMap[size];
    const variantClass = v ? ` spinner-usli-${v}` : '';

    return `usli-spinner spinner-${t}${sizeClass ? ` ${sizeClass}` : ''}${variantClass}`;
  });
}
```

- [ ] **Step 2: Create the template**

Create `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.html`:

```html
<div [class]="classes()" role="status">
  <span class="visually-hidden">{{ label() }}</span>
</div>
```

- [ ] **Step 3: Create the styles**

Create `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.scss`:

```scss
:host {
  display: inline-block;
}

.spinner-usli-lg {
  --bs-spinner-width: 3rem;
  --bs-spinner-height: 3rem;
}

// ── Primary ──────────────────────────────────────────────────────────────────
.spinner-usli-primary {
  color: var(--blue-500, #00338e);
}

// ── Secondary ────────────────────────────────────────────────────────────────
.spinner-usli-secondary {
  color: var(--blue-300, #4d78c9);
}

// ── Tertiary ─────────────────────────────────────────────────────────────────
.spinner-usli-tertiary {
  color: var(--gray-500, #a8a8a8);
}

// ── Error ────────────────────────────────────────────────────────────────────
.spinner-usli-error {
  color: var(--error-500, #b10505);
}

// ── Warning ──────────────────────────────────────────────────────────────────
.spinner-usli-warning {
  color: var(--warning-500, #efc100);
}

// ── Info ─────────────────────────────────────────────────────────────────────
.spinner-usli-info {
  color: var(--info-600, #4996e3);
}

// ── Success ──────────────────────────────────────────────────────────────────
.spinner-usli-success {
  color: var(--success-500, #14661a);
}
```

- [ ] **Step 4: Create the barrel export**

Create `projects/ui-sdk/src/lib/components/spinner/index.ts`:

```typescript
export * from './usli-spinner.component';
```

- [ ] **Step 5: Register the component in the components barrel**

Modify `projects/ui-sdk/src/lib/components/index.ts`. Current content:

```typescript
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
```

New content:

```typescript
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
export * from './spinner';
```

- [ ] **Step 6: Write the spec test**

Create `projects/ui-sdk/src/lib/components/spinner/usli-spinner.component.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliSpinnerComponent } from './usli-spinner.component';

describe('UsliSpinnerComponent', () => {
  let fixture: ComponentFixture<UsliSpinnerComponent>;
  let component: UsliSpinnerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliSpinnerComponent);
    component = fixture.componentInstance;
  });

  it('defaults to a medium border spinner with no variant class', () => {
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('usli-spinner spinner-border');
  });

  it('applies the small size modifier', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('usli-spinner spinner-border spinner-border-sm');
  });

  it('applies the large size modifier and a variant class', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('usli-spinner spinner-border spinner-usli-lg spinner-usli-success');
  });

  it('switches to the grow type', () => {
    fixture.componentRef.setInput('type', 'grow');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.className).toBe('usli-spinner spinner-grow');
  });

  it('renders the label as visually-hidden text', () => {
    fixture.componentRef.setInput('label', 'Saving...');
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('.visually-hidden');
    expect(span.textContent?.trim()).toBe('Saving...');
  });
});
```

- [ ] **Step 7: Run the tests**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS — all 5 tests in `UsliSpinnerComponent` pass (plus existing specs).

- [ ] **Step 8: Create the Storybook story**

Create `projects/ui-sdk/src/stories/spinner.stories.ts`:

```typescript
import type { Meta, StoryObj } from '@storybook/angular';

import { UsliSpinnerComponent } from 'ui-sdk';

const meta: Meta<UsliSpinnerComponent> = {
  title: 'Components/Spinner',
  component: UsliSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    type: {
      control: 'select',
      options: ['border', 'grow'],
    },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    type: 'border',
  },
};

export default meta;
type Story = StoryObj<UsliSpinnerComponent>;

export const Border: Story = { args: { type: 'border' } };
export const Grow: Story = { args: { type: 'grow' } };
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large' } };
export const Success: Story = { args: { variant: 'success' } };
```

- [ ] **Step 9: Create the showcase docs page component**

Create `projects/showcase/src/app/pages/components/spinner/spinner-docs.ts`:

```typescript
import { Component } from '@angular/core';
import { UsliSpinnerComponent } from 'ui-sdk';

@Component({
  selector: 'app-spinner-docs',
  standalone: true,
  imports: [UsliSpinnerComponent],
  templateUrl: './spinner-docs.html',
  styleUrl: './spinner-docs.scss',
})
export class SpinnerDocs {}
```

- [ ] **Step 10: Create the showcase docs page styles**

Create `projects/showcase/src/app/pages/components/spinner/spinner-docs.scss`:

```scss
@use '../../docs-page';
```

- [ ] **Step 11: Create the showcase docs page template**

Create `projects/showcase/src/app/pages/components/spinner/spinner-docs.html`:

```html
<div class="page">

  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Spinner</span>
    </nav>
    <h1 class="page-title">Spinner</h1>
    <p class="page-lead">
      Indicate a loading state with a border or growing spinner. Supports the same
      semantic colors as Button in three sizes.
    </p>
  </header>

  <!-- Types and sizes -->
  <section class="section">
    <h2 class="section__title">Types and sizes</h2>
    <p class="section__desc">
      Use type to choose between border (default) and grow animations, and size
      for small, medium (default), or large.
    </p>
    <div class="example-box">
      <usli-spinner type="border" size="small"  variant="primary" />
      <usli-spinner type="border" size="medium" variant="primary" />
      <usli-spinner type="border" size="large"  variant="primary" />
      <usli-spinner type="grow"   size="medium" variant="primary" />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-spinner type="border" size="small"  variant="primary" /&gt;
&lt;usli-spinner type="border" size="medium" variant="primary" /&gt;
&lt;usli-spinner type="border" size="large"  variant="primary" /&gt;
&lt;usli-spinner type="grow"   size="medium" variant="primary" /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- Variants -->
  <section class="section">
    <h2 class="section__title">Variants</h2>
    <p class="section__desc">Set the variant input to color the spinner.</p>
    <div class="example-box">
      <usli-spinner variant="primary" />
      <usli-spinner variant="secondary" />
      <usli-spinner variant="tertiary" />
      <usli-spinner variant="error" />
      <usli-spinner variant="warning" />
      <usli-spinner variant="info" />
      <usli-spinner variant="success" />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-spinner variant="primary" /&gt;
&lt;usli-spinner variant="secondary" /&gt;
&lt;usli-spinner variant="tertiary" /&gt;
&lt;usli-spinner variant="error" /&gt;
&lt;usli-spinner variant="warning" /&gt;
&lt;usli-spinner variant="info" /&gt;
&lt;usli-spinner variant="success" /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <!-- API -->
  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">variant</span></td>
          <td><span class="prop-type">'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'info' | 'success' | undefined</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>Optional semantic color, drives currentColor.</td>
        </tr>
        <tr>
          <td><span class="prop-name">size</span></td>
          <td><span class="prop-type">'small' | 'medium' | 'large'</span></td>
          <td><span class="prop-default">'medium'</span></td>
          <td>Controls the spinner's width and height.</td>
        </tr>
        <tr>
          <td><span class="prop-name">type</span></td>
          <td><span class="prop-type">'border' | 'grow'</span></td>
          <td><span class="prop-default">'border'</span></td>
          <td>Animation style.</td>
        </tr>
        <tr>
          <td><span class="prop-name">label</span></td>
          <td><span class="prop-type">string</span></td>
          <td><span class="prop-default">'Loading...'</span></td>
          <td>Visually-hidden text for screen readers.</td>
        </tr>
      </tbody>
    </table>
  </section>

</div>
```

- [ ] **Step 12: Add the route**

Modify `projects/showcase/src/app/app.routes.ts`. Current relevant lines:

```typescript
  {
    path: 'components/card',
    loadComponent: () => import('./pages/components/card/card-docs').then(m => m.CardDocs),
  },
  {
    path: 'design/colors',
```

New (insert the spinner route between card and design/colors):

```typescript
  {
    path: 'components/card',
    loadComponent: () => import('./pages/components/card/card-docs').then(m => m.CardDocs),
  },
  {
    path: 'components/spinner',
    loadComponent: () => import('./pages/components/spinner/spinner-docs').then(m => m.SpinnerDocs),
  },
  {
    path: 'design/colors',
```

- [ ] **Step 13: Add the sidebar entry**

Modify `projects/showcase/src/app/layout/sidebar/sidebar.ts`. Current relevant lines:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button', path: '/components/button' },
        { label: 'Badge',  path: '/components/badge' },
        { label: 'Alert',  path: '/components/alert' },
        { label: 'Card',   path: '/components/card' },
      ],
    },
```

New:

```typescript
    {
      title: 'Components',
      items: [
        { label: 'Button',  path: '/components/button' },
        { label: 'Badge',   path: '/components/badge' },
        { label: 'Alert',   path: '/components/alert' },
        { label: 'Card',    path: '/components/card' },
        { label: 'Spinner', path: '/components/spinner' },
      ],
    },
```

- [ ] **Step 14: Run the tests again**

Run: `npx ng test ui-sdk --watch=false`
Expected: PASS

- [ ] **Step 15: Commit**

```bash
git add projects/ui-sdk/src/lib/components/spinner projects/ui-sdk/src/lib/components/index.ts projects/ui-sdk/src/stories/spinner.stories.ts projects/showcase/src/app/pages/components/spinner projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "Add usli-spinner component with story and showcase docs"
```

---

### Task 5: Final verification

**Files:** none (build/serve only)

- [ ] **Step 1: Build the ui-sdk library**

Run: `npx ng build ui-sdk --configuration development`
Expected: Build succeeds with no errors. This confirms ng-packagr can compile and bundle all four new components plus their barrel exports.

- [ ] **Step 2: Build the showcase app**

Run: `npx ng build showcase --configuration development`
Expected: Build succeeds with no errors. This confirms the new routes, sidebar entries, and docs pages compile correctly and `'ui-sdk'` resolves the new exports.

- [ ] **Step 3: Build Storybook**

Run: `npx ng run ui-sdk:build-storybook`
Expected: Build succeeds. Output includes `Components/Badge`, `Components/Alert`, `Components/Card`, `Components/Spinner` alongside the existing `Example/*` and `Components/Colors`/`Typography` entries.

- [ ] **Step 4: Manual visual check in Storybook**

Run: `npm run storybook`
Then open the printed local URL (default `http://localhost:6006`) and check:
- `Components/Badge` — all 7 variant stories render with correct colors/text contrast, and `Pill` renders a fully rounded badge.
- `Components/Alert` — `Info`/`Success`/`Warning`/`Error` render with the correct subtle background/border/text colors, `WithTitle` shows a bold heading, and `Dismissible` shows a working close button that hides the alert.
- `Components/Card` — `Default` shows title+subtitle+body, and `Primary`/`Success`/`Error` show a colored top border.
- `Components/Spinner` — `Border`/`Grow` animate, `Small`/`Large` differ in size, and `Success` is colored green.

Stop the Storybook server (Ctrl+C) once verified.

- [ ] **Step 5: Manual visual check in the showcase app**

Run: `npm run serve:showcase`
Then open `http://localhost:666` and check:
- The sidebar "Components" section lists Button, Badge, Alert, Card, Spinner, each linking to a working page.
- `/components/badge`, `/components/alert`, `/components/card`, `/components/spinner` each render their example sections, code blocks, and API tables without console errors.
- On `/components/alert`, clicking the dismiss button on the "Saved" example removes the alert.

Stop the dev server (Ctrl+C) once verified.

- [ ] **Step 6: Final commit (if any fixes were needed)**

If steps 1-5 required any fixes, stage and commit them:

```bash
git add -A
git commit -m "Fix issues found during verification of new components"
```

If no fixes were needed, this step is skipped — Tasks 1-4 already committed all changes.
