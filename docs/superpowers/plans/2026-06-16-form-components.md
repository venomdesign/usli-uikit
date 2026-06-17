# Form Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add CVA-backed form components (Input, Textarea, Select, Checkbox, RadioGroup, FormField) to the `ui-sdk` library with Storybook stories and showcase docs.

**Architecture:** Shallow wrapper pattern — each component is a thin `ControlValueAccessor` using the self-binding pattern (`inject(NgControl, { optional: true, self: true })`). All CVA components provide themselves via the `USLI_FORM_CONTROL` token so `UsliFormFieldComponent` can query them via `contentChild()` and auto-derive validation messages. Components work standalone via an `errorMessage` input or inside `usli-form-field` for automatic error display.

**Tech Stack:** Angular 21, standalone components, `ChangeDetectionStrategy.OnPush`, `input()` signals, `signal()`, `computed()`, `contentChild()`, Bootstrap 5 form classes (`form-control`, `form-select`, `form-check`, `is-invalid`, `invalid-feedback`), `ReactiveFormsModule`.

---

### Task 1: Shared tokens

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/form-control.token.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/radio-group.token.ts`

- [ ] **Step 1: Create form-control.token.ts**

```typescript
// projects/ui-sdk/src/lib/components/forms/form-control.token.ts
import { InjectionToken } from '@angular/core';
import type { NgControl } from '@angular/forms';

export interface UsliFormControl {
  readonly ngControl: NgControl | null;
}

export const USLI_FORM_CONTROL = new InjectionToken<UsliFormControl>('USLI_FORM_CONTROL');
```

- [ ] **Step 2: Create radio-group.token.ts**

```typescript
// projects/ui-sdk/src/lib/components/forms/radio-group.token.ts
import { InjectionToken, Signal } from '@angular/core';

export interface UsliRadioGroupControl {
  readonly value: Signal<unknown>;
  select(value: unknown): void;
  onTouched(): void;
}

export const USLI_RADIO_GROUP = new InjectionToken<UsliRadioGroupControl>('USLI_RADIO_GROUP');
```

- [ ] **Step 3: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/
git commit -m "feat: add shared tokens for form components"
```

---

### Task 2: usli-input component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliInputComponent } from './usli-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliInputComponent],
  template: `<usli-input [formControl]="ctrl" [type]="type" [placeholder]="placeholder" [errorMessage]="errorMessage" />`,
})
class TestHost {
  ctrl = new FormControl('');
  type = 'text';
  placeholder = '';
  errorMessage: string | undefined = undefined;
}

describe('UsliInputComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a text input', () => {
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('applies the type input', () => {
    host.type = 'email';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').type).toBe('email');
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBeFalse();
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage = 'Required';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBeTrue();
  });

  it('shows the errorMessage text', () => {
    host.errorMessage = 'Required';
    fixture.detectChanges();
    const err: HTMLElement = fixture.nativeElement.querySelector('.invalid-feedback');
    expect(err?.textContent?.trim()).toBe('Required');
  });

  it('shows no error div when errorMessage is not set', () => {
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });

  it('updates formControl value when user types', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('hello');
  });

  it('disables the input when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBeTrue();
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl = new FormControl('', Validators.required);
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBeTrue();
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `ng test ui-sdk --watch=false`
Expected: FAIL — `UsliInputComponent` not found.

- [ ] **Step 3: Create the component**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.ts
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef,
  OnInit, inject, input, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { USLI_FORM_CONTROL, type UsliFormControl } from '../form-control.token';

@Component({
  selector: 'usli-input',
  standalone: true,
  templateUrl: './usli-input.component.html',
  styleUrl: './usli-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_FORM_CONTROL, useExisting: UsliInputComponent }],
})
export class UsliInputComponent implements ControlValueAccessor, UsliFormControl, OnInit {
  type = input<string>('text');
  placeholder = input<string>('');
  errorMessage = input<string | undefined>();

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected value = signal('');
  protected isDisabled = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.ngControl.statusChanges
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());
    }
  }

  protected hasError(): boolean {
    return !!this.errorMessage() || (!!this.ngControl?.invalid && !!this.ngControl?.touched);
  }

  protected onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(value: string): void { this.value.set(value ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
```

- [ ] **Step 4: Create the template**

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.html -->
<input
  class="form-control"
  [class.is-invalid]="hasError()"
  [type]="type()"
  [placeholder]="placeholder()"
  [disabled]="isDisabled()"
  [value]="value()"
  (input)="onInput($event)"
  (blur)="onTouched()"
/>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

- [ ] **Step 5: Create the SCSS**

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-input/usli-input.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 6: Verify tests pass**

Run: `ng test ui-sdk --watch=false`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/usli-input/
git commit -m "feat: add usli-input CVA component"
```

---

### Task 3: usli-textarea component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliTextareaComponent } from './usli-textarea.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliTextareaComponent],
  template: `<usli-textarea [formControl]="ctrl" [placeholder]="placeholder" [rows]="rows" [errorMessage]="errorMessage" />`,
})
class TestHost {
  ctrl = new FormControl('');
  placeholder = '';
  rows = 3;
  errorMessage: string | undefined = undefined;
}

describe('UsliTextareaComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a textarea', () => {
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('applies the rows input', () => {
    host.rows = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').rows).toBe(5);
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('textarea').classList.contains('is-invalid')).toBeFalse();
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage = 'Too short';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').classList.contains('is-invalid')).toBeTrue();
  });

  it('shows the errorMessage text', () => {
    host.errorMessage = 'Too short';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Too short');
  });

  it('updates formControl value when user types', () => {
    const ta: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    ta.value = 'notes';
    ta.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('notes');
  });

  it('disables the textarea when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').disabled).toBeTrue();
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl = new FormControl('', Validators.required);
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').classList.contains('is-invalid')).toBeTrue();
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `ng test ui-sdk --watch=false`
Expected: FAIL — `UsliTextareaComponent` not found.

- [ ] **Step 3: Create the component**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.ts
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef,
  OnInit, inject, input, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { USLI_FORM_CONTROL, type UsliFormControl } from '../form-control.token';

