import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliSelectComponent } from './usli-select.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliSelectComponent],
  template: `
    <usli-select [formControl]="ctrl" [placeholder]="placeholder()" [errorMessage]="errorMessage()">
      <option value="a">Option A</option>
      <option value="b">Option B</option>
    </usli-select>
  `,
})
class TestHost {
  ctrl = new FormControl('');
  placeholder = signal<string | undefined>(undefined);
  errorMessage = signal<string | undefined>(undefined);
}

describe('UsliSelectComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a select element', () => {
    expect(fixture.nativeElement.querySelector('select')).toBeTruthy();
  });

  it('renders a placeholder option when placeholder is set', () => {
    host.placeholder.set('Choose one');
    fixture.detectChanges();
    const opt: HTMLOptionElement = fixture.nativeElement.querySelector('option[value=""]');
    expect(opt?.textContent?.trim()).toBe('Choose one');
    expect(opt?.disabled).toBe(true);
  });

  it('does not render a placeholder option when placeholder is not set', () => {
    expect(fixture.nativeElement.querySelector('option[value=""]')).toBeNull();
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('select').classList.contains('is-invalid')).toBe(false);
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage.set('Select a value');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').classList.contains('is-invalid')).toBe(true);
  });

  it('shows the errorMessage text', () => {
    host.errorMessage.set('Select a value');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Select a value');
  });

  it('updates formControl value when user selects', () => {
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('select');
    select.value = 'a';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('a');
  });

  it('disables the select when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').disabled).toBe(true);
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl.setValidators(Validators.required);
    host.ctrl.updateValueAndValidity();
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('select').classList.contains('is-invalid')).toBe(true);
  });
});
