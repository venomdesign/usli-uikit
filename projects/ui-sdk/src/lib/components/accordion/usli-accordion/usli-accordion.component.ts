import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import type { ButtonVariant } from '../../button';
import { USLI_ACCORDION, type UsliAccordionControl } from '../usli-accordion.token';

@Component({
  selector: 'usli-accordion',
  standalone: true,
  templateUrl: './usli-accordion.component.html',
  styleUrl: './usli-accordion.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_ACCORDION, useExisting: UsliAccordionComponent }],
})
export class UsliAccordionComponent implements UsliAccordionControl {
  /** Allows more than one panel to be expanded at once */
  multiple = input(false);

  /**
   * Two-way bindable via [(expanded)]. A single value in single-open mode
   * (the default), or an array of values when multiple is true.
   */
  expanded = model<unknown | unknown[]>(undefined);

  /** Optional accent color applied to each item's expanded state */
  variant = input<ButtonVariant | undefined>();

  isExpanded(value: unknown): boolean {
    if (this.multiple()) {
      return ((this.expanded() as unknown[]) ?? []).includes(value);
    }
    return this.expanded() === value;
  }

  toggle(value: unknown): void {
    if (this.multiple()) {
      const current = (this.expanded() as unknown[]) ?? [];
      this.expanded.set(
        current.includes(value) ? current.filter((v) => v !== value) : [...current, value],
      );
    } else {
      this.expanded.set(this.expanded() === value ? undefined : value);
    }
  }
}
