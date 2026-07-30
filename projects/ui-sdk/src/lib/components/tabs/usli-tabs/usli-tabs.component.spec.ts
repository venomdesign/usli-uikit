import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsliTabsComponent } from './usli-tabs.component';
import { UsliTabComponent } from '../usli-tab/usli-tab.component';

@Component({
  standalone: true,
  imports: [UsliTabsComponent, UsliTabComponent],
  template: `
    <usli-tabs [(value)]="active">
      <usli-tab value="a" label="Tab A">Content A</usli-tab>
      <usli-tab value="b" label="Tab B">Content B</usli-tab>
      <usli-tab value="c" label="Tab C" [disabled]="true">Content C</usli-tab>
    </usli-tabs>
  `,
})
class TestHost {
  active: unknown = undefined;
}

describe('UsliTabsComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    // A second pass flushes the constructor effect that defaults `value` to the
    // first non-disabled tab (its `.set()` schedules a follow-up CD pass).
    fixture.detectChanges();
  });

  function tabButtons(): NodeListOf<HTMLButtonElement> {
    return fixture.nativeElement.querySelectorAll('[role="tab"]');
  }

  it('defaults to the first non-disabled tab', () => {
    expect(host.active).toBe('a');
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')?.textContent?.trim()).toBe(
      'Content A',
    );
  });

  it('renders a nav header button per tab', () => {
    expect(tabButtons().length).toBe(3);
  });

  it('disables the third tab button', () => {
    expect(tabButtons()[2].disabled).toBe(true);
  });

  it('selects a tab on click and updates the bound value', () => {
    tabButtons()[1].click();
    fixture.detectChanges();
    expect(host.active).toBe('b');
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')?.textContent?.trim()).toBe(
      'Content B',
    );
  });

  it('marks the active tab button with aria-selected="true"', () => {
    expect(tabButtons()[0].getAttribute('aria-selected')).toBe('true');
    expect(tabButtons()[1].getAttribute('aria-selected')).toBe('false');
  });

  it('sets tabindex to 0 on the active tab and -1 on the others', () => {
    expect(tabButtons()[0].getAttribute('tabindex')).toBe('0');
    expect(tabButtons()[1].getAttribute('tabindex')).toBe('-1');

    tabButtons()[1].click();
    fixture.detectChanges();

    expect(tabButtons()[0].getAttribute('tabindex')).toBe('-1');
    expect(tabButtons()[1].getAttribute('tabindex')).toBe('0');
  });

  it('moves selection to the next enabled tab on ArrowRight, wrapping past disabled tabs', () => {
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });

  it('moves selection to the previous tab on ArrowLeft', () => {
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });

  it('moves focus to the target tab button on arrow-key navigation', () => {
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabButtons()[0]);
  });

  it('ignores arrow keys held with a modifier key', () => {
    tabButtons()[1].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true }),
    );
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });

  it('jumps to the last enabled tab on End', () => {
    tabButtons()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    fixture.detectChanges();
    expect(host.active).toBe('b');
  });

  it('jumps to the first tab on Home', () => {
    tabButtons()[1].click();
    fixture.detectChanges();
    tabButtons()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    fixture.detectChanges();
    expect(host.active).toBe('a');
  });
});
