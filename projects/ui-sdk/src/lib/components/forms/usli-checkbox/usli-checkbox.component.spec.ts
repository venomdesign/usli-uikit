import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { UsliCheckboxComponent } from './usli-checkbox.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliCheckboxComponent],
  template: `<usli-checkbox [formControl]="ctrl" [label]="label()" [errorMessage]="errorMessage()" />`,
})
class TestHost {
  ctrl = new FormControl(false);
  label = signal<string | undefined>(undefined);
  errorMessage = signal<string | undefined>(undefined);
}

describe('UsliCheckboxComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a checkbox input', () => {
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeTruthy();
  });

  it('renders a label when label input is set', () => {
    host.label.set('Accept terms');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.form-check-label')?.textContent?.trim()).toBe('Accept terms');
  });

  it('renders no label element when label is not set', () => {
    expect(fixture.nativeElement.querySelector('.form-check-label')).toBeNull();
  });

  it('has no is-invalid class by default', () => {
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBe(false);
  });

  it('adds is-invalid when errorMessage is set', () => {
    host.errorMessage.set('Must accept');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').classList.contains('is-invalid')).toBe(true);
  });

  it('shows the errorMessage text', () => {
    host.errorMessage.set('Must accept');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Must accept');
  });

  it('updates formControl value when toggled', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe(true);
  });

  it('disables the checkbox when formControl is disabled', () => {
    host.ctrl.disable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input').disabled).toBe(true);
  });
});
