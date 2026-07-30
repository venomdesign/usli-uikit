# Tabs & Accordion Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `usli-tabs`/`usli-tab` and `usli-accordion`/`usli-accordion-item` compound
components to the `ui-sdk` library, following the injection-token coordination
pattern established by `usli-radio-group`/`usli-radio`, plus Storybook stories,
showcase documentation pages, and unit tests for all four components.

**Architecture:** Each pair is a container providing an `InjectionToken` (via
`useExisting`) and an item that injects it. Selection/expansion state lives on the
container as an Angular `model()` signal (two-way bindable, no `ControlValueAccessor`
— these aren't form controls). `usli-tabs` uses a `contentChildren` signal query to
render its own header strip from projected `usli-tab` children; `usli-accordion-item`
renders its own header+body inline (mirroring `usli-radio`), so `usli-accordion`
itself is a thin content-projection wrapper.

**Tech Stack:** Angular 21 standalone components, signals (`input`, `model`,
`computed`, `contentChildren`, `viewChildren`, `effect`), Bootstrap 5 CSS classes
(no Bootstrap JS), Vitest, Storybook 10.

**Reference spec:** `docs/superpowers/specs/2026-07-30-tabs-accordion-components-design.md`

---

## Before you start

- Run `npx ng test ui-sdk --watch=false` once to see the current baseline. As of
  this writing there are **5 pre-existing failing test files** (35 failing tests) in
  `usli-form-field`/`usli-input`/etc., unrelated to this work — do not try to fix
  them. Your new spec files must pass; the pre-existing failures are out of scope.
- Scope test runs to just the files you're adding with `--include`, e.g.:
  `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs`
- All new library files live under `projects/ui-sdk/src/lib/components/`. All new
  showcase files live under `projects/showcase/src/app/pages/components/`.

---

## Task 1: Tabs — injection token

**Files:**
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tabs.token.ts`

No test needed — this is a type-only declaration with no runtime logic (same as
`radio-group.token.ts`).

- [ ] **Step 1: Create the token file**

```ts
import { InjectionToken, Signal } from '@angular/core';

export interface UsliTabsControl {
  readonly value: Signal<unknown>;
  select(value: unknown): void;
}

export const USLI_TABS = new InjectionToken<UsliTabsControl>('USLI_TABS');
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-sdk/src/lib/components/tabs/usli-tabs.token.ts
git commit -m "feat(tabs): add usli-tabs injection token"
```

---

## Task 2: Tabs — `usli-tab` (leaf) component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tab/usli-tab.component.ts`
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tab/usli-tab.component.html`
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tab/usli-tab.component.scss`
- Test: `projects/ui-sdk/src/lib/components/tabs/usli-tab/usli-tab.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { USLI_TABS, type UsliTabsControl } from '../usli-tabs.token';
import { UsliTabComponent } from './usli-tab.component';

describe('UsliTabComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let activeValue: ReturnType<typeof signal<unknown>>;

  beforeEach(async () => {
    activeValue = signal<unknown>('a');
    const mockGroup: UsliTabsControl = {
      value: activeValue,
      select: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [{ provide: USLI_TABS, useValue: mockGroup }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('renders projected content when its value matches the active value', () => {
    const panel = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(panel?.textContent?.trim()).toBe('Content A');
  });

  it('does not render when its value does not match the active value', () => {
    activeValue.set('b');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')).toBeNull();
  });

  it('sets aria-labelledby on the panel to its own tabId', () => {
    const panel: HTMLElement = fixture.nativeElement.querySelector('[role="tabpanel"]');
    const instance = fixture.debugElement.children[0].componentInstance as UsliTabComponent;
    expect(panel.getAttribute('aria-labelledby')).toBe(instance.tabId);
    expect(panel.id).toBe(instance.panelId);
  });
});

@Component({
  standalone: true,
  imports: [UsliTabComponent],
  template: `<usli-tab value="a" label="Tab A">Content A</usli-tab>`,
})
class TestHost {}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs`
Expected: FAIL — `usli-tab.component.ts` (and its template/style) don't exist yet.

- [ ] **Step 3: Write the component**

`usli-tab.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { USLI_TABS } from '../usli-tabs.token';

let uid = 0;

@Component({
  selector: 'usli-tab',
  standalone: true,
  templateUrl: './usli-tab.component.html',
  styleUrl: './usli-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliTabComponent {
  /** Unique value identifying this tab within its usli-tabs parent */
  value = input.required<unknown>();

  /** Text shown in the tab's header button */
  label = input.required<string>();

  /** Prevents selection via click or keyboard navigation */
  disabled = input(false);

  private readonly id = uid++;

  /** id of this tab's header button — read by usli-tabs for aria-controls */
  readonly tabId = `usli-tab-${this.id}`;

  /** id of this tab's content panel — read by usli-tabs for aria-controls */
  readonly panelId = `usli-tab-panel-${this.id}`;

  private readonly group = inject(USLI_TABS);

  protected isActive = computed(() => this.group.value() === this.value());
}
```

`usli-tab.component.html`:

```html
@if (isActive()) {
  <div role="tabpanel" [id]="panelId" [attr.aria-labelledby]="tabId" class="usli-tab">
    <ng-content />
  </div>
}
```

`usli-tab.component.scss`:

```scss
:host {
  display: contents;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add projects/ui-sdk/src/lib/components/tabs/usli-tab
git commit -m "feat(tabs): add usli-tab leaf component"
```

---

## Task 3: Tabs — `usli-tabs` (container) component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tabs/usli-tabs.component.ts`
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tabs/usli-tabs.component.html`
- Create: `projects/ui-sdk/src/lib/components/tabs/usli-tabs/usli-tabs.component.scss`
- Test: `projects/ui-sdk/src/lib/components/tabs/usli-tabs/usli-tabs.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsliTabsComponent } from './usli-tabs.component';
import { UsliTabComponent } from '../usli-tab/usli-tab.component';

