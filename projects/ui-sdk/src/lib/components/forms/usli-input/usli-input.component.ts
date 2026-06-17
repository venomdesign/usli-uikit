import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef,
  inject, input, signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AbstractControl, ControlValueAccessor, NgControl } from '@angular/forms';
import { USLI_FORM_CONTROL, type UsliFormControl } from '../form-control.token';

@Component({
  selector: 'usli-input',
  standalone: true,
  templateUrl: './usli-input.component.html',
  styleUrl: './usli-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_FORM_CONTROL, useExisting: UsliInputComponent }],
})
export class UsliInputComponent implements ControlValueAccessor, UsliFormControl {
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

  /** Tracks the currently subscribed control so we only re-subscribe on change. */
  private trackedControl: AbstractControl | null = null;
  private eventsSubscription: Subscription | null = null;

  constructor() {
    // Self-binding pattern: assign before FormControlDirective.ngOnChanges →
    // setUpControl() runs, so valueAccessor is found without NG_VALUE_ACCESSOR.
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    // Clean up the events subscription when the component is destroyed.
    this.destroyRef.onDestroy(() => this.eventsSubscription?.unsubscribe());
  }

  protected hasError(): boolean {
    return !!this.errorMessage() || (!!this.ngControl?.control?.invalid && !!this.ngControl?.control?.touched);
  }

  protected onInput(event: Event): void {
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  // ControlValueAccessor -------------------------------------------------

  writeValue(value: string): void {
    this.value.set(value ?? '');
    // setUpControl() calls writeValue when binding to a new control — use
    // this as the hook to (re-)subscribe to the new control's event stream
    // so we hear TouchedChangeEvent, StatusChangeEvent, etc.
    this.resubscribeToControlEvents();
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.isDisabled.set(isDisabled); }

  // Internal -------------------------------------------------------------

  /**
   * Re-subscribe to the bound control's `events` observable whenever the
   * control reference changes.  `detectChanges()` is called on each event so
   * that changes like `markAsTouched()` — which fire synchronously outside any
   * Angular CD cycle — force an immediate re-render of this OnPush component.
   * Unlike `markForCheck()`, `detectChanges()` runs CD on the component view
   * right away rather than merely scheduling a future check; this ensures the
   * DOM is up-to-date when the next `fixture.detectChanges()` reads it.
   */
  private resubscribeToControlEvents(): void {
    const ctrl = this.ngControl?.control ?? null;
    if (ctrl === this.trackedControl) return;

    this.eventsSubscription?.unsubscribe();
    this.trackedControl = ctrl;

    if (ctrl) {
      this.eventsSubscription = ctrl.events.subscribe((ev) => {
        this.cdr.detectChanges();
      });
    }
  }
}
