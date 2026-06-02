import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'usli-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <button
  type="button"
  (click)="onClick.emit($event)"
  [class]="classes()"
  [style.background-color]="backgroundColor() ?? null"
>
  {{ label() }}
</button>`,
  styleUrls: ['./button.css'],
})
export class ButtonComponent {
  /** Is this the principal call to action on the page? */
  primary = input(false);

  /** What background color to use */
  backgroundColor = input<string | undefined>();

  /** How large should the button be? */
  size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * Button contents
   *
   * @required
   */
  label = input('Button');

  /** Optional click handler */
  onClick = output<Event>();

  classes = computed(() => {
    const mode = this.primary() ? 'storybook-button--primary' : 'storybook-button--secondary';
    return ['storybook-button', `storybook-button--${this.size()}`, mode].join(' ');
  });
}