@Component({
  standalone: true,
  imports: [UsliTabsComponent, UsliTabComponent],
  template: `
    <usli-tabs [(value)]="active">
      <usli-tab value="a" label="Tab A">Content A</usli-tab>
      <usli-tab value="b" label="Tab B">Content B</usli-tab>
      <usli-tab value="c" label="Tab C" [disabled]="true">Content C</usli-tab>
    </usli-tabs>
  `,
})
class TestHost {
  active: unknown = undefined;
}

describe('UsliTabsComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // A second pass flushes the constructor effect that defaults `value` to the
    // first non-disabled tab (its `.set()` schedules a follow-up CD pass).
    fixture.detectChanges();
  });

  function tabButtons(): NodeListOf<HTMLButtonElement> {
    return fixture.nativeElement.querySelectorAll('[role="tab"]');
  }

  it('defaults to the first non-disabled tab', () => {
    expect(host.active).toBe('a');
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')?.textContent?.trim()).toBe(
      'Content A',
    );
  });

  it('renders a nav header button per tab', () => {
    expect(tabButtons().length).toBe(3);
  });

  it('disables the third tab button', () => {
    expect(tabButtons()[2].disabled).toBe(true);
  });

  it('selects a tab on click and updates the bound value', () => {
    tabButtons()[1].click();
    fixture.detectChanges();
    expect(host.active).toBe('b');
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')?.textContent?.trim()).toBe(
      'Content B',
    );
  });

  it('marks the active tab button with aria-selected="true"', () => {
    expect(tabButtons()[0].getAttribute('aria-selected')).toBe('true');
    expect(tabButtons()[1].getAttribute('aria-selected')).toBe('false');
  });

  it('moves selection to the next enabled tab on ArrowRight, wrapping past disabled tabs', () => {
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });

  it('moves selection to the previous tab on ArrowLeft', () => {
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });

  it('moves focus to the target tab button on arrow-key navigation', () => {
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabButtons()[0]);
  });

  it('jumps to the last enabled tab on End', () => {
    tabButtons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(host.active).toBe('b');
  });

  it('jumps to the first tab on Home', () => {
    tabButtons()[1].click();
    fixture.detectChanges();
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs`
Expected: FAIL — `usli-tabs.component.ts` doesn't exist yet.

- [ ] **Step 3: Write the component**

`usli-tabs.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChildren,
  effect,
  input,
  model,
  viewChildren,
} from '@angular/core';
import type { ButtonVariant } from '../../button';
import { USLI_TABS, type UsliTabsControl } from '../usli-tabs.token';
import { UsliTabComponent } from '../usli-tab/usli-tab.component';

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'] as const;
type ArrowKey = (typeof ARROW_KEYS)[number];

@Component({
  selector: 'usli-tabs',
  standalone: true,
  templateUrl: './usli-tabs.component.html',
  styleUrl: './usli-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_TABS, useExisting: UsliTabsComponent }],
})
export class UsliTabsComponent implements UsliTabsControl {
  /** Two-way bindable via [(value)]. Defaults to the first non-disabled tab. */
  value = model<unknown>(undefined);

  /** Optional accent color for the active tab underline */
  variant = input<ButtonVariant | undefined>();

  protected tabs = contentChildren(UsliTabComponent);
  protected tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected classes = computed(() => {
    const v = this.variant();
    return v ? `usli-tabs usli-tabs--${v}` : 'usli-tabs';
  });

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (this.value() !== undefined || tabs.length === 0) return;
      const firstEnabled = tabs.find((tab) => !tab.disabled());
      if (firstEnabled) this.value.set(firstEnabled.value());
    });
  }

  select(value: unknown): void {
    this.value.set(value);
  }

  protected onKeydown(event: KeyboardEvent, tab: UsliTabComponent): void {
    if (!(ARROW_KEYS as readonly string[]).includes(event.key)) return;
    event.preventDefault();

    const all = this.tabs();
    const enabled = all.filter((t) => !t.disabled());
    if (enabled.length === 0) return;

    const key = event.key as ArrowKey;
    const currentEnabledIndex = enabled.indexOf(tab);
    let targetIndex: number;
    if (key === 'Home') targetIndex = 0;
    else if (key === 'End') targetIndex = enabled.length - 1;
    else if (key === 'ArrowLeft')
      targetIndex = (currentEnabledIndex - 1 + enabled.length) % enabled.length;
    else targetIndex = (currentEnabledIndex + 1) % enabled.length;

    const targetTab = enabled[targetIndex];
    this.select(targetTab.value());
    this.tabButtons()[all.indexOf(targetTab)]?.nativeElement.focus();
  }
}
```

`usli-tabs.component.html`:

```html
<div [class]="classes()">
  <ul class="nav nav-tabs" role="tablist">
    @for (tab of tabs(); track tab.value()) {
      <li class="nav-item" role="presentation">
        <button
          #tabButton
          type="button"
          class="nav-link"
          role="tab"
          [class.active]="tab.value() === value()"
          [disabled]="tab.disabled()"
          [attr.aria-selected]="tab.value() === value()"
          [attr.aria-controls]="tab.panelId"
          [id]="tab.tabId"
          (click)="select(tab.value())"
          (keydown)="onKeydown($event, tab)"
        >
          {{ tab.label() }}
        </button>
      </li>
    }
  </ul>
  <div class="tab-content">
    <ng-content />
  </div>
