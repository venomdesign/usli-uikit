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
