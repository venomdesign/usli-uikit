import { InjectionToken, Signal } from '@angular/core';
import type { ButtonVariant } from '../button';

export interface UsliAccordionControl {
  readonly variant: Signal<ButtonVariant | undefined>;
  isExpanded(value: unknown): boolean;
  toggle(value: unknown): void;
}

export const USLI_ACCORDION = new InjectionToken<UsliAccordionControl>('USLI_ACCORDION');