</div>
```

`usli-tabs.component.scss`:

```scss
:host {
  display: block;
}

.usli-tabs {
  font-family: var(--font-roboto, 'Roboto', sans-serif);
}

// Per-variant accent for the active tab's underline + label — same accent
// palette as usli-card's border-top-color (see usli-card.component.scss).
.usli-tabs--primary .nav-link.active {
  color: var(--blue-500, #00338e);
  border-bottom-color: var(--blue-500, #00338e);
}

.usli-tabs--secondary .nav-link.active {
  color: var(--blue-300, #4d78c9);
  border-bottom-color: var(--blue-300, #4d78c9);
}

.usli-tabs--tertiary .nav-link.active {
  color: var(--gray-600, #757575);
  border-bottom-color: var(--gray-400, #bdbdbd);
}

.usli-tabs--error .nav-link.active {
  color: var(--error-500, #b10505);
  border-bottom-color: var(--error-500, #b10505);
}

.usli-tabs--warning .nav-link.active {
  color: var(--warning-700, #997800);
  border-bottom-color: var(--warning-500, #efc100);
}

.usli-tabs--info .nav-link.active {
  color: var(--info-600, #4996e3);
  border-bottom-color: var(--info-600, #4996e3);
}

.usli-tabs--success .nav-link.active {
  color: var(--success-500, #14661a);
  border-bottom-color: var(--success-500, #14661a);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs`
Expected: PASS (all tests in both `usli-tab` and `usli-tabs` spec files — 13 total)

- [ ] **Step 5: Commit**

```bash
git add projects/ui-sdk/src/lib/components/tabs/usli-tabs
git commit -m "feat(tabs): add usli-tabs container component"
```

---

## Task 4: Tabs — barrel exports

**Files:**
- Create: `projects/ui-sdk/src/lib/components/tabs/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`

- [ ] **Step 1: Create the tabs barrel**

```ts
export * from './usli-tabs.token';
export * from './usli-tabs/usli-tabs.component';
export * from './usli-tab/usli-tab.component';
```

- [ ] **Step 2: Add it to the top-level components barrel**

In `projects/ui-sdk/src/lib/components/index.ts`, add a new line after
`export * from './forms';`:

```ts
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
export * from './spinner';
export * from './forms';
export * from './tabs';
```

- [ ] **Step 3: Verify the library still builds**

Run: `npx ng build ui-sdk`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-sdk/src/lib/components/tabs/index.ts projects/ui-sdk/src/lib/components/index.ts
git commit -m "feat(tabs): export usli-tabs and usli-tab from the library barrel"
```

---

## Task 5: Accordion — injection token

**Files:**
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion.token.ts`

No test needed — type-only declaration, same rationale as Task 1.

- [ ] **Step 1: Create the token file**

```ts
import { InjectionToken, Signal } from '@angular/core';
import type { ButtonVariant } from '../button';

export interface UsliAccordionControl {
  readonly variant: Signal<ButtonVariant | undefined>;
  isExpanded(value: unknown): boolean;
  toggle(value: unknown): void;
}

export const USLI_ACCORDION = new InjectionToken<UsliAccordionControl>('USLI_ACCORDION');
```

- [ ] **Step 2: Commit**

```bash
git add projects/ui-sdk/src/lib/components/accordion/usli-accordion.token.ts
git commit -m "feat(accordion): add usli-accordion injection token"
```

---

## Task 6: Accordion — `usli-accordion-item` (leaf) component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion-item/usli-accordion-item.component.ts`
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion-item/usli-accordion-item.component.html`
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion-item/usli-accordion-item.component.scss`
- Test: `projects/ui-sdk/src/lib/components/accordion/usli-accordion-item/usli-accordion-item.component.spec.ts`

Note: the variant accent (left border + active header color) is styled here, in the
item's own stylesheet — not in `usli-accordion`'s — because `.accordion-item` /
`.accordion-button` live inside this component's template. Styling them from the
parent's stylesheet would require piercing Angular's view encapsulation; reading
`group.variant()` here avoids that entirely.

- [ ] **Step 1: Write the failing test**

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { USLI_ACCORDION, type UsliAccordionControl } from '../usli-accordion.token';
import { UsliAccordionItemComponent } from './usli-accordion-item.component';

@Component({
  standalone: true,
  imports: [UsliAccordionItemComponent],
  template: `<usli-accordion-item value="a" label="Item A">Body A</usli-accordion-item>`,
})
class TestHost {}

async function setup(isExpanded: boolean) {
  const mockGroup: UsliAccordionControl = {
    variant: () => undefined,
    isExpanded: vi.fn().mockReturnValue(isExpanded),
    toggle: vi.fn(),
  };

  await TestBed.configureTestingModule({
    imports: [TestHost],
    providers: [{ provide: USLI_ACCORDION, useValue: mockGroup }],
  }).compileComponents();

  const fixture: ComponentFixture<TestHost> = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  return { fixture, mockGroup };
}

describe('UsliAccordionItemComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders collapsed when the group reports it is not expanded', async () => {
    const { fixture } = await setup(false);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.accordion-button');
    expect(button.classList.contains('collapsed')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders expanded when the group reports it is expanded', async () => {
    const { fixture } = await setup(true);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.accordion-button');
    const collapse: HTMLElement = fixture.nativeElement.querySelector('.accordion-collapse');
    expect(button.classList.contains('collapsed')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(collapse.classList.contains('show')).toBe(true);
  });

  it('calls group.toggle with its own value when the header button is clicked', async () => {
    const { fixture, mockGroup } = await setup(false);
    fixture.nativeElement.querySelector('.accordion-button').click();
    expect(mockGroup.toggle).toHaveBeenCalledWith('a');
  });

  it('links the header button and panel via aria-controls / id', async () => {
    const { fixture } = await setup(false);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.accordion-button');
    const collapse: HTMLElement = fixture.nativeElement.querySelector('.accordion-collapse');
    expect(button.getAttribute('aria-controls')).toBe(collapse.id);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/accordion`
Expected: FAIL — `usli-accordion-item.component.ts` doesn't exist yet.

- [ ] **Step 3: Write the component**

`usli-accordion-item.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { USLI_ACCORDION } from '../usli-accordion.token';

let uid = 0;

@Component({
  selector: 'usli-accordion-item',
  standalone: true,
  templateUrl: './usli-accordion-item.component.html',
  styleUrl: './usli-accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliAccordionItemComponent {
  /** Unique value identifying this item within its usli-accordion parent */
  value = input.required<unknown>();

  /** Text shown in the item's header button */
  label = input.required<string>();

  /** Prevents expansion via click */
  disabled = input(false);

  protected readonly panelId = `usli-accordion-panel-${uid++}`;

  private readonly group = inject(USLI_ACCORDION);

  protected isOpen = computed(() => this.group.isExpanded(this.value()));

  protected classes = computed(() => {
    const v = this.group.variant();
    return v ? `accordion-item usli-accordion-item--${v}` : 'accordion-item';
  });

  protected toggle(): void {
    this.group.toggle(this.value());
  }
}
```

`usli-accordion-item.component.html`:

```html
<div [class]="classes()">
  <h2 class="accordion-header">
    <button
      type="button"
      class="accordion-button"
      [class.collapsed]="!isOpen()"
      [disabled]="disabled()"
      [attr.aria-expanded]="isOpen()"
      [attr.aria-controls]="panelId"
      (click)="toggle()"
    >
      {{ label() }}
    </button>
  </h2>
  <div class="accordion-collapse" [class.show]="isOpen()" [id]="panelId" role="region">
    <div class="accordion-body">
      <ng-content />
    </div>
  </div>
</div>
```

`usli-accordion-item.component.scss`:

```scss
// Per-variant accent for the expanded panel — same accent palette as
// usli-card's border-top-color (see usli-card.component.scss).
.usli-accordion-item--primary {
  border-left: 3px solid var(--blue-500, #00338e);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--blue-500, #00338e);
    --bs-accordion-active-bg: var(--blue-50, #e3e9f6);
  }
}

.usli-accordion-item--secondary {
  border-left: 3px solid var(--blue-300, #4d78c9);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--blue-300, #4d78c9);
    --bs-accordion-active-bg: var(--blue-50, #e3e9f6);
  }
}

.usli-accordion-item--tertiary {
  border-left: 3px solid var(--gray-400, #bdbdbd);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--gray-600, #757575);
    --bs-accordion-active-bg: var(--gray-100, #f5f5f5);
  }
}

.usli-accordion-item--error {
  border-left: 3px solid var(--error-500, #b10505);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--error-500, #b10505);
    --bs-accordion-active-bg: var(--error-50, #fff0f0);
  }
}

.usli-accordion-item--warning {
  border-left: 3px solid var(--warning-500, #efc100);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--warning-700, #997800);
    --bs-accordion-active-bg: var(--warning-50, #fffde7);
  }
}

.usli-accordion-item--info {
  border-left: 3px solid var(--info-600, #4996e3);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--info-600, #4996e3);
    --bs-accordion-active-bg: var(--info-50, #e8f4ff);
  }
}

.usli-accordion-item--success {
  border-left: 3px solid var(--success-500, #14661a);

  .accordion-button:not(.collapsed) {
    --bs-accordion-active-color: var(--success-500, #14661a);
    --bs-accordion-active-bg: var(--success-50, #edfaee);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/accordion`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add projects/ui-sdk/src/lib/components/accordion/usli-accordion-item
git commit -m "feat(accordion): add usli-accordion-item leaf component"
```

---

## Task 7: Accordion — `usli-accordion` (container) component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion/usli-accordion.component.ts`
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion/usli-accordion.component.html`
- Create: `projects/ui-sdk/src/lib/components/accordion/usli-accordion/usli-accordion.component.scss`
- Test: `projects/ui-sdk/src/lib/components/accordion/usli-accordion/usli-accordion.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsliAccordionComponent } from './usli-accordion.component';
import { UsliAccordionItemComponent } from '../usli-accordion-item/usli-accordion-item.component';

@Component({
  standalone: true,
  imports: [UsliAccordionComponent, UsliAccordionItemComponent],
  template: `
    <usli-accordion [multiple]="multiple" [(expanded)]="expanded">
      <usli-accordion-item value="a" label="Item A">Body A</usli-accordion-item>
      <usli-accordion-item value="b" label="Item B">Body B</usli-accordion-item>
    </usli-accordion>
  `,
})
class TestHost {
  multiple = false;
  expanded: unknown = undefined;
}

describe('UsliAccordionComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function itemButtons(): NodeListOf<HTMLButtonElement> {
    return fixture.nativeElement.querySelectorAll('.accordion-button');
  }

  it('renders both items collapsed by default', () => {
    expect(itemButtons()[0].classList.contains('collapsed')).toBe(true);
    expect(itemButtons()[1].classList.contains('collapsed')).toBe(true);
  });

  it('single mode: opening one item closes the other', () => {
    itemButtons()[0].click();
    fixture.detectChanges();
    expect(host.expanded).toBe('a');

    itemButtons()[1].click();
    fixture.detectChanges();
    expect(host.expanded).toBe('b');
    expect(itemButtons()[0].classList.contains('collapsed')).toBe(true);
  });

  it('single mode: clicking the open item collapses it back to none', () => {
    itemButtons()[0].click();
    fixture.detectChanges();
    itemButtons()[0].click();
    fixture.detectChanges();
    expect(host.expanded).toBeUndefined();
  });

  it('multiple mode: both items can be open at once', () => {
    host.multiple = true;
    fixture.detectChanges();

    itemButtons()[0].click();
    fixture.detectChanges();
    itemButtons()[1].click();
    fixture.detectChanges();

    expect(host.expanded).toEqual(['a', 'b']);
    expect(itemButtons()[0].classList.contains('collapsed')).toBe(false);
    expect(itemButtons()[1].classList.contains('collapsed')).toBe(false);
  });

  it('multiple mode: clicking an open item removes just that value', () => {
    host.multiple = true;
    host.expanded = ['a', 'b'];
    fixture.detectChanges();

    itemButtons()[0].click();
    fixture.detectChanges();

    expect(host.expanded).toEqual(['b']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/accordion`
Expected: FAIL — `usli-accordion.component.ts` doesn't exist yet.

- [ ] **Step 3: Write the component**

`usli-accordion.component.ts`:

```ts
import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { ButtonVariant } from '../../button';
import { USLI_ACCORDION, type UsliAccordionControl } from '../usli-accordion.token';

@Component({
  selector: 'usli-accordion',
  standalone: true,
  templateUrl: './usli-accordion.component.html',
  styleUrl: './usli-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_ACCORDION, useExisting: UsliAccordionComponent }],
})
export class UsliAccordionComponent implements UsliAccordionControl {
  /** Allows more than one panel to be expanded at once */
  multiple = input(false);

  /**
   * Two-way bindable via [(expanded)]. A single value in single-open mode
   * (the default), or an array of values when multiple is true.
   */
  expanded = model<unknown | unknown[]>(undefined);

  /** Optional accent color applied to each item's expanded state */
  variant = input<ButtonVariant | undefined>();

  isExpanded(value: unknown): boolean {
    if (this.multiple()) {
      return ((this.expanded() as unknown[]) ?? []).includes(value);
    }
    return this.expanded() === value;
  }

  toggle(value: unknown): void {
    if (this.multiple()) {
      const current = (this.expanded() as unknown[]) ?? [];
      this.expanded.set(
        current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      );
    } else {
      this.expanded.set(this.expanded() === value ? undefined : value);
    }
  }
}
```

`usli-accordion.component.html`:

```html
<div class="usli-accordion accordion">
  <ng-content />
</div>
```

`usli-accordion.component.scss`:

```scss
:host {
  display: block;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/accordion`
Expected: PASS (all tests in both `usli-accordion-item` and `usli-accordion` spec
files — 9 total)

- [ ] **Step 5: Commit**

```bash
git add projects/ui-sdk/src/lib/components/accordion/usli-accordion
git commit -m "feat(accordion): add usli-accordion container component"
```

---

## Task 8: Accordion — barrel exports

**Files:**
- Create: `projects/ui-sdk/src/lib/components/accordion/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`

- [ ] **Step 1: Create the accordion barrel**

```ts
export * from './usli-accordion.token';
export * from './usli-accordion/usli-accordion.component';
export * from './usli-accordion-item/usli-accordion-item.component';
```

- [ ] **Step 2: Add it to the top-level components barrel**

`projects/ui-sdk/src/lib/components/index.ts` becomes:

```ts
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
export * from './spinner';
export * from './forms';
export * from './tabs';
export * from './accordion';
```

- [ ] **Step 3: Verify the library builds and all new tests still pass**

Run: `npx ng build ui-sdk`
Expected: Build succeeds.

Run: `npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs --include projects/ui-sdk/src/lib/components/accordion`
Expected: PASS (22 tests total across both feature directories)

- [ ] **Step 4: Commit**

```bash
git add projects/ui-sdk/src/lib/components/accordion/index.ts projects/ui-sdk/src/lib/components/index.ts
git commit -m "feat(accordion): export usli-accordion and usli-accordion-item from the library barrel"
```

---

## Task 9: Storybook — Tabs stories

**Files:**
- Create: `projects/ui-sdk/src/stories/tabs.stories.ts`

- [ ] **Step 1: Create the stories file**

```ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UsliTabsComponent, UsliTabComponent } from 'ui-sdk';

const IMPORTS = [UsliTabComponent];

const meta: Meta<UsliTabsComponent> = {
  component: UsliTabsComponent,
  title: 'Components/Tabs',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: IMPORTS })],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<UsliTabsComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <usli-tabs [variant]="variant">
        <usli-tab value="account" label="Account">Account settings content.</usli-tab>
        <usli-tab value="billing" label="Billing">Billing settings content.</usli-tab>
        <usli-tab value="notifications" label="Notifications" [disabled]="true">
          Notifications content.
        </usli-tab>
      </usli-tabs>
    `,
  }),
};

export const Primary: Story = { ...Default, args: { variant: 'primary' } };
export const Success: Story = { ...Default, args: { variant: 'success' } };
export const Error: Story = { ...Default, args: { variant: 'error' } };
```

- [ ] **Step 2: Verify Storybook builds**

Run: `npx ng run ui-sdk:build-storybook`
Expected: Build succeeds, no errors referencing `tabs.stories.ts`.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-sdk/src/stories/tabs.stories.ts
git commit -m "docs(tabs): add Storybook stories for usli-tabs"
```

---

## Task 10: Storybook — Accordion stories

**Files:**
- Create: `projects/ui-sdk/src/stories/accordion.stories.ts`

- [ ] **Step 1: Create the stories file**

```ts
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UsliAccordionComponent, UsliAccordionItemComponent } from 'ui-sdk';

const IMPORTS = [UsliAccordionItemComponent];

const meta: Meta<UsliAccordionComponent> = {
  component: UsliAccordionComponent,
  title: 'Components/Accordion',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: IMPORTS })],
  argTypes: {
    multiple: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<UsliAccordionComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <usli-accordion [multiple]="multiple" [variant]="variant">
        <usli-accordion-item value="a" label="What is USLI UI Kit?">
          A shared Angular component library built on Bootstrap.
        </usli-accordion-item>
        <usli-accordion-item value="b" label="How do I install it?">
          Add the ui-sdk package as a dependency and import the components you need.
        </usli-accordion-item>
        <usli-accordion-item value="c" label="Is it themeable?">
          Yes — components accept a variant input matching the Button color palette.
        </usli-accordion-item>
      </usli-accordion>
    `,
  }),
};

export const Multiple: Story = { ...Default, args: { multiple: true } };
export const PrimaryVariant: Story = { ...Default, args: { variant: 'primary' } };
```

- [ ] **Step 2: Verify Storybook builds**

Run: `npx ng run ui-sdk:build-storybook`
Expected: Build succeeds, no errors referencing `accordion.stories.ts`.

- [ ] **Step 3: Commit**

```bash
git add projects/ui-sdk/src/stories/accordion.stories.ts
git commit -m "docs(accordion): add Storybook stories for usli-accordion"
```

---

## Task 11: Showcase — Tabs docs page

**Files:**
- Create: `projects/showcase/src/app/pages/components/tabs/tabs-docs.ts`
- Create: `projects/showcase/src/app/pages/components/tabs/tabs-docs.html`
- Create: `projects/showcase/src/app/pages/components/tabs/tabs-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create the docs component**

`tabs-docs.ts`:

```ts
import { Component } from '@angular/core';
import { UsliTabsComponent, UsliTabComponent } from 'ui-sdk';

@Component({
  selector: 'app-tabs-docs',
  standalone: true,
  imports: [UsliTabsComponent, UsliTabComponent],
  templateUrl: './tabs-docs.html',
  styleUrl: './tabs-docs.scss',
})
export class TabsDocs {}
```

`tabs-docs.scss`:

```scss
@use '../../docs-page';
```

`tabs-docs.html`:

```html
<div class="page">

  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Tabs</span>
    </nav>
    <h1 class="page-title">Tabs</h1>
    <p class="page-lead">
      Switch between panels of content. Project <code>usli-tab</code> children into
      <code>usli-tabs</code>, each keyed by a unique value.
    </p>
  </header>

  <section class="section">
    <h2 class="section__title">Basic usage</h2>
    <p class="section__desc">
      The first non-disabled tab is selected by default. Bind
      <code>[(value)]</code> to control selection from outside, or leave it
      uncontrolled. Left/Right/Home/End arrow keys move both focus and selection.
    </p>
    <div class="example-box">
      <usli-tabs>
        <usli-tab value="account" label="Account">Account settings content.</usli-tab>
        <usli-tab value="billing" label="Billing">Billing settings content.</usli-tab>
        <usli-tab value="notifications" label="Notifications" [disabled]="true">
          Notifications content.
        </usli-tab>
      </usli-tabs>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-tabs&gt;
  &lt;usli-tab value="account" label="Account"&gt;Account settings content.&lt;/usli-tab&gt;
  &lt;usli-tab value="billing" label="Billing"&gt;Billing settings content.&lt;/usli-tab&gt;
  &lt;usli-tab value="notifications" label="Notifications" [disabled]="true"&gt;
    Notifications content.
  &lt;/usli-tab&gt;
&lt;/usli-tabs&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">Accent variant</h2>
    <p class="section__desc">
      Set the variant input to tint the active tab's underline and label. Accepts
      the same values as Button.
    </p>
    <div class="example-box">
      <usli-tabs variant="success">
        <usli-tab value="one" label="One">First panel content.</usli-tab>
        <usli-tab value="two" label="Two">Second panel content.</usli-tab>
      </usli-tabs>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-tabs variant="success"&gt;
  &lt;usli-tab value="one" label="One"&gt;First panel content.&lt;/usli-tab&gt;
  &lt;usli-tab value="two" label="Two"&gt;Second panel content.&lt;/usli-tab&gt;
&lt;/usli-tabs&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>

    <h3 class="api-subtitle">usli-tabs</h3>
    <table class="api-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">value</span></td>
          <td><span class="prop-type">unknown</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>
            Two-way bindable via <span class="prop-name">[(value)]</span>. Defaults
            to the first non-disabled tab's value.
          </td>
        </tr>
        <tr>
          <td><span class="prop-name">variant</span></td>
          <td>
            <span class="prop-type">
              'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'info' | 'success' | undefined
            </span>
          </td>
          <td><span class="prop-default">undefined</span></td>
          <td>Optional accent color for the active tab underline.</td>
        </tr>
      </tbody>
    </table>

    <h3 class="api-subtitle api-subtitle--spaced">usli-tab</h3>
    <table class="api-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">value</span></td>
          <td><span class="prop-type">unknown</span></td>
          <td><span class="prop-default">required</span></td>
          <td>Unique value identifying this tab.</td>
        </tr>
        <tr>
          <td><span class="prop-name">label</span></td>
          <td><span class="prop-type">string</span></td>
          <td><span class="prop-default">required</span></td>
          <td>Text shown in the tab's header button.</td>
        </tr>
        <tr>
          <td><span class="prop-name">disabled</span></td>
          <td><span class="prop-type">boolean</span></td>
          <td><span class="prop-default">false</span></td>
          <td>Prevents selection via click or keyboard navigation.</td>
        </tr>
      </tbody>
    </table>
  </section>

</div>
```

- [ ] **Step 2: Add the route**

In `projects/showcase/src/app/app.routes.ts`, add this entry right before the
`components/forms/input` route (anywhere in the `components/*` group is fine, but
keep it before the trailing `{ path: '**', redirectTo: '' }`):

```ts
  {
    path: 'components/tabs',
    loadComponent: () => import('./pages/components/tabs/tabs-docs').then(m => m.TabsDocs),
  },
```

- [ ] **Step 3: Add the sidebar entry**

In `projects/showcase/src/app/layout/sidebar/sidebar.ts`, add a new item to the
`'Components'` section's `items` array, after `'Spinner'` and before the
`'Form Elements'` nested group:

```ts
        { label: 'Spinner', path: '/components/spinner' },
        { label: 'Tabs',    path: '/components/tabs' },
        {
          label: 'Form Elements',
```

- [ ] **Step 4: Verify the showcase app builds and the route renders**

Run: `npx ng build showcase`
Expected: Build succeeds.

Run: `npx ng serve showcase --port 4300` (leave running), then open
`http://localhost:4300/components/tabs` in a browser and confirm:
- Three tabs render, "Account" is selected by default
- Clicking "Billing" switches the panel
- "Notifications" is visibly disabled and not selectable
- The second "Accent variant" example shows a green (success) active-tab underline
Stop the server afterward.

- [ ] **Step 5: Commit**

```bash
git add projects/showcase/src/app/pages/components/tabs projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "docs(tabs): add showcase documentation page for usli-tabs"
```

---

## Task 12: Showcase — Accordion docs page

**Files:**
- Create: `projects/showcase/src/app/pages/components/accordion/accordion-docs.ts`
- Create: `projects/showcase/src/app/pages/components/accordion/accordion-docs.html`
- Create: `projects/showcase/src/app/pages/components/accordion/accordion-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create the docs component**

`accordion-docs.ts`:

```ts
import { Component } from '@angular/core';
import { UsliAccordionComponent, UsliAccordionItemComponent } from 'ui-sdk';

@Component({
  selector: 'app-accordion-docs',
  standalone: true,
  imports: [UsliAccordionComponent, UsliAccordionItemComponent],
  templateUrl: './accordion-docs.html',
  styleUrl: './accordion-docs.scss',
})
export class AccordionDocs {}
```

`accordion-docs.scss`:

```scss
@use '../../docs-page';
```

`accordion-docs.html`:

```html
<div class="page">

  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Accordion</span>
    </nav>
    <h1 class="page-title">Accordion</h1>
    <p class="page-lead">
      Collapsible stacked sections. Project <code>usli-accordion-item</code>
      children into <code>usli-accordion</code>, each keyed by a unique value.
    </p>
  </header>

  <section class="section">
    <h2 class="section__title">Basic usage</h2>
    <p class="section__desc">
      By default only one panel can be open at a time — opening a new one closes
      the previous. Bind <code>[(expanded)]</code> to control it from outside.
    </p>
    <div class="example-box">
      <usli-accordion>
        <usli-accordion-item value="a" label="What is USLI UI Kit?">
          A shared Angular component library built on Bootstrap.
        </usli-accordion-item>
        <usli-accordion-item value="b" label="How do I install it?">
          Add the ui-sdk package as a dependency and import the components you need.
        </usli-accordion-item>
        <usli-accordion-item value="c" label="Is it themeable?">
          Yes — components accept a variant input matching the Button color palette.
        </usli-accordion-item>
      </usli-accordion>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-accordion&gt;
  &lt;usli-accordion-item value="a" label="What is USLI UI Kit?"&gt;
    A shared Angular component library built on Bootstrap.
  &lt;/usli-accordion-item&gt;
  &lt;usli-accordion-item value="b" label="How do I install it?"&gt;
    Add the ui-sdk package as a dependency and import the components you need.
  &lt;/usli-accordion-item&gt;
&lt;/usli-accordion&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">Multiple mode</h2>
    <p class="section__desc">
      Set <code>multiple</code> to allow more than one panel open at once. The
      bound value becomes an array of the open panels' values.
    </p>
    <div class="example-box">
      <usli-accordion [multiple]="true" variant="primary">
        <usli-accordion-item value="x" label="First panel">
          Panels can be opened independently in multiple mode.
        </usli-accordion-item>
        <usli-accordion-item value="y" label="Second panel">
          This panel stays open even if you open another one.
        </usli-accordion-item>
      </usli-accordion>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-accordion [multiple]="true" variant="primary"&gt;
  &lt;usli-accordion-item value="x" label="First panel"&gt;
    Panels can be opened independently in multiple mode.
  &lt;/usli-accordion-item&gt;
  &lt;usli-accordion-item value="y" label="Second panel"&gt;
    This panel stays open even if you open another one.
  &lt;/usli-accordion-item&gt;
&lt;/usli-accordion&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>

    <h3 class="api-subtitle">usli-accordion</h3>
    <table class="api-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">multiple</span></td>
          <td><span class="prop-type">boolean</span></td>
          <td><span class="prop-default">false</span></td>
          <td>Allows more than one panel to be expanded at once.</td>
        </tr>
        <tr>
          <td><span class="prop-name">expanded</span></td>
          <td><span class="prop-type">unknown | unknown[]</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>
            Two-way bindable via <span class="prop-name">[(expanded)]</span>. A
            single value in single-open mode, or an array of values when
            <span class="prop-name">multiple</span> is true.
          </td>
        </tr>
        <tr>
          <td><span class="prop-name">variant</span></td>
          <td>
            <span class="prop-type">
              'primary' | 'secondary' | 'tertiary' | 'error' | 'warning' | 'info' | 'success' | undefined
            </span>
          </td>
          <td><span class="prop-default">undefined</span></td>
          <td>Optional accent color applied to each item's expanded state.</td>
        </tr>
      </tbody>
    </table>

    <h3 class="api-subtitle api-subtitle--spaced">usli-accordion-item</h3>
    <table class="api-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">value</span></td>
          <td><span class="prop-type">unknown</span></td>
          <td><span class="prop-default">required</span></td>
          <td>Unique value identifying this item.</td>
        </tr>
        <tr>
          <td><span class="prop-name">label</span></td>
          <td><span class="prop-type">string</span></td>
          <td><span class="prop-default">required</span></td>
          <td>Text shown in the item's header button.</td>
        </tr>
        <tr>
          <td><span class="prop-name">disabled</span></td>
          <td><span class="prop-type">boolean</span></td>
          <td><span class="prop-default">false</span></td>
          <td>Prevents expansion via click.</td>
        </tr>
      </tbody>
    </table>
  </section>

</div>
```

- [ ] **Step 2: Add the route**

In `projects/showcase/src/app/app.routes.ts`, add (before the trailing wildcard
route):

```ts
  {
    path: 'components/accordion',
    loadComponent: () =>
      import('./pages/components/accordion/accordion-docs').then(m => m.AccordionDocs),
  },
```

- [ ] **Step 3: Add the sidebar entry**

In `projects/showcase/src/app/layout/sidebar/sidebar.ts`, add after the `'Tabs'`
entry added in Task 11:

```ts
        { label: 'Tabs',      path: '/components/tabs' },
        { label: 'Accordion', path: '/components/accordion' },
        {
          label: 'Form Elements',
```

- [ ] **Step 4: Verify the showcase app builds and the route renders**

Run: `npx ng build showcase`
Expected: Build succeeds.

Run: `npx ng serve showcase --port 4300` (leave running), then open
`http://localhost:4300/components/accordion` in a browser and confirm:
- Three items render, all collapsed
- Opening one item closes any other open item
- The "Multiple mode" example allows both panels open simultaneously, with a blue
  left-border accent on each
Stop the server afterward.

- [ ] **Step 5: Commit**

```bash
git add projects/showcase/src/app/pages/components/accordion projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "docs(accordion): add showcase documentation page for usli-accordion"
```

---

## Task 13: Final verification

- [ ] **Step 1: Run the full new-component test suite**

Run:
```bash
npx ng test ui-sdk --watch=false --include projects/ui-sdk/src/lib/components/tabs --include projects/ui-sdk/src/lib/components/accordion
```
Expected: PASS — 22 tests total (3 usli-tab + 10 usli-tabs + 4 usli-accordion-item
+ 5 usli-accordion).

- [ ] **Step 2: Confirm no regression in the rest of the suite**

Run: `npx ng test ui-sdk --watch=false`
Expected: The same 5 pre-existing test files fail with the same 35 failures noted
at the top of this plan — no *new* failures introduced. If you see failures in
files you didn't touch beyond that baseline, stop and investigate before
proceeding.

- [ ] **Step 3: Build both projects**

Run: `npx ng build ui-sdk && npx ng build showcase`
Expected: Both succeed.

- [ ] **Step 4: Build Storybook**

Run: `npx ng run ui-sdk:build-storybook`
Expected: Succeeds, includes `Components/Tabs` and `Components/Accordion`.