@Component({
  selector: 'usli-textarea',
  standalone: true,
  templateUrl: './usli-textarea.component.html',
  styleUrl: './usli-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_FORM_CONTROL, useExisting: UsliTextareaComponent }],
})
export class UsliTextareaComponent implements ControlValueAccessor, UsliFormControl, OnInit {
  placeholder = input<string>('');
  rows = input<number>(3);
  errorMessage = input<string | undefined>();

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected value = signal('');
  protected isDisabled = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.ngControl.statusChanges
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());
    }
  }

  protected hasError(): boolean {
    return !!this.errorMessage() || (!!this.ngControl?.invalid && !!this.ngControl?.touched);
  }

  protected onInput(event: Event): void {
    const v = (event.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(value: string): void { this.value.set(value ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
```

- [ ] **Step 4: Create the template**

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.html -->
<textarea
  class="form-control"
  [class.is-invalid]="hasError()"
  [placeholder]="placeholder()"
  [rows]="rows()"
  [disabled]="isDisabled()"
  (input)="onInput($event)"
  (blur)="onTouched()"
>{{ value() }}</textarea>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

- [ ] **Step 5: Create the SCSS**

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-textarea/usli-textarea.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 6: Verify tests pass**

Run: `ng test ui-sdk --watch=false`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/usli-textarea/
git commit -m "feat: add usli-textarea CVA component"
```

---

### Task 4: usli-select component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliSelectComponent } from './usli-select.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliSelectComponent],
  template: `
    <usli-select [formControl]="ctrl" [placeholder]="placeholder" [errorMessage]="errorMessage">
      <option value="a">Option A</option>
      <option value="b">Option B</option>
    </usli-select>
  `,
})
class TestHost {
  ctrl = new FormControl('');
  placeholder: string | undefined = undefined;
  errorMessage: string | undefined = undefined;
}

describe('UsliSelectComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a select element', () => {
    expect(fixture.nativeElement.querySelector('select')).toBeTruthy();
  });

  it('renders a placeholder option when placeholder is set', () => {
    host.placeholder = 'Choose one';
    fixture.detectChanges();
    const opt: HTMLOptionElement = fixture.nativeElement.querySelector('option[value=""]');
    expect(opt?.textContent?.trim()).toBe('Choose one');
    expect(opt?.disabled).toBeTrue();
  });

  it('does not render a placeholder option when placeholder is not set', () => {
    expect(fixture.nativeElement.querySelector('option[value=""]')).toBeNull();
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('select').classList.contains('is-invalid')).toBeFalse();
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage = 'Select a value';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').classList.contains('is-invalid')).toBeTrue();
  });

  it('shows the errorMessage text', () => {
    host.errorMessage = 'Select a value';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Select a value');
  });

  it('updates formControl value when user selects', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = 'a';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('a');
  });

  it('disables the select when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').disabled).toBeTrue();
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl = new FormControl('', Validators.required);
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').classList.contains('is-invalid')).toBeTrue();
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `ng test ui-sdk --watch=false`
Expected: FAIL.

- [ ] **Step 3: Create the component**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.ts
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef,
  OnInit, inject, input, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { USLI_FORM_CONTROL, type UsliFormControl } from '../form-control.token';

@Component({
  selector: 'usli-select',
  standalone: true,
  templateUrl: './usli-select.component.html',
  styleUrl: './usli-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_FORM_CONTROL, useExisting: UsliSelectComponent }],
})
export class UsliSelectComponent implements ControlValueAccessor, UsliFormControl, OnInit {
  placeholder = input<string | undefined>();
  errorMessage = input<string | undefined>();

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected value = signal('');
  protected isDisabled = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.ngControl.statusChanges
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());
    }
  }

  protected hasError(): boolean {
    return !!this.errorMessage() || (!!this.ngControl?.invalid && !!this.ngControl?.touched);
  }

  protected onSelect(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  writeValue(value: string): void { this.value.set(value ?? ''); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
```

- [ ] **Step 4: Create the template**

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.html -->
<select
  class="form-select"
  [class.is-invalid]="hasError()"
  [disabled]="isDisabled()"
  (change)="onSelect($event)"
  (blur)="onTouched()"
>
  @if (placeholder()) {
    <option value="" disabled [selected]="!value()">{{ placeholder() }}</option>
  }
  <ng-content />
</select>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
```

- [ ] **Step 5: Create the SCSS**

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-select/usli-select.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 6: Verify tests pass**

Run: `ng test ui-sdk --watch=false`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/usli-select/
git commit -m "feat: add usli-select CVA component"
```

---

### Task 5: usli-checkbox component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UsliCheckboxComponent } from './usli-checkbox.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliCheckboxComponent],
  template: `<usli-checkbox [formControl]="ctrl" [label]="label" [errorMessage]="errorMessage" />`,
})
class TestHost {
  ctrl = new FormControl(false);
  label: string | undefined = undefined;
  errorMessage: string | undefined = undefined;
}

describe('UsliCheckboxComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a checkbox input', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="checkbox"]');
    expect(input).toBeTruthy();
  });

  it('renders a label when label input is set', () => {
    host.label = 'Accept terms';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-check-label')?.textContent?.trim()).toBe('Accept terms');
  });

  it('renders no label element when label is not set', () => {
    expect(fixture.nativeElement.querySelector('.form-check-label')).toBeNull();
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBeFalse();
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage = 'Must accept';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBeTrue();
  });

  it('shows the errorMessage text', () => {
    host.errorMessage = 'Must accept';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Must accept');
  });

  it('updates formControl value when toggled', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBeTrue();
  });

  it('disables the checkbox when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBeTrue();
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `ng test ui-sdk --watch=false`
Expected: FAIL.

- [ ] **Step 3: Create the component**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.ts
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef,
  OnInit, inject, input, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { USLI_FORM_CONTROL, type UsliFormControl } from '../form-control.token';

@Component({
  selector: 'usli-checkbox',
  standalone: true,
  templateUrl: './usli-checkbox.component.html',
  styleUrl: './usli-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_FORM_CONTROL, useExisting: UsliCheckboxComponent }],
})
export class UsliCheckboxComponent implements ControlValueAccessor, UsliFormControl, OnInit {
  label = input<string | undefined>();
  errorMessage = input<string | undefined>();

  readonly ngControl = inject(NgControl, { optional: true, self: true });

  protected checked = signal(false);
  protected isDisabled = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (v: boolean) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.ngControl.statusChanges
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());
    }
  }

  protected hasError(): boolean {
    return !!this.errorMessage() || (!!this.ngControl?.invalid && !!this.ngControl?.touched);
  }

  protected onToggle(event: Event): void {
    const v = (event.target as HTMLInputElement).checked;
    this.checked.set(v);
    this.onChange(v);
  }

  writeValue(value: boolean): void { this.checked.set(!!value); }
  registerOnChange(fn: (v: boolean) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
```

- [ ] **Step 4: Create the template**

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.html -->
<div class="form-check">
  <input
    class="form-check-input"
    type="checkbox"
    [class.is-invalid]="hasError()"
    [checked]="checked()"
    [disabled]="isDisabled()"
    (change)="onToggle($event)"
    (blur)="onTouched()"
  />
  @if (label()) {
    <label class="form-check-label">{{ label() }}</label>
  }
  @if (errorMessage()) {
    <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
  }
</div>
```

- [ ] **Step 5: Create the SCSS**

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-checkbox/usli-checkbox.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 6: Verify tests pass**

Run: `ng test ui-sdk --watch=false`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/usli-checkbox/
git commit -m "feat: add usli-checkbox CVA component"
```

---

### Task 6: usli-radio-group + usli-radio components

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.spec.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.spec.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliRadioGroupComponent } from './usli-radio-group.component';
import { UsliRadioComponent } from '../usli-radio/usli-radio.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliRadioGroupComponent, UsliRadioComponent],
  template: `
    <usli-radio-group [formControl]="ctrl" [errorMessage]="errorMessage">
      <usli-radio value="a" label="Option A" />
      <usli-radio value="b" label="Option B" />
    </usli-radio-group>
  `,
})
class TestHost {
  ctrl = new FormControl('');
  errorMessage: string | undefined = undefined;
}

