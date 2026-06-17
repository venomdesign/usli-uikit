import { InjectionToken, Signal } from '@angular/core';

export interface UsliRadioGroupControl {
  readonly value: Signal<unknown>;
  select(value: unknown): void;
  onTouched(): void;
}

export const USLI_RADIO_GROUP = new InjectionToken<UsliRadioGroupControl>('USLI_RADIO_GROUP');
