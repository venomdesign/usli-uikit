# Tabs, Accordion components + Storybook stories + showcase docs

## Context

`usli-radio-group` / `usli-radio` (`projects/ui-sdk/src/lib/components/forms/`) establish
the library's compound container/item pattern:

- Standalone Angular components, `ChangeDetectionStrategy.OnPush`
- Container provides an injection token (`USLI_RADIO_GROUP`) via `useExisting`
- Item injects the token and derives its own selected/active state with a `computed`
  comparing its own `value()` against the shared signal — no registration or
  `contentChildren` query needed, since each item renders itself independently

This spec adds two more components using that same coordination pattern — **Tabs**
(`usli-tabs` + `usli-tab`) and **Accordion** (`usli-accordion` + `usli-accordion-item`)
— plus Storybook stories, showcase docs pages, and unit tests for each.

Bootstrap is loaded globally in both the ui-sdk Storybook config and the showcase app
(CSS only — no Bootstrap JS is used anywhere in this library; component behavior is
always driven by Angular signals, e.g. Alert's dismiss button). Tabs and Accordion
continue that: Bootstrap's `.nav-tabs` / `.accordion` markup and classes are reused for
styling, but all active/expanded state, ARIA attributes, and toggling are done in
Angular — no `data-bs-*` attributes, no bootstrap.bundle JS APIs, no collapse
animation (matches Alert's instant `@if` removal, no `fade`/`collapsing` transition).

## Shared conventions

- File layout per component: `projects/ui-sdk/src/lib/components/<name>/`
  - `usli-<name>.component.ts` / `.html` / `.scss` / `.spec.ts`
  - `index.ts` → `export * from './usli-<name>.component'`
- Add `export * from './<name>'` to `projects/ui-sdk/src/lib/components/index.ts`
- Both containers reuse `ButtonVariant` (imported from the button barrel) for an
  optional `variant?: ButtonVariant` input that tints the active-tab underline /
  expanded-panel accent — same "optional accent" shape as Card's `variant` input.
- Both containers are two-way bindable (`value`/`valueChange`,
  `expanded`/`expandedChange`), consistent with `usli-radio-group`'s
  `ControlValueAccessor`-free but signal-driven state model (these aren't form
  controls, so no `NgControl`/`ControlValueAccessor` involved — just plain
  `input()`/`output()` two-way binding).
- New to the codebase (neither radio-group nor any existing component needed these):
  - **`contentChildren` signal query** — `usli-tabs` uses it to read its projected
    `usli-tab` children's `label`/`value`/`disabled` so it can render its own header
    strip (`usli-accordion` does *not* need this; each `usli-accordion-item` renders
    its own header+body inline, exactly like `usli-radio`).
  - **WAI-ARIA APG roles/attributes** — `role="tablist"/"tab"/"tabpanel"` with
    `aria-selected`/`aria-controls`/`aria-labelledby` on Tabs, plus Left/Right/Home/End
    arrow-key navigation (moves both focus and selection — "automatic activation").
    Accordion uses native `<button>` headers with `aria-expanded`/`aria-controls`
    (no extra keyboard handling needed beyond native button behavior).

## Component specs

### Tabs — `usli-tabs` + `usli-tab`

**`usli-tabs.token.ts`**
```ts
export interface UsliTabsControl {
  readonly value: Signal<unknown>;
  select(value: unknown): void;
}
export const USLI_TABS = new InjectionToken<UsliTabsControl>('USLI_TABS');
```

**`usli-tabs.component.ts`**
- **Inputs**
  - `value: unknown` — default `undefined`; two-way via `valueChange: output<unknown>()`
  - `variant?: ButtonVariant` — default `undefined`
- Provides `{ provide: USLI_TABS, useExisting: UsliTabsComponent }`
- `protected tabs = contentChildren(UsliTabComponent)` — read-only, used to render
  the header strip
- If `value()` is `undefined` once `tabs()` is populated, defaults selection to the
  first non-disabled tab's `value()` (set via an `effect`)
- `select(val)`: updates the `value` model signal and emits `valueChange`
- `onKeydown(event, tab)`: Left/Right moves to the previous/next non-disabled tab
  (wrapping), Home/End jump to first/last non-disabled tab; moves both DOM focus
  (`.focus()` on the target button) and calls `select()`
- **classes**: `usli-tabs` (+ `usli-tabs--${variant}` when `variant` is set, overriding
  `.nav-tabs .nav-link.active` border-bottom-color + text color via direct properties)
- **Template**:
  ```html
  <ul class="usli-tabs nav nav-tabs" role="tablist">
    @for (tab of tabs(); track tab.value()) {
      <li class="nav-item" role="presentation">
        <button type="button" class="nav-link" role="tab"
                [class.active]="tab.value() === value()"
                [disabled]="tab.disabled()"
                [attr.aria-selected]="tab.value() === value()"
                [attr.aria-controls]="tab.panelId"
                [id]="tab.tabId"
                (click)="select(tab.value())"
                (keydown)="onKeydown($event, tab)">
          {{ tab.label() }}
        </button>
      </li>
    }
  </ul>
  <div class="tab-content"><ng-content /></div>
  ```

**`usli-tab.component.ts`**
- **Inputs**: `value = input.required<unknown>()`, `label = input.required<string>()`,
  `disabled = input(false)`
- Injects `USLI_TABS` as `group`; `protected isActive = computed(() => group.value() === this.value())`
- `tabId`/`panelId`: stable per-instance ids, generated from a module-scoped
  incrementing counter (`usli-tab-${n}` / `usli-tab-panel-${n}`) assigned once in a
  field initializer, for `aria-controls`/`aria-labelledby` wiring
- **Template**: `@if (isActive()) { <div role="tabpanel" [id]="panelId" [attr.aria-labelledby]="tabId" class="usli-tab"><ng-content /></div> }`

### Accordion — `usli-accordion` + `usli-accordion-item`

**`usli-accordion.token.ts`**
```ts
export interface UsliAccordionControl {
  readonly multiple: Signal<boolean>;
  isExpanded(value: unknown): boolean;
  toggle(value: unknown): void;
}
export const USLI_ACCORDION = new InjectionToken<UsliAccordionControl>('USLI_ACCORDION');
```

**`usli-accordion.component.ts`**
- **Inputs**
  - `multiple: boolean` — default `false`
  - `expanded: unknown | unknown[]` — default `undefined`; two-way via
    `expandedChange: output<unknown | unknown[]>()`. Single value in single-mode,
    array of values in multiple-mode.
  - `variant?: ButtonVariant` — default `undefined`
- Provides `{ provide: USLI_ACCORDION, useExisting: UsliAccordionComponent }`
- `isExpanded(value)`: `multiple()` ? `(expanded() as unknown[] ?? []).includes(value)`
  : `expanded() === value`
- `toggle(value)`:
  - single mode → sets `expanded` to `value`, or `undefined` if that value is already
    expanded (collapsing to fully-closed is allowed)
  - multiple mode → adds `value` to the array if absent, removes it if present
  - both branches emit `expandedChange` with the new value
- **classes**: `usli-accordion accordion` (+ `usli-accordion--${variant}` when
  `variant` is set, overriding the expanded-panel's left border accent + header text
  color via direct properties, same technique as Card's accent border)
- **Template**: `<div [class]="classes()"><ng-content /></div>`

**`usli-accordion-item.component.ts`**
- **Inputs**: `value = input.required<unknown>()`, `label = input.required<string>()`,
  `disabled = input(false)`
- Injects `USLI_ACCORDION` as `group`; `protected isOpen = computed(() => group.isExpanded(this.value()))`
- `panelId`: stable per-instance id, generated the same way as `usli-tab`'s
  (`usli-accordion-panel-${n}` from a module-scoped counter shared within this file)
- **Template**:
  ```html
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button type="button" class="accordion-button" [class.collapsed]="!isOpen()"
              [disabled]="disabled()" [attr.aria-expanded]="isOpen()" [attr.aria-controls]="panelId"
              (click)="group.toggle(value())">
        {{ label() }}
      </button>
    </h2>
    <div class="accordion-collapse" [class.show]="isOpen()" [id]="panelId" role="region">
      <div class="accordion-body"><ng-content /></div>
    </div>
  </div>
  ```
  No `collapsing` transition class and no `fade` — expand/collapse is instant, same
  minimalism as Alert's dismiss.

## Storybook stories

New files in `projects/ui-sdk/src/stories/` (no `usli-` prefix):

- `tabs.stories.ts` — title `Components/Tabs`, `Meta<UsliTabsComponent>`,
  `tags: ['autodocs']`. Default story: three tabs, one disabled, via a template
  literal rendering `usli-tabs`/`usli-tab`. A second story sets `variant`.
- `accordion.stories.ts` — title `Components/Accordion`, `Meta<UsliAccordionComponent>`,
  `tags: ['autodocs']`. Default story: single-open mode with three items. A second
  story sets `multiple: true` with two items expanded by default.

Placed alongside the existing `Components/*` stories group.

## Showcase docs pages

New folders under `projects/showcase/src/app/pages/components/{tabs,accordion}/`,
each with `.ts` / `.html` / `.scss`, mirroring `card-docs`/`badge-docs`:

- Page header + lead paragraph
- "Basic usage" section with a live example + code block
- A second section for the component's other key option (variant color for Tabs;
  `multiple` mode for Accordion) + code block
- API table covering both the container and item component's inputs/outputs

New routes added to `projects/showcase/src/app/app.routes.ts`:
`/components/tabs`, `/components/accordion`.

New sidebar entries added to `projects/showcase/src/app/layout/sidebar/sidebar.ts`
under the existing "Components" section, as single links (like Card/Spinner — not
nested, since each doc page covers both the container and item component together).

## Testing

`.spec.ts` per component (`usli-tabs`, `usli-tab`, `usli-accordion`,
`usli-accordion-item`) covering:
- Default selection/expansion state
- Click selects a tab / toggles a panel
- Disabled tab is unselectable (click and arrow-key navigation both skip it)
- Two-way `valueChange` / `expandedChange` emit on interaction
- Accordion: single mode closes the previously-open sibling; multiple mode allows
  concurrent open panels
- Tabs: arrow-key navigation (Left/Right/Home/End) moves selection and skips
  disabled tabs
