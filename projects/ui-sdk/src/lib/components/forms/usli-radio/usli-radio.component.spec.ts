import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { USLI_RADIO_GROUP, type UsliRadioGroupControl } from '../radio-group.token';
import { UsliRadioComponent } from './usli-radio.component';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('UsliRadioComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockGroup: UsliRadioGroupControl;

  beforeEach(async () => {
    mockGroup = {
      value: signal(''),
      select: vi.fn(),
      onTouched: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UsliRadioComponent],
      providers: [{ provide: USLI_RADIO_GROUP, useValue: mockGroup }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('renders a radio input with the correct label', () => {
    expect(fixture.nativeElement.querySelector('input[type="radio"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.form-check-label')?.textContent?.trim()).toBe('Option X');
  });

  it('calls group.select with its value when changed', () => {
    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('change'));
    expect(mockGroup.select).toHaveBeenCalledWith('x');
  });

  it('calls group.onTouched when blurred', () => {
    fixture.nativeElement.querySelector('input').dispatchEvent(new Event('blur'));
    expect(mockGroup.onTouched).toHaveBeenCalled();
  });
});

@Component({
  standalone: true,
  imports: [UsliRadioComponent],
  template: `<usli-radio value="x" label="Option X" />`,
})
class TestComponent {}
