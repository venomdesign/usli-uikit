# Form Components Implementation Design

## Goal

Add a full suite of CVA-backed form input components to `ui-sdk`: Input, Textarea, Select, Checkbox, Radio Group, and a FormField wrapper that auto-derives error messages from Angular's reactive forms API.

## Architecture

Option A — shallow wrappers. Each component is a thin `ControlValueAccessor` that wraps its native element. Components work standalone (with an `errorMessage` input) or inside `usli-form-field`, which auto-reads errors from Angular's `NgControl` via a shared injection token. All components follow the self-binding CVA pattern: they inject `NgControl` with `{ optional: true, self: true }` and assign themselves as the `valueAccessor` directly, avoiding the `NG_VALUE_ACCESSOR` circular dependency.

## Tech Stack

- Angular 21 standalone components, `ChangeDetectionStrategy.OnPush`, `input()` signals, `computed()` signals
- Bootstrap 5 form classes (`form-control`, `form-check`, `form-label`, `is-invalid`, `invalid-feedback`)
- Angular `ReactiveFormsModule` (`NgControl`, `ControlValueAccessor`)

---

## Components

### 1. `UsliInputComponent` — `usli-input`

**Inputs:**
- `type = input<string>('text')` — 'text' | 'email' | 'password' | 'number' | any valid HTML input type
- `placeholder = input<string>('')`
- `errorMessage = input<string | undefined>()`

**Value type:** `string`

**Template:**
```html
<input
  class="form-control"
  [class.is-invalid]="hasError()"
  [type]="type()"
  [placeholder]="placeholder()"
  [disabled]="isDisabled"
  [value]="value"
  (input)="onInput($event)"
  (blur)="onTouched()"
/>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

`hasError()` = `!!errorMessage() || (ngControl?.invalid && ngControl?.touched)`

---

### 2. `UsliTextareaComponent` — `usli-textarea`

**Inputs:**
- `placeholder = input<string>('')`
- `rows = input<number>(3)`
- `errorMessage = input<string | undefined>()`

**Value type:** `string`

**Template:**
```html
<textarea
  class="form-control"
  [class.is-invalid]="hasError()"
  [placeholder]="placeholder()"
  [rows]="rows()"
  [disabled]="isDisabled"
  (input)="onInput($event)"
  (blur)="onTouched()"
>{{ value }}</textarea>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

---

### 3. `UsliSelectComponent` — `usli-select`

**Inputs:**
- `placeholder = input<string | undefined>()` — when set, renders a disabled empty `<option>` as the first child
- `errorMessage = input<string | undefined>()`

**Value type:** `string`

**Template:**
```html
<select class="form-select" [class.is-invalid]="hasError()" [disabled]="isDisabled" (change)="onSelect($event)" (blur)="onTouched()">
  @if (placeholder()) {
    <option value="" disabled [selected]="!value">{{ placeholder() }}</option>
  }
  <ng-content />
</select>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

Consumer provides `<option>` elements via `<ng-content>`. `onSelect($event)` extracts `(event.target as HTMLSelectElement).value` before calling `onChange`.

---

### 4. `UsliCheckboxComponent` — `usli-checkbox`

**Inputs:**
- `label = input<string | undefined>()`
- `errorMessage = input<string | undefined>()`

**Value type:** `boolean`

**Template:**
```html
<div class="form-check">
  <input class="form-check-input" type="checkbox" [class.is-invalid]="hasError()" [checked]="value" [disabled]="isDisabled" (change)="onToggle($event)" (blur)="onTouched()" />
  @if (label()) {
    <label class="form-check-label">{{ label() }}</label>
  }
  @if (errorMessage()) {
    <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
  }
</div>
```

---

### 5. `UsliRadioGroupComponent` — `usli-radio-group`

**Inputs:**
- `errorMessage = input<string | undefined>()`

**Value type:** `unknown`

Provides `USLI_RADIO_GROUP` token so child `usli-radio` components can inject the group and call `select(value)`.

**Template:**
```html
<div role="radiogroup">
  <ng-content />
</div>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

---

### 6. `UsliRadioComponent` — `usli-radio`

**Inputs:**
- `value = input.required<unknown>()` — the value this radio option represents
- `label = input.required<string>()`

Injects `USLI_RADIO_GROUP` to read current group value and call `select()`.

`isSelected = computed(() => this.group.value() === this.value())`

**Template:**
```html
<div class="form-check">
  <input class="form-check-input" type="radio" [checked]="isSelected()" (change)="select()" (blur)="onTouched()" />
  <label class="form-check-label">{{ label() }}</label>
</div>
```

---

