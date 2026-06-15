import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliBadgeComponent } from './usli-badge.component';

describe('UsliBadgeComponent', () => {
  let fixture: ComponentFixture<UsliBadgeComponent>;
  let component: UsliBadgeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliBadgeComponent);
    component = fixture.componentInstance;
  });

  it('defaults to the primary variant', () => {
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.classList.value.split(' ').sort()).toEqual(['badge', 'badge-usli-primary', 'usli-badge'].sort());
  });

  it('applies the requested variant', () => {
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.classList.value.split(' ').sort()).toEqual(['badge', 'badge-usli-success', 'usli-badge'].sort());
  });

  it('adds rounded-pill when pill is true', () => {
    fixture.componentRef.setInput('pill', true);
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.classList.value.split(' ').sort()).toEqual(
      ['badge', 'badge-usli-primary', 'rounded-pill', 'usli-badge'].sort(),
    );
  });

  it('renders the label when no content is projected', () => {
    fixture.componentRef.setInput('label', 'New');
    fixture.detectChanges();
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.textContent?.trim()).toBe('New');
  });
});