describe('UsliRadioGroupComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a radiogroup', () => {
    expect(fixture.nativeElement.querySelector('[role="radiogroup"]')).toBeTruthy();
  });

  it('renders projected radio items', () => {
    expect(fixture.nativeElement.querySelectorAll('input[type="radio"]').length).toBe(2);
  });

  it('updates formControl value when a radio is selected', () => {
    const radios: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    radios[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('a');
  });

  it('checks the correct radio when writeValue is called', () => {
    host.ctrl.setValue('b');
    fixture.detectChanges();
    const radios: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(radios[1].checked).toBeTrue();
    expect(radios[0].checked).toBeFalse();
  });

  it('shows errorMessage when set', () => {
    host.errorMessage = 'Pick one';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Pick one');
  });

  it('shows no error div when errorMessage is not set', () => {
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl = new FormControl('', Validators.required);
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeTruthy();
  });
});
```

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { USLI_RADIO_GROUP, type UsliRadioGroupControl } from '../radio-group.token';
import { UsliRadioComponent } from './usli-radio.component';
import { signal } from '@angular/core';

@Component({
  standalone: true,
  imports: [UsliRadioComponent],
  template: `<usli-radio value="x" label="Option X" />`,
  providers: [
    {
      provide: USLI_RADIO_GROUP,
      useValue: {
        value: signal(''),
        select: jasmine.createSpy('select'),
        onTouched: jasmine.createSpy('onTouched'),
      } satisfies UsliRadioGroupControl,
    },
  ],
})
class TestHost {}

describe('UsliRadioComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let groupSpy: UsliRadioGroupControl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    groupSpy = TestBed.inject(USLI_RADIO_GROUP);
    fixture.detectChanges();
  });

  it('renders a radio input with the correct label', () => {
    expect(fixture.nativeElement.querySelector('input[type="radio"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.form-check-label')?.textContent?.trim()).toBe('Option X');
  });

  it('calls group.select with its value when changed', () => {
    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('change'));
    expect(groupSpy.select).toHaveBeenCalledWith('x');
  });

  it('calls group.onTouched when blurred', () => {
    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));
    expect(groupSpy.onTouched).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Verify tests fail**

Run: `ng test ui-sdk --watch=false`
Expected: FAIL.

- [ ] **Step 3: Create usli-radio-group**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.ts
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef,
  OnInit, inject, input, signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { USLI_FORM_CONTROL, type UsliFormControl } from '../form-control.token';
import { USLI_RADIO_GROUP, type UsliRadioGroupControl } from '../radio-group.token';

@Component({
  selector: 'usli-radio-group',
  standalone: true,
  templateUrl: './usli-radio-group.component.html',
  styleUrl: './usli-radio-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: USLI_FORM_CONTROL, useExisting: UsliRadioGroupComponent },
    { provide: USLI_RADIO_GROUP, useExisting: UsliRadioGroupComponent },
  ],
})
export class UsliRadioGroupComponent implements ControlValueAccessor, UsliFormControl, UsliRadioGroupControl, OnInit {
  errorMessage = input<string | undefined>();

  readonly ngControl = inject(NgControl, { optional: true, self: true });
  readonly value = signal<unknown>(null);

  protected isDisabled = signal(false);

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private onChange: (v: unknown) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
      this.ngControl.statusChanges
        ?.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cdr.markForCheck());
    }
  }

  select(val: unknown): void {
    this.value.set(val);
    this.onChange(val);
  }

  protected hasError(): boolean {
    return !!this.errorMessage() || (!!this.ngControl?.invalid && !!this.ngControl?.touched);
  }

  writeValue(value: unknown): void { this.value.set(value ?? null); }
  registerOnChange(fn: (v: unknown) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }
}
```

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.html -->
<div role="radiogroup">
  <ng-content />
</div>
@if (errorMessage()) {
  <div class="invalid-feedback d-block">{{ errorMessage() }}</div>
}
@if (!errorMessage() && hasError()) {
  <div class="invalid-feedback d-block">Invalid selection</div>
}
```

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-radio-group/usli-radio-group.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 4: Create usli-radio**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.ts
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { USLI_RADIO_GROUP } from '../radio-group.token';

@Component({
  selector: 'usli-radio',
  standalone: true,
  templateUrl: './usli-radio.component.html',
  styleUrl: './usli-radio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliRadioComponent {
  value = input.required<unknown>();
  label = input.required<string>();

  private readonly group = inject(USLI_RADIO_GROUP);

  protected isSelected = computed(() => this.group.value() === this.value());

  protected select(): void { this.group.select(this.value()); }
  protected onBlur(): void { this.group.onTouched(); }
}
```

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.html -->
<div class="form-check">
  <input
    class="form-check-input"
    type="radio"
    [checked]="isSelected()"
    (change)="select()"
    (blur)="onBlur()"
  />
  <label class="form-check-label">{{ label() }}</label>
</div>
```

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-radio/usli-radio.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 5: Verify tests pass**

Run: `ng test ui-sdk --watch=false`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/usli-radio-group/ projects/ui-sdk/src/lib/components/forms/usli-radio/
git commit -m "feat: add usli-radio-group and usli-radio CVA components"
```

---

### Task 7: usli-form-field component

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.ts`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.html`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.scss`
- Create: `projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.spec.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.spec.ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliFormFieldComponent } from './usli-form-field.component';
import { UsliInputComponent } from '../usli-input/usli-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliFormFieldComponent, UsliInputComponent],
  template: `
    <usli-form-field [label]="label">
      <usli-input [formControl]="ctrl" />
    </usli-form-field>
  `,
})
class TestHost {
  ctrl = new FormControl('', Validators.required);
  label: string | undefined = undefined;
}

