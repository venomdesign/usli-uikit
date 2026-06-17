import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, contentChild, inject, input } from '@angular/core';
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
