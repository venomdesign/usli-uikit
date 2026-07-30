import { InjectionToken, Signal } from '@angular/core';

export interface UsliTabsControl {
  readonly value: Signal<unknown>;
  select(value: unknown): void;
}

export const USLI_TABS = new InjectionToken<UsliTabsControl>('USLI_TABS');
