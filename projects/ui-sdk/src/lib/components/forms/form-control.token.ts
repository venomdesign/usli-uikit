import { InjectionToken } from '@angular/core';
import type { NgControl } from '@angular/forms';

export interface UsliFormControl {
  readonly ngControl: NgControl | null;
}

export const USLI_FORM_CONTROL = new InjectionToken<UsliFormControl>('USLI_FORM_CONTROL');
