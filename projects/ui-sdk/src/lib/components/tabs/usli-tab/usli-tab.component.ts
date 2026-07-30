import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { USLI_TABS } from '../usli-tabs.token';

let uid = 0;

@Component({
  selector: 'usli-tab',
  standalone: true,
  templateUrl: './usli-tab.component.html',
  styleUrl: './usli-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsliTabComponent {
  /** Unique value identifying this tab within its usli-tabs parent */
  value = input.required<unknown>();

  /** Text shown in the tab's header button */
  label = input.required<string>();

  /** Prevents selection via click or keyboard navigation */
  disabled = input(false);

  private readonly id = uid++;

  /** id of this tab's header button — read by usli-tabs for aria-controls */
  readonly tabId = `usli-tab-${this.id}`;

  /** id of this tab's content panel — read by usli-tabs for aria-controls */
  readonly panelId = `usli-tab-panel-${this.id}`;

  private readonly group = inject(USLI_TABS);

  protected isActive = computed(() => this.group.value() === this.value());
}
