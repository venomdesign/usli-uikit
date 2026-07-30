import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { USLI_ACCORDION } from '../usli-accordion.token';

let uid = 0;

@Component({
  selector: 'usli-accordion-item',
  standalone: true,
  templateUrl: './usli-accordion-item.component.html',
  styleUrl: './usli-accordion-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliAccordionItemComponent {
  /** Unique value identifying this item within its usli-accordion parent */
  value = input.required<unknown>();

  /** Text shown in the item's header button */
  label = input.required<string>();

  /** Prevents expansion via click */
  disabled = input(false);

  protected readonly panelId = `usli-accordion-panel-${uid++}`;
  protected readonly headerId = `usli-accordion-header-${uid++}`;

  private readonly group = inject(USLI_ACCORDION);

  protected isOpen = computed(() => this.group.isExpanded(this.value()));

  protected classes = computed(() => {
    const v = this.group.variant();
    return v ? `accordion-item usli-accordion-item--${v}` : 'accordion-item';
  });

  protected toggle(): void {
    this.group.toggle(this.value());
  }
}