describe('UsliFormFieldComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a label when label input is set', () => {
    host.label = 'Email';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-label')?.textContent?.trim()).toBe('Email');
  });

  it('renders no label when label is not set', () => {
    expect(fixture.nativeElement.querySelector('.form-label')).toBeNull();
  });

  it('shows no error when pristine even if invalid', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });

  it('shows required error when invalid and touched', () => {
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('This field is required');
  });

  it('shows email error for email validator', () => {
    host.ctrl = new FormControl('notanemail', Validators.email);
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Enter a valid email address');
  });

  it('shows minlength error for minlength validator', () => {
    host.ctrl = new FormControl('a', Validators.minLength(5));
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Minimum length not met');
  });

  it('shows fallback message for unknown error keys', () => {
    host.ctrl.setErrors({ customError: true });
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Invalid value');
  });

  it('shows no error when control is valid', () => {
    host.ctrl.setValue('hello');
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });
});
```

- [ ] **Step 2: Verify test fails**

Run: `ng test ui-sdk --watch=false`
Expected: FAIL.

- [ ] **Step 3: Create the component**

```typescript
// projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.ts
import {
  AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef,
  Component, DestroyRef, contentChild, inject, input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { USLI_FORM_CONTROL } from '../form-control.token';

const ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required',
  email: 'Enter a valid email address',
  minlength: 'Minimum length not met',
  maxlength: 'Maximum length exceeded',
  min: 'Value is too small',
  max: 'Value is too large',
};

@Component({
  selector: 'usli-form-field',
  standalone: true,
  templateUrl: './usli-form-field.component.html',
  styleUrl: './usli-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliFormFieldComponent implements AfterContentInit {
  label = input<string | undefined>();

  private readonly control = contentChild(USLI_FORM_CONTROL);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  ngAfterContentInit(): void {
    this.control()?.ngControl?.statusChanges
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.cdr.markForCheck());
  }

  protected showError(): boolean {
    const ctrl = this.control();
    return !!ctrl?.ngControl?.invalid && !!ctrl?.ngControl?.touched;
  }

  protected errorText(): string {
    const errors = this.control()?.ngControl?.errors;
    if (!errors) return '';
    const key = Object.keys(errors)[0];
    return ERROR_MESSAGES[key] ?? 'Invalid value';
  }
}
```

- [ ] **Step 4: Create the template**

```html
<!-- projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.html -->
@if (label()) {
  <label class="form-label">{{ label() }}</label>
}
<ng-content />
@if (showError()) {
  <div class="invalid-feedback d-block">{{ errorText() }}</div>
}
```

- [ ] **Step 5: Create the SCSS**

```scss
/* projects/ui-sdk/src/lib/components/forms/usli-form-field/usli-form-field.component.scss */
:host {
  display: block;
}
```

- [ ] **Step 6: Verify tests pass**

Run: `ng test ui-sdk --watch=false`
Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/usli-form-field/
git commit -m "feat: add usli-form-field wrapper component"
```

---

### Task 8: Wire up exports

**Files:**
- Create: `projects/ui-sdk/src/lib/components/forms/index.ts`
- Modify: `projects/ui-sdk/src/lib/components/index.ts`

- [ ] **Step 1: Create forms/index.ts**

```typescript
// projects/ui-sdk/src/lib/components/forms/index.ts
export * from './form-control.token';
export * from './radio-group.token';
export * from './usli-input/usli-input.component';
export * from './usli-textarea/usli-textarea.component';
export * from './usli-select/usli-select.component';
export * from './usli-checkbox/usli-checkbox.component';
export * from './usli-radio-group/usli-radio-group.component';
export * from './usli-radio/usli-radio.component';
export * from './usli-form-field/usli-form-field.component';
```

- [ ] **Step 2: Add forms to components/index.ts**

Current contents of `projects/ui-sdk/src/lib/components/index.ts`:
```typescript
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
export * from './spinner';
```

Updated contents:
```typescript
export * from './button';
export * from './badge';
export * from './alert';
export * from './card';
export * from './spinner';
export * from './forms';
```

- [ ] **Step 3: Build the library to verify no export errors**

Run: `ng build ui-sdk`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add projects/ui-sdk/src/lib/components/forms/index.ts projects/ui-sdk/src/lib/components/index.ts
git commit -m "feat: export form components from ui-sdk public API"
```

---

### Task 9: Storybook stories

**Files:**
- Create: `projects/ui-sdk/src/stories/input.stories.ts`
- Create: `projects/ui-sdk/src/stories/textarea.stories.ts`
- Create: `projects/ui-sdk/src/stories/select.stories.ts`
- Create: `projects/ui-sdk/src/stories/checkbox.stories.ts`
- Create: `projects/ui-sdk/src/stories/radio-group.stories.ts`
- Create: `projects/ui-sdk/src/stories/form-field.stories.ts`

- [ ] **Step 1: Create input.stories.ts**

```typescript
// projects/ui-sdk/src/stories/input.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliInputComponent } from 'ui-sdk';

const meta: Meta<UsliInputComponent> = {
  title: 'Components/Input',
  component: UsliInputComponent,
  tags: ['autodocs'],
  argTypes: {
    type: { control: 'select', options: ['text', 'email', 'password', 'number'] },
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
  },
  args: { type: 'text', placeholder: 'Enter value...' },
};

export default meta;
type Story = StoryObj<UsliInputComponent>;

export const Default: Story = { args: { type: 'text' } };

export const Email: Story = { args: { type: 'email', placeholder: 'you@example.com' } };

export const Password: Story = { args: { type: 'password', placeholder: 'Password' } };

export const WithError: Story = { args: { errorMessage: 'This field is required' } };

export const WithFormControl: Story = {
  render: (args) => ({
    props: { ...args, ctrl: new FormControl('', Validators.required) },
    moduleMetadata: { imports: [ReactiveFormsModule, UsliInputComponent] },
    template: `<usli-input [formControl]="ctrl" placeholder="Touch and leave empty to see error" />`,
  }),
};
```

- [ ] **Step 2: Create textarea.stories.ts**

```typescript
// projects/ui-sdk/src/stories/textarea.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { UsliTextareaComponent } from 'ui-sdk';

const meta: Meta<UsliTextareaComponent> = {
  title: 'Components/Textarea',
  component: UsliTextareaComponent,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    rows: { control: 'number' },
    errorMessage: { control: 'text' },
  },
  args: { placeholder: 'Enter text...', rows: 3 },
};

export default meta;
type Story = StoryObj<UsliTextareaComponent>;

export const Default: Story = {};
export const TallRows: Story = { args: { rows: 6 } };
export const WithError: Story = { args: { errorMessage: 'Description is required' } };
```

- [ ] **Step 3: Create select.stories.ts**

```typescript
// projects/ui-sdk/src/stories/select.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { UsliSelectComponent } from 'ui-sdk';

const meta: Meta<UsliSelectComponent> = {
  title: 'Components/Select',
  component: UsliSelectComponent,
  tags: ['autodocs'],
  argTypes: {
    placeholder: { control: 'text' },
    errorMessage: { control: 'text' },
  },
  args: { placeholder: 'Select an option' },
  render: (args) => ({
    props: args,
    template: `
      <usli-select [placeholder]="placeholder" [errorMessage]="errorMessage">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
        <option value="c">Option C</option>
      </usli-select>
    `,
    moduleMetadata: { imports: [UsliSelectComponent] },
  }),
};

