import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliSpinnerComponent } from './usli-spinner.component';

describe('UsliSpinnerComponent', () => {
  let fixture: ComponentFixture<UsliSpinnerComponent>;
  let component: UsliSpinnerComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliSpinnerComponent);
    component = fixture.componentInstance;
  });

  it('defaults to a medium border spinner with no variant class', () => {
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-spinner', 'spinner-border'].sort());
  });

  it('applies the small size modifier', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-spinner', 'spinner-border', 'spinner-border-sm'].sort());
  });

  it('applies the large size modifier and a variant class', () => {
    fixture.componentRef.setInput('size', 'large');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-spinner', 'spinner-border', 'spinner-usli-lg', 'spinner-usli-success'].sort());
  });

  it('switches to the grow type', () => {
    fixture.componentRef.setInput('type', 'grow');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-spinner', 'spinner-grow'].sort());
  });

  it('renders the label as visually-hidden text', () => {
    fixture.componentRef.setInput('label', 'Saving...');
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('.visually-hidden');
    expect(span.textContent?.trim()).toBe('Saving...');
  });
});
