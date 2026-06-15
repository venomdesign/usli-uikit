import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ButtonVariant } from '../button';

@Component({
  selector: 'usli-badge',
  standalone: true,
  templateUrl: './usli-badge.component.html',
  styleUrl: './usli-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliBadgeComponent {
  /** Semantic variant */
  variant = input<ButtonVariant>('primary');

  /** Renders a fully rounded pill shape */
  pill = input(false);

  /** Label text — used when no content is projected */
  label = input('');

  protected classes = computed(() => {
    const v = this.variant();
    const pillClass = this.pill() ? ' rounded-pill' : '';
    return `usli-badge badge badge-usli-${v}${pillClass}`;
  });
}
