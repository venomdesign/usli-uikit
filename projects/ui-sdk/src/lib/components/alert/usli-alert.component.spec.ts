import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsliAlertComponent } from './usli-alert.component';

describe('UsliAlertComponent', () => {
  let fixture: ComponentFixture<UsliAlertComponent>;
  let component: UsliAlertComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsliAlertComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsliAlertComponent);
    component = fixture.componentInstance;
  });

  it('defaults to the info variant', () => {
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div[role="alert"]');
    expect(div.classList.value.split(' ').sort()).toEqual(['usli-alert', 'alert', 'alert-usli-info'].sort());
  });

  it('applies the requested variant and dismissible class', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();
    const div: HTMLElement = fixture.nativeElement.querySelector('div[role="alert"]');
    expect(div.classList.value.split(' ').sort()).toEqual(
      ['usli-alert', 'alert', 'alert-usli-error', 'alert-dismissible'].sort(),
    );
  });

  it('renders the title as an alert-heading', () => {
    fixture.componentRef.setInput('title', 'Heads up');
    fixture.detectChanges();
    const heading: HTMLElement = fixture.nativeElement.querySelector('.alert-heading');
    expect(heading.textContent?.trim()).toBe('Heads up');
  });

  it('hides itself and emits dismissed when the close button is clicked', () => {
    fixture.componentRef.setInput('dismissible', true);
    fixture.detectChanges();

    let dismissed = false;
    component.dismissed.subscribe(() => (dismissed = true));

    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-close');
    closeButton.click();
    fixture.detectChanges();

    expect(dismissed).toBe(true);
    expect(fixture.nativeElement.querySelector('div[role="alert"]')).toBeNull();
  });
});