export default meta;
type Story = StoryObj<UsliSelectComponent>;

export const Default: Story = {};
export const WithError: Story = { args: { errorMessage: 'Please select an option' } };
```

- [ ] **Step 4: Create checkbox.stories.ts**

```typescript
// projects/ui-sdk/src/stories/checkbox.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { UsliCheckboxComponent } from 'ui-sdk';

const meta: Meta<UsliCheckboxComponent> = {
  title: 'Components/Checkbox',
  component: UsliCheckboxComponent,
  tags: ['autodocs'],
  argTypes: {
    label: { control: 'text' },
    errorMessage: { control: 'text' },
  },
  args: { label: 'I accept the terms and conditions' },
};

export default meta;
type Story = StoryObj<UsliCheckboxComponent>;

export const Default: Story = {};
export const WithError: Story = { args: { errorMessage: 'You must accept the terms' } };
export const NoLabel: Story = { args: { label: undefined } };
```

- [ ] **Step 5: Create radio-group.stories.ts**

```typescript
// projects/ui-sdk/src/stories/radio-group.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { UsliRadioGroupComponent, UsliRadioComponent } from 'ui-sdk';

const meta: Meta = {
  title: 'Components/RadioGroup',
  tags: ['autodocs'],
  render: (args) => ({
    props: args,
    template: `
      <usli-radio-group [errorMessage]="errorMessage">
        <usli-radio value="a" label="Option A" />
        <usli-radio value="b" label="Option B" />
        <usli-radio value="c" label="Option C" />
      </usli-radio-group>
    `,
    moduleMetadata: { imports: [UsliRadioGroupComponent, UsliRadioComponent] },
  }),
  argTypes: { errorMessage: { control: 'text' } },
  args: {},
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const WithError: Story = { args: { errorMessage: 'Please select an option' } };
```

- [ ] **Step 6: Create form-field.stories.ts**

```typescript
// projects/ui-sdk/src/stories/form-field.stories.ts
import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliFormFieldComponent, UsliInputComponent, UsliSelectComponent } from 'ui-sdk';