### 7. `UsliFormFieldComponent` — `usli-form-field`

**Inputs:**
- `label = input<string | undefined>()`

Uses `contentChild(USLI_FORM_CONTROL)` (Angular 21 signal API) to obtain the projected control's `NgControl`. Computes `showError = ngControl?.invalid && ngControl?.touched`. Derives `errorText` from the first error key using the built-in message map.

Note: `onToggle($event)` in checkbox extracts `(event.target as HTMLInputElement).checked` before calling `onChange`.

**Template:**
```html
@if (label()) {
  <label class="form-label">{{ label() }}</label>
}
<ng-content />
@if (showError()) {
  <div class="invalid-feedback d-block">{{ errorText() }}</div>
}
```

**Built-in error message map:**

| Error key | Message |
|---|---|
| `required` | This field is required |
| `email` | Enter a valid email address |
| `minlength` | Minimum length not met |
| `maxlength` | Maximum length exceeded |
| `min` | Value is too small |
| `max` | Value is too large |
| *(any other)* | Invalid value |

---

## Shared Infrastructure

### `forms/form-control.token.ts`

```typescript
export interface UsliFormControl {
  ngControl: NgControl | null;
}
export const USLI_FORM_CONTROL = new InjectionToken<UsliFormControl>('USLI_FORM_CONTROL');
```

Every CVA component (Input, Textarea, Select, Checkbox, RadioGroup) provides itself via this token:
```typescript
providers: [{ provide: USLI_FORM_CONTROL, useExisting: UsliXxxComponent }]
```

### `forms/radio-group.token.ts`

```typescript
export interface UsliRadioGroupControl {
  value: Signal<unknown>;
  select(value: unknown): void;
  onTouched(): void;
}
export const USLI_RADIO_GROUP = new InjectionToken<UsliRadioGroupControl>('USLI_RADIO_GROUP');
```

`UsliRadioGroupComponent` provides itself via this token. `UsliRadioComponent` injects it.

---

## File Structure

```
projects/ui-sdk/src/lib/components/forms/
  form-control.token.ts
  radio-group.token.ts
  usli-input/
    usli-input.component.ts
    usli-input.component.html
    usli-input.component.spec.ts
  usli-textarea/
    usli-textarea.component.ts
    usli-textarea.component.html
    usli-textarea.component.spec.ts
  usli-select/
    usli-select.component.ts
    usli-select.component.html
    usli-select.component.spec.ts
  usli-checkbox/
    usli-checkbox.component.ts
    usli-checkbox.component.html
    usli-checkbox.component.spec.ts
  usli-radio-group/
    usli-radio-group.component.ts
    usli-radio-group.component.html
    usli-radio-group.component.spec.ts
  usli-radio/
    usli-radio.component.ts
    usli-radio.component.html
    usli-radio.component.spec.ts
  usli-form-field/
    usli-form-field.component.ts
    usli-form-field.component.html
    usli-form-field.component.spec.ts
  index.ts

projects/ui-sdk/src/stories/
  form-field.stories.ts
  input.stories.ts
  textarea.stories.ts
  select.stories.ts
  checkbox.stories.ts
  radio-group.stories.ts

projects/showcase/src/app/pages/components/
  input/
  textarea/
  select/
  checkbox/
  radio-group/
  form-field/
```

---

## Storybook Stories

Each component gets a story file with:
- Default story (standalone, no FormField)
- Error state story (`errorMessage` set)
- Inside FormField story (reactive form, shows auto-error on touch)
- Disabled state story

---

## Showcase Pages

Each component gets a showcase page in the `projects/showcase` app following the existing pattern (route, sidebar entry, docs component). The FormField page demonstrates all controls inside FormField with a single reactive form.

---

## Testing

All specs use `TestBed` + `ReactiveFormsModule`. Class assertions use `classList.value.split(' ').sort()` for multi-class checks.

**CVA behavior (Input, Textarea, Select, Checkbox, RadioGroup):**
- `writeValue()` updates the displayed value
- User interaction triggers `onChange` with the correct value
- `setDisabledState(true)` disables the native element
- `is-invalid` class applied when `errorMessage` is set
- `is-invalid` class applied when `ngControl` is invalid and touched

**FormField:**
- Renders label when `label` input is set
- Shows no error when control is pristine (even if invalid)
- Shows error message when control is `invalid && touched`
- Correct message for `required`, `email`, `minlength`, unknown error keys
- Shows no error div when control is valid

**RadioGroup + Radio:**
- Selecting a radio calls the group's `onChange` with the radio's value
- `writeValue()` on the group marks the matching radio as checked
- `isSelected()` reflects current group value
