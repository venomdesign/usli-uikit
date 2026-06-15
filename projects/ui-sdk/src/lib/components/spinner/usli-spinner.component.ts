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
