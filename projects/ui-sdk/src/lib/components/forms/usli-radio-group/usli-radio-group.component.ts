import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
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
      this.ngControl.statusChanges?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.cdr.markForCheck());
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
