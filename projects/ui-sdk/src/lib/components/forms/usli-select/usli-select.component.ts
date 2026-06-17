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