const meta: Meta = {
  title: 'Components/FormField',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const WithInput: Story = {
  render: () => ({
    props: { ctrl: new FormControl('', Validators.required) },
    moduleMetadata: { imports: [ReactiveFormsModule, UsliFormFieldComponent, UsliInputComponent] },
    template: `
      <usli-form-field label="Email">
        <usli-input [formControl]="ctrl" type="email" placeholder="you@example.com" />
      </usli-form-field>
    `,
  }),
};

export const WithSelect: Story = {
  render: () => ({
    props: { ctrl: new FormControl('', Validators.required) },
    moduleMetadata: { imports: [ReactiveFormsModule, UsliFormFieldComponent, UsliSelectComponent] },
    template: `
      <usli-form-field label="Country">
        <usli-select [formControl]="ctrl" placeholder="Select a country">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
        </usli-select>
      </usli-form-field>
    `,
  }),
};
```

- [ ] **Step 7: Commit**

```bash
git add projects/ui-sdk/src/stories/input.stories.ts projects/ui-sdk/src/stories/textarea.stories.ts projects/ui-sdk/src/stories/select.stories.ts projects/ui-sdk/src/stories/checkbox.stories.ts projects/ui-sdk/src/stories/radio-group.stories.ts projects/ui-sdk/src/stories/form-field.stories.ts
git commit -m "feat: add Storybook stories for form components"
```

---

### Task 10: Showcase pages, routes, and sidebar

**Files:**
- Create: `projects/showcase/src/app/pages/components/input/input-docs.ts`
- Create: `projects/showcase/src/app/pages/components/input/input-docs.html`
- Create: `projects/showcase/src/app/pages/components/input/input-docs.scss`
- Create: `projects/showcase/src/app/pages/components/textarea/textarea-docs.ts`
- Create: `projects/showcase/src/app/pages/components/textarea/textarea-docs.html`
- Create: `projects/showcase/src/app/pages/components/textarea/textarea-docs.scss`
- Create: `projects/showcase/src/app/pages/components/select/select-docs.ts`
- Create: `projects/showcase/src/app/pages/components/select/select-docs.html`
- Create: `projects/showcase/src/app/pages/components/select/select-docs.scss`
- Create: `projects/showcase/src/app/pages/components/checkbox/checkbox-docs.ts`
- Create: `projects/showcase/src/app/pages/components/checkbox/checkbox-docs.html`
- Create: `projects/showcase/src/app/pages/components/checkbox/checkbox-docs.scss`
- Create: `projects/showcase/src/app/pages/components/radio-group/radio-group-docs.ts`
- Create: `projects/showcase/src/app/pages/components/radio-group/radio-group-docs.html`
- Create: `projects/showcase/src/app/pages/components/radio-group/radio-group-docs.scss`
- Create: `projects/showcase/src/app/pages/components/form-field/form-field-docs.ts`
- Create: `projects/showcase/src/app/pages/components/form-field/form-field-docs.html`
- Create: `projects/showcase/src/app/pages/components/form-field/form-field-docs.scss`
- Modify: `projects/showcase/src/app/app.routes.ts`
- Modify: `projects/showcase/src/app/layout/sidebar/sidebar.ts`

- [ ] **Step 1: Create input-docs.ts**

```typescript
// projects/showcase/src/app/pages/components/input/input-docs.ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliInputComponent, UsliFormFieldComponent } from 'ui-sdk';

@Component({
  selector: 'app-input-docs',
  standalone: true,
  imports: [UsliInputComponent, UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './input-docs.html',
  styleUrl: './input-docs.scss',
})
export class InputDocs {
  emailCtrl = new FormControl('', [Validators.required, Validators.email]);
}
```

- [ ] **Step 2: Create input-docs.html**

```html
<!-- projects/showcase/src/app/pages/components/input/input-docs.html -->
<div class="page">
  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Input</span>
    </nav>
    <h1 class="page-title">Input</h1>
    <p class="page-lead">
      A text input that integrates with Angular Reactive Forms via ControlValueAccessor.
      Supports text, email, password, number, and other HTML input types.
    </p>
  </header>

  <section class="section">
    <h2 class="section__title">Default</h2>
    <p class="section__desc">A basic text input with a placeholder.</p>
    <div class="example-box">
      <usli-input placeholder="Enter your name" />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-input placeholder="Enter your name" /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">Input types</h2>
    <p class="section__desc">Use the type input for email, password, number, and any other valid HTML input type.</p>
    <div class="example-box" style="display:flex;flex-direction:column;gap:8px;max-width:320px">
      <usli-input type="email" placeholder="you@example.com" />
      <usli-input type="password" placeholder="Password" />
      <usli-input type="number" placeholder="0" />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-input type="email" placeholder="you@example.com" /&gt;
&lt;usli-input type="password" placeholder="Password" /&gt;
&lt;usli-input type="number" placeholder="0" /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">Standalone error</h2>
    <p class="section__desc">Pass errorMessage directly when not using usli-form-field.</p>
    <div class="example-box" style="max-width:320px">
      <usli-input errorMessage="This field is required" />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-input errorMessage="This field is required" /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">With FormField</h2>
    <p class="section__desc">
      Wrap with usli-form-field to get automatic label and error derivation from the reactive form state.
      Touch and clear the field to trigger validation.
    </p>
    <div class="example-box" style="max-width:320px">
      <usli-form-field label="Email">
        <usli-input [formControl]="emailCtrl" type="email" placeholder="you@example.com" />
      </usli-form-field>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-form-field label="Email"&gt;
  &lt;usli-input [formControl]="emailCtrl" type="email" /&gt;
&lt;/usli-form-field&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead>
        <tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="prop-name">type</span></td>
          <td><span class="prop-type">string</span></td>
          <td><span class="prop-default">'text'</span></td>
          <td>HTML input type.</td>
        </tr>
        <tr>
          <td><span class="prop-name">placeholder</span></td>
          <td><span class="prop-type">string</span></td>
          <td><span class="prop-default">''</span></td>
          <td>Placeholder text.</td>
        </tr>
        <tr>
          <td><span class="prop-name">errorMessage</span></td>
          <td><span class="prop-type">string | undefined</span></td>
          <td><span class="prop-default">undefined</span></td>
          <td>Standalone error message. Ignored when inside usli-form-field.</td>
        </tr>
      </tbody>
    </table>
  </section>
</div>
```

- [ ] **Step 3: Create input-docs.scss**

```scss
// projects/showcase/src/app/pages/components/input/input-docs.scss
@use '../../docs-page';
```

- [ ] **Step 4: Create textarea-docs.ts**

```typescript
// projects/showcase/src/app/pages/components/textarea/textarea-docs.ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliTextareaComponent, UsliFormFieldComponent } from 'ui-sdk';

@Component({
  selector: 'app-textarea-docs',
  standalone: true,
  imports: [UsliTextareaComponent, UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './textarea-docs.html',
  styleUrl: './textarea-docs.scss',
})
export class TextareaDocs {
  notesCtrl = new FormControl('', Validators.required);
}
```

- [ ] **Step 5: Create textarea-docs.html**

```html
<!-- projects/showcase/src/app/pages/components/textarea/textarea-docs.html -->
<div class="page">
  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Textarea</span>
    </nav>
    <h1 class="page-title">Textarea</h1>
    <p class="page-lead">A multi-line text input that integrates with Angular Reactive Forms.</p>
  </header>

  <section class="section">
    <h2 class="section__title">Default</h2>
    <div class="example-box" style="max-width:400px">
      <usli-textarea placeholder="Enter your message..." />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-textarea placeholder="Enter your message..." /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">Custom rows</h2>
    <div class="example-box" style="max-width:400px">
      <usli-textarea [rows]="6" placeholder="Tall textarea..." />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-textarea [rows]="6" placeholder="Tall textarea..." /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">With FormField</h2>
    <div class="example-box" style="max-width:400px">
      <usli-form-field label="Notes">
        <usli-textarea [formControl]="notesCtrl" placeholder="Enter notes..." />
      </usli-form-field>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-form-field label="Notes"&gt;
  &lt;usli-textarea [formControl]="notesCtrl" /&gt;
&lt;/usli-form-field&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="prop-name">placeholder</span></td><td><span class="prop-type">string</span></td><td><span class="prop-default">''</span></td><td>Placeholder text.</td></tr>
        <tr><td><span class="prop-name">rows</span></td><td><span class="prop-type">number</span></td><td><span class="prop-default">3</span></td><td>Number of visible text rows.</td></tr>
        <tr><td><span class="prop-name">errorMessage</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Standalone error message.</td></tr>
      </tbody>
    </table>
  </section>
</div>
```

- [ ] **Step 6: Create textarea-docs.scss**

```scss
// projects/showcase/src/app/pages/components/textarea/textarea-docs.scss
@use '../../docs-page';
```

- [ ] **Step 7: Create select-docs.ts**

```typescript
// projects/showcase/src/app/pages/components/select/select-docs.ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliSelectComponent, UsliFormFieldComponent } from 'ui-sdk';

@Component({
  selector: 'app-select-docs',
  standalone: true,
  imports: [UsliSelectComponent, UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './select-docs.html',
  styleUrl: './select-docs.scss',
})
export class SelectDocs {
  countryCtrl = new FormControl('', Validators.required);
}
```

- [ ] **Step 8: Create select-docs.html**

```html
<!-- projects/showcase/src/app/pages/components/select/select-docs.html -->
<div class="page">
  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Select</span>
    </nav>
    <h1 class="page-title">Select</h1>
    <p class="page-lead">A dropdown select that integrates with Angular Reactive Forms. Provide options via content projection.</p>
  </header>

  <section class="section">
    <h2 class="section__title">Default with placeholder</h2>
    <div class="example-box" style="max-width:320px">
      <usli-select placeholder="Choose an option">
        <option value="a">Option A</option>
        <option value="b">Option B</option>
        <option value="c">Option C</option>
      </usli-select>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-select placeholder="Choose an option"&gt;
  &lt;option value="a"&gt;Option A&lt;/option&gt;
  &lt;option value="b"&gt;Option B&lt;/option&gt;
&lt;/usli-select&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">With FormField</h2>
    <div class="example-box" style="max-width:320px">
      <usli-form-field label="Country">
        <usli-select [formControl]="countryCtrl" placeholder="Select a country">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="au">Australia</option>
        </usli-select>
      </usli-form-field>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-form-field label="Country"&gt;
  &lt;usli-select [formControl]="countryCtrl" placeholder="Select a country"&gt;
    &lt;option value="us"&gt;United States&lt;/option&gt;
  &lt;/usli-select&gt;
&lt;/usli-form-field&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="prop-name">placeholder</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Renders a disabled placeholder option when set.</td></tr>
        <tr><td><span class="prop-name">errorMessage</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Standalone error message.</td></tr>
      </tbody>
    </table>
  </section>
</div>
```

- [ ] **Step 9: Create select-docs.scss**

```scss
// projects/showcase/src/app/pages/components/select/select-docs.scss
@use '../../docs-page';
```

- [ ] **Step 10: Create checkbox-docs.ts**

```typescript
// projects/showcase/src/app/pages/components/checkbox/checkbox-docs.ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliCheckboxComponent, UsliFormFieldComponent } from 'ui-sdk';

@Component({
  selector: 'app-checkbox-docs',
  standalone: true,
  imports: [UsliCheckboxComponent, UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './checkbox-docs.html',
  styleUrl: './checkbox-docs.scss',
})
export class CheckboxDocs {
  termsCtrl = new FormControl(false, Validators.requiredTrue);
}
```

- [ ] **Step 11: Create checkbox-docs.html**

```html
<!-- projects/showcase/src/app/pages/components/checkbox/checkbox-docs.html -->
<div class="page">
  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Checkbox</span>
    </nav>
    <h1 class="page-title">Checkbox</h1>
    <p class="page-lead">A checkbox that integrates with Angular Reactive Forms. Emits boolean values.</p>
  </header>

  <section class="section">
    <h2 class="section__title">With label</h2>
    <div class="example-box">
      <usli-checkbox label="I accept the terms and conditions" />
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-checkbox label="I accept the terms and conditions" /&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">With FormField</h2>
    <div class="example-box">
      <usli-form-field>
        <usli-checkbox [formControl]="termsCtrl" label="I accept the terms and conditions" />
      </usli-form-field>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-form-field&gt;
  &lt;usli-checkbox [formControl]="termsCtrl" label="I accept the terms" /&gt;
&lt;/usli-form-field&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="prop-name">label</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Label text shown next to the checkbox.</td></tr>
        <tr><td><span class="prop-name">errorMessage</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Standalone error message.</td></tr>
      </tbody>
    </table>
  </section>
</div>
```

- [ ] **Step 12: Create checkbox-docs.scss**

```scss
// projects/showcase/src/app/pages/components/checkbox/checkbox-docs.scss
@use '../../docs-page';
```

- [ ] **Step 13: Create radio-group-docs.ts**

```typescript
// projects/showcase/src/app/pages/components/radio-group/radio-group-docs.ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliRadioGroupComponent, UsliRadioComponent, UsliFormFieldComponent } from 'ui-sdk';

@Component({
  selector: 'app-radio-group-docs',
  standalone: true,
  imports: [UsliRadioGroupComponent, UsliRadioComponent, UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './radio-group-docs.html',
  styleUrl: './radio-group-docs.scss',
})
export class RadioGroupDocs {
  planCtrl = new FormControl('', Validators.required);
}
```

- [ ] **Step 14: Create radio-group-docs.html**

```html
<!-- projects/showcase/src/app/pages/components/radio-group/radio-group-docs.html -->
<div class="page">
  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Radio Group</span>
    </nav>
    <h1 class="page-title">Radio Group</h1>
    <p class="page-lead">
      A group of radio buttons that integrates with Angular Reactive Forms.
      Use usli-radio-group as the CVA container and usli-radio for individual options.
    </p>
  </header>

  <section class="section">
    <h2 class="section__title">Default</h2>
    <div class="example-box">
      <usli-radio-group>
        <usli-radio value="a" label="Option A" />
        <usli-radio value="b" label="Option B" />
        <usli-radio value="c" label="Option C" />
      </usli-radio-group>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-radio-group&gt;
  &lt;usli-radio value="a" label="Option A" /&gt;
  &lt;usli-radio value="b" label="Option B" /&gt;
&lt;/usli-radio-group&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">With FormField</h2>
    <div class="example-box">
      <usli-form-field label="Select a plan">
        <usli-radio-group [formControl]="planCtrl">
          <usli-radio value="starter" label="Starter" />
          <usli-radio value="pro" label="Pro" />
          <usli-radio value="enterprise" label="Enterprise" />
        </usli-radio-group>
      </usli-form-field>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-form-field label="Select a plan"&gt;
  &lt;usli-radio-group [formControl]="planCtrl"&gt;
    &lt;usli-radio value="starter" label="Starter" /&gt;
    &lt;usli-radio value="pro" label="Pro" /&gt;
  &lt;/usli-radio-group&gt;
&lt;/usli-form-field&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API — usli-radio-group</h2>
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="prop-name">errorMessage</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Standalone error message.</td></tr>
      </tbody>
    </table>
    <h2 class="section__title" style="margin-top:24px">API — usli-radio</h2>
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="prop-name">value</span></td><td><span class="prop-type">unknown (required)</span></td><td>—</td><td>The value this radio represents.</td></tr>
        <tr><td><span class="prop-name">label</span></td><td><span class="prop-type">string (required)</span></td><td>—</td><td>Label text shown next to the radio button.</td></tr>
      </tbody>
    </table>
  </section>
</div>
```

- [ ] **Step 15: Create radio-group-docs.scss**

```scss
// projects/showcase/src/app/pages/components/radio-group/radio-group-docs.scss
@use '../../docs-page';
```

- [ ] **Step 16: Create form-field-docs.ts**

```typescript
// projects/showcase/src/app/pages/components/form-field/form-field-docs.ts
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  UsliFormFieldComponent, UsliInputComponent, UsliTextareaComponent,
  UsliSelectComponent, UsliCheckboxComponent,
  UsliRadioGroupComponent, UsliRadioComponent,
} from 'ui-sdk';

@Component({
  selector: 'app-form-field-docs',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    UsliFormFieldComponent, UsliInputComponent, UsliTextareaComponent,
    UsliSelectComponent, UsliCheckboxComponent,
    UsliRadioGroupComponent, UsliRadioComponent,
  ],
  templateUrl: './form-field-docs.html',
  styleUrl: './form-field-docs.scss',
})
export class FormFieldDocs {
  form = new FormGroup({
    name:    new FormControl('', Validators.required),
    email:   new FormControl('', [Validators.required, Validators.email]),
    country: new FormControl('', Validators.required),
    notes:   new FormControl('', Validators.minLength(10)),
    plan:    new FormControl('', Validators.required),
    terms:   new FormControl(false, Validators.requiredTrue),
  });
}
```

- [ ] **Step 17: Create form-field-docs.html**

```html
<!-- projects/showcase/src/app/pages/components/form-field/form-field-docs.html -->
<div class="page">
  <header class="page-header">
    <nav class="breadcrumb">
      <span>Components</span>
      <span class="breadcrumb__sep">/</span>
      <span class="breadcrumb__current">Form Field</span>
    </nav>
    <h1 class="page-title">Form Field</h1>
    <p class="page-lead">
      A layout wrapper that provides a label and automatic error message display.
      It queries for a usli-form-control child via Angular's DI tree and reads
      validation state from the injected NgControl.
    </p>
  </header>

  <section class="section">
    <h2 class="section__title">Full form example</h2>
    <p class="section__desc">
      Each field is invalid on submit. usli-form-field automatically shows the correct
      error message once the field is touched.
    </p>
    <div class="example-box" style="max-width:400px">
      <form [formGroup]="form" style="display:flex;flex-direction:column;gap:16px">
        <usli-form-field label="Full name">
          <usli-input formControlName="name" placeholder="Jane Smith" />
        </usli-form-field>
        <usli-form-field label="Email">
          <usli-input formControlName="email" type="email" placeholder="you@example.com" />
        </usli-form-field>
        <usli-form-field label="Country">
          <usli-select formControlName="country" placeholder="Select a country">
            <option value="us">United States</option>
            <option value="uk">United Kingdom</option>
            <option value="au">Australia</option>
          </usli-select>
        </usli-form-field>
        <usli-form-field label="Notes (min 10 chars)">
          <usli-textarea formControlName="notes" placeholder="Enter notes..." />
        </usli-form-field>
        <usli-form-field label="Plan">
          <usli-radio-group formControlName="plan">
            <usli-radio value="starter" label="Starter" />
            <usli-radio value="pro" label="Pro" />
            <usli-radio value="enterprise" label="Enterprise" />
          </usli-radio-group>
        </usli-form-field>
        <usli-form-field>
          <usli-checkbox formControlName="terms" label="I accept the terms and conditions" />
        </usli-form-field>
      </form>
    </div>
    <div class="code-block">
      <pre><code>&lt;usli-form-field label="Email"&gt;
  &lt;usli-input formControlName="email" type="email" /&gt;
&lt;/usli-form-field&gt;</code></pre>
    </div>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">Error message map</h2>
    <p class="section__desc">
      usli-form-field derives a human-readable message from the first Angular validator error key.
    </p>
    <table class="api-table">
      <thead><tr><th>Validator</th><th>Message</th></tr></thead>
      <tbody>
        <tr><td>required</td><td>This field is required</td></tr>
        <tr><td>email</td><td>Enter a valid email address</td></tr>
        <tr><td>minlength</td><td>Minimum length not met</td></tr>
        <tr><td>maxlength</td><td>Maximum length exceeded</td></tr>
        <tr><td>min</td><td>Value is too small</td></tr>
        <tr><td>max</td><td>Value is too large</td></tr>
        <tr><td>other</td><td>Invalid value</td></tr>
      </tbody>
    </table>
  </section>

  <hr class="divider" />

  <section class="section">
    <h2 class="section__title">API</h2>
    <table class="api-table">
      <thead><tr><th>Name</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
      <tbody>
        <tr><td><span class="prop-name">label</span></td><td><span class="prop-type">string | undefined</span></td><td><span class="prop-default">undefined</span></td><td>Label rendered above the projected control.</td></tr>
      </tbody>
    </table>
  </section>
</div>
```

- [ ] **Step 18: Create form-field-docs.scss**

```scss
// projects/showcase/src/app/pages/components/form-field/form-field-docs.scss
@use '../../docs-page';
```

- [ ] **Step 19: Update app.routes.ts**

Replace the contents of `projects/showcase/src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'components/button',
    loadComponent: () => import('./pages/components/button/button-docs').then(m => m.ButtonDocs),
  },
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/components/badge/badge-docs').then(m => m.BadgeDocs),
  },
  {
    path: 'components/alert',
    loadComponent: () => import('./pages/components/alert/alert-docs').then(m => m.AlertDocs),
  },
  {
    path: 'components/card',
    loadComponent: () => import('./pages/components/card/card-docs').then(m => m.CardDocs),
  },
  {
    path: 'components/spinner',
    loadComponent: () => import('./pages/components/spinner/spinner-docs').then(m => m.SpinnerDocs),
  },
  {
    path: 'components/input',
    loadComponent: () => import('./pages/components/input/input-docs').then(m => m.InputDocs),
  },
  {
    path: 'components/textarea',
    loadComponent: () => import('./pages/components/textarea/textarea-docs').then(m => m.TextareaDocs),
  },
  {
    path: 'components/select',
    loadComponent: () => import('./pages/components/select/select-docs').then(m => m.SelectDocs),
  },
  {
    path: 'components/checkbox',
    loadComponent: () => import('./pages/components/checkbox/checkbox-docs').then(m => m.CheckboxDocs),
  },
  {
    path: 'components/radio-group',
    loadComponent: () => import('./pages/components/radio-group/radio-group-docs').then(m => m.RadioGroupDocs),
  },
  {
    path: 'components/form-field',
    loadComponent: () => import('./pages/components/form-field/form-field-docs').then(m => m.FormFieldDocs),
  },
  {
    path: 'design/colors',
    loadComponent: () => import('./pages/design/colors/colors-docs').then(m => m.ColorsDocs),
  },
  {
    path: 'design/typography',
    loadComponent: () => import('./pages/design/typography/typography-docs').then(m => m.TypographyDocs),
  },
  { path: '**', redirectTo: '' },
];
```

- [ ] **Step 20: Update sidebar.ts**

Replace the `sections` array in `projects/showcase/src/app/layout/sidebar/sidebar.ts`:

```typescript
  sections: NavSection[] = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', path: '/', exact: true },
      ],
    },
    {
      title: 'Components',
      items: [
        { label: 'Button',      path: '/components/button' },
        { label: 'Badge',       path: '/components/badge' },
        { label: 'Alert',       path: '/components/alert' },
        { label: 'Card',        path: '/components/card' },
        { label: 'Spinner',     path: '/components/spinner' },
        { label: 'Input',       path: '/components/input' },
        { label: 'Textarea',    path: '/components/textarea' },
        { label: 'Select',      path: '/components/select' },
        { label: 'Checkbox',    path: '/components/checkbox' },
        { label: 'Radio Group', path: '/components/radio-group' },
        { label: 'Form Field',  path: '/components/form-field' },
      ],
    },
    {
      title: 'Design System',
      items: [
        { label: 'Colors',      path: '/design/colors' },
        { label: 'Typography',  path: '/design/typography' },
      ],
    },
  ];
