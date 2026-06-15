import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

@Component({
  selector: 'usli-alert',
  standalone: true,
  templateUrl: './usli-alert.component.html',
  styleUrl: './usli-alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliAlertComponent {
  /** Semantic variant */
  variant = input<AlertVariant>('info');

  /** Optional heading rendered above the projected content */
  title = input<string | undefined>();

  /** Shows a close button that hides the alert */
  dismissible = input(false);

  /** Emitted when the close button is clicked */
  dismissed = output<void>();

  protected visible = signal(true);

  protected classes = computed(() => {
    const v = this.variant();
    const dismissibleClass = this.dismissible() ? ' alert-dismissible' : '';
    return `usli-alert alert alert-usli-${v}${dismissibleClass}`;
  });

  protected dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
