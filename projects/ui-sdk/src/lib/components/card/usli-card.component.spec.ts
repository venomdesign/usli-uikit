import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliCardComponent } from './usli-card.component';

describe('UsliCardComponent', () => {
  let fixture: ComponentFixture<UsliCardComponent>;
  let component: UsliCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliCardComponent);
    component = fixture.componentInstance;
  });

  it('renders without a variant class by default', () => {
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-card', 'card'].sort());
  });

  it('applies the requested variant class', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-card', 'card', 'card-usli-success'].sort());
  });

  it('renders the title and subtitle', () => {
    fixture.componentRef.setInput('title', 'Policy Summary');
    fixture.componentRef.setInput('subtitle', 'Updated today');
    fixture.detectChanges();
    const titleEl: HTMLElement = fixture.nativeElement.querySelector('.card-title');
    const subtitleEl: HTMLElement = fixture.nativeElement.querySelector('.card-subtitle');
    expect(titleEl.textContent?.trim()).toBe('Policy Summary');
    expect(subtitleEl.textContent?.trim()).toBe('Updated today');
  });
});
