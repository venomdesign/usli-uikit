import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliFormFieldComponent } from './usli-form-field.component';
import { UsliInputComponent } from '../usli-input/usli-input.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliFormFieldComponent, UsliInputComponent],
  template: `
    <usli-form-field [label]="label">
      <usli-input [formControl]="ctrl" />
    </usli-form-field>
  `,
})
class TestHost {
  ctrl = new FormControl('', Validators.required);
  label: string | undefined = undefined;
}

describe('UsliFormFieldComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a label when label input is set', () => {
    host.label = 'Email';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-label')?.textContent?.trim()).toBe('Email');
  });

  it('renders no label when label is not set', () => {
    expect(fixture.nativeElement.querySelector('.form-label')).toBeNull();
  });

  it('shows no error when pristine even if invalid', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });

  it('shows required error when invalid and touched', () => {
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('This field is required');
  });

  it('shows email error for email validator', () => {
    host.ctrl = new FormControl('notanemail', Validators.email);
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Enter a valid email address');
  });

  it('shows minlength error for minlength validator', () => {
    host.ctrl = new FormControl('a', Validators.minLength(5));
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Minimum length not met');
  });

  it('shows fallback message for unknown error keys', () => {
    host.ctrl.setErrors({ customError: true });
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Invalid value');
  });

  it('shows no error when control is valid', () => {
    host.ctrl.setValue('hello');
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });
});