```

- [ ] **Step 21: Build showcase to verify**

Run: `ng build showcase`
Expected: Build succeeds with no errors.

- [ ] **Step 22: Commit**

```bash
git add projects/showcase/src/app/pages/components/input/ projects/showcase/src/app/pages/components/textarea/ projects/showcase/src/app/pages/components/select/ projects/showcase/src/app/pages/components/checkbox/ projects/showcase/src/app/pages/components/radio-group/ projects/showcase/src/app/pages/components/form-field/ projects/showcase/src/app/app.routes.ts projects/showcase/src/app/layout/sidebar/sidebar.ts
git commit -m "feat: add showcase pages for form components"
```

---

### Task 11: Build verification and compodoc

**Files:**
- No new files — verification only.

- [ ] **Step 1: Run all tests**

Run: `ng test ui-sdk --watch=false`
Expected: All tests pass (no failures).

- [ ] **Step 2: Build ui-sdk**

Run: `ng build ui-sdk`
Expected: Build succeeds.

- [ ] **Step 3: Build showcase**

Run: `ng build showcase`
Expected: Build succeeds.

- [ ] **Step 4: Regenerate compodoc documentation.json**

Run: `npm run compodoc`
Expected: `docs/documentation.json` updated with new form component entries.

- [ ] **Step 5: Commit**

```bash
git add docs/documentation.json
git commit -m "Regenerate compodoc documentation.json for form components"
```
