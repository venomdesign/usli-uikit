import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { USLI_TABS, type UsliTabsControl } from '../usli-tabs.token';
import { UsliTabComponent } from './usli-tab.component';

describe('UsliTabComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let activeValue: ReturnType<typeof signal<unknown>>;

  beforeEach(async () => {
    activeValue = signal<unknown>('a');
    const mockGroup: UsliTabsControl = {
      value: activeValue,
      select: () => {},
    };

    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [{ provide: USLI_TABS, useValue: mockGroup }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    fixture.detectChanges();
  });

  it('renders projected content when its value matches the active value', () => {
    const panel = fixture.nativeElement.querySelector('[role="tabpanel"]');
    expect(panel?.textContent?.trim()).toBe('Content A');
  });

  it('does not render when its value does not match the active value', () => {
    activeValue.set('b');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="tabpanel"]')).toBeNull();
  });

  it('sets aria-labelledby on the panel to its own tabId', () => {
    const panel: HTMLElement = fixture.nativeElement.querySelector('[role="tabpanel"]');
    const instance = fixture.debugElement.children[0].componentInstance as UsliTabComponent;
    expect(panel.getAttribute('aria-labelledby')).toBe(instance.tabId);
    expect(panel.id).toBe(instance.panelId);
  });
});

@Component({
  standalone: true,
  imports: [UsliTabComponent],
  template: `<usli-tab value="a" label="Tab A">Content A</usli-tab>`,
})
class TestHost {}
