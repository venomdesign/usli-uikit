import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliTextareaComponent } from './usli-textarea.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliTextareaComponent],
  template: `<usli-textarea [formControl]="ctrl" [placeholder]="placeholder()" [rows]="rows()" [errorMessage]="errorMessage()" />`,
})
class TestHost {
  ctrl = new FormControl('');
  placeholder = signal('');
  rows = signal(3);
  errorMessage = signal<string | undefined>(undefined);
}

describe('UsliTextareaComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a textarea', () => {
    expect(fixture.nativeElement.querySelector('textarea')).toBeTruthy();
  });

  it('applies the rows input', () => {
    host.rows.set(5);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').rows).toBe(5);
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('textarea').classList.contains('is-invalid')).toBe(false);
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage.set('Too short');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').classList.contains('is-invalid')).toBe(true);
  });

  it('shows the errorMessage text', () => {
    host.errorMessage.set('Too short');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Too short');
  });

  it('updates formControl value when user types', () => {
    const ta: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    ta.value = 'notes';
    ta.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('notes');
  });

  it('disables the textarea when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').disabled).toBe(true);
  });

  it('adds is-invalid when ngControl is invalid and touched', () => {
    host.ctrl.setValidators(Validators.required);
    host.ctrl.updateValueAndValidity();
    fixture.detectChanges();
    host.ctrl.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('textarea').classList.contains('is-invalid')).toBe(true);
  });
});
