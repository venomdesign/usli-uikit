import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliRadioGroupComponent } from './usli-radio-group.component';
import { UsliRadioComponent } from '../usli-radio/usli-radio.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, UsliRadioGroupComponent, UsliRadioComponent],
  template: `
    <usli-radio-group [formControl]="ctrl" [errorMessage]="errorMessage()">
      <usli-radio value="a" label="Option A" />
      <usli-radio value="b" label="Option B" />
    </usli-radio-group>
  `,
})
class TestHost {
  ctrl = new FormControl('');
  errorMessage = signal<string | undefined>(undefined);
}

describe('UsliRadioGroupComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a radiogroup', () => {
    expect(fixture.nativeElement.querySelector('[role="radiogroup"]')).toBeTruthy();
  });

  it('renders projected radio items', () => {
    expect(fixture.nativeElement.querySelectorAll('input[type="radio"]').length).toBe(2);
  });

  it('updates formControl value when a radio is selected', () => {
    const radios: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    radios[0].dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(host.ctrl.value).toBe('a');
  });

  it('checks the correct radio when writeValue is called', () => {
    host.ctrl.setValue('b');
    fixture.detectChanges();
    const radios: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input[type="radio"]');
    expect(radios[1].checked).toBe(true);
    expect(radios[0].checked).toBe(false);
  });

  it('shows errorMessage when set', () => {
    host.errorMessage.set('Pick one');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.invalid-feedback')?.textContent?.trim()).toBe('Pick one');
  });

  it('shows no error div when errorMessage is not set', () => {
    expect(fixture.nativeElement.querySelector('.invalid-feedback')).toBeNull();
  });
});
