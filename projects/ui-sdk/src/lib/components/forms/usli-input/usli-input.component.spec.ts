import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliInputComponent } from './usli-input.component';

/**
 * Signal-aware TestHost: type / placeholder / errorMessage are signals so that
 * Angular 21's signal-reactive change-detection graph propagates changes
 * cleanly without triggering ExpressionChangedAfterItHasBeenCheckedError.
 * (Plain-property bindings to signal inputs on an OnPush child can misfire
 * checkNoChanges in Angular 21; using signal bindings avoids this.)
 *
 * `ctrl` stays a plain property because `[formControl]` is NOT a signal input.
 */
@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliInputComponent],
  template: `<usli-input [formControl]="ctrl" [type]="type()" [placeholder]="placeholder()" [errorMessage]="errorMessage()" />`,
})
class TestHost {
  ctrl = new FormControl('');
  type = signal('text');
  placeholder = signal('');
  errorMessage = signal<string | undefined>(undefined);
}

describe('UsliInputComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a text input', () => {
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });

  it('applies the type input', () => {
    host.type.set('email');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').type).toBe('email');
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBe(false);
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage.set('Required');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBe(true);
  });

  it('shows the errorMessage text', () => {
    host.errorMessage.set('Required');
    fixture.detectChanges();
    const err: HTMLElement = fixture.nativeElement.querySelector('.invalid-feedback');
    expect(err?.textContent?.trim()).toBe('Required');
  });

  it('shows no error div when errorMessage is not set', () => {
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });

  it('updates formControl value when user types', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('hello');
  });

  it('disables the input when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl.setValidators(Validators.required);
    host.ctrl.updateValueAndValidity();
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBe(true);
  });
});
