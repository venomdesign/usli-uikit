import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  contentChildren,
  effect,
  input,
  model,
  viewChildren,
} from '@angular/core';
import type { ButtonVariant } from '../../button';
import { USLI_TABS, type UsliTabsControl } from '../usli-tabs.token';
import { UsliTabComponent } from '../usli-tab/usli-tab.component';

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'] as const;
type ArrowKey = (typeof ARROW_KEYS)[number];

@Component({
  selector: 'usli-tabs',
  standalone: true,
  templateUrl: './usli-tabs.component.html',
  styleUrl: './usli-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: USLI_TABS, useExisting: UsliTabsComponent }],
})
export class UsliTabsComponent implements UsliTabsControl {
  /** Two-way bindable via [(value)]. Defaults to the first non-disabled tab. */
  value = model<unknown>(undefined);

  /** Optional accent color for the active tab underline */
  variant = input<ButtonVariant | undefined>();

  protected tabs = contentChildren(UsliTabComponent);
  protected tabButtons = viewChildren<ElementRef<HTMLButtonElement>>('tabButton');

  protected classes = computed(() => {
    const v = this.variant();
    return v ? `usli-tabs usli-tabs--${v}` : 'usli-tabs';
  });

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      if (this.value() !== undefined || tabs.length === 0) return;
      const firstEnabled = tabs.find((tab) => !tab.disabled());
      if (firstEnabled) this.value.set(firstEnabled.value());
    });
  }

  select(value: unknown): void {
    this.value.set(value);
  }

  protected onKeydown(event: KeyboardEvent, tab: UsliTabComponent): void {
    if (!(ARROW_KEYS as readonly string[]).includes(event.key)) return;
    event.preventDefault();

    const all = this.tabs();
    const enabled = all.filter((t) => !t.disabled());
    if (enabled.length === 0) return;

    const key = event.key as ArrowKey;
    const currentEnabledIndex = enabled.indexOf(tab);
    let targetIndex: number;
    if (key === 'Home') targetIndex = 0;
    else if (key === 'End') targetIndex = enabled.length - 1;
    else if (key === 'ArrowLeft')
      targetIndex = (currentEnabledIndex - 1 + enabled.length) % enabled.length;
    else targetIndex = (currentEnabledIndex + 1) % enabled.length;

    const targetTab = enabled[targetIndex];
    this.select(targetTab.value());
    this.tabButtons()[all.indexOf(targetTab)]?.nativeElement.focus();
  }
}
