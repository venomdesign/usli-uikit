import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsliAccordionComponent } from './usli-accordion.component';
import { UsliAccordionItemComponent } from '../usli-accordion-item/usli-accordion-item.component';

@Component({
  standalone: true,
  imports: [UsliAccordionComponent, UsliAccordionItemComponent],
  template: `
    <usli-accordion [multiple]="multiple" [(expanded)]="expanded">
      <usli-accordion-item value="a" label="Item A">Body A</usli-accordion-item>
      <usli-accordion-item value="b" label="Item B">Body B</usli-accordion-item>
    </usli-accordion>
  `,
})
class TestHost {
  multiple = false;
  expanded: unknown = undefined;
}

describe('UsliAccordionComponent', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function itemButtons(): NodeListOf<HTMLButtonElement> {
    return fixture.nativeElement.querySelectorAll('.accordion-button');
  }

  it('renders both items collapsed by default', () => {
    expect(itemButtons()[0].classList.contains('collapsed')).toBe(true);
    expect(itemButtons()[1].classList.contains('collapsed')).toBe(true);
  });

  it('single mode: opening one item closes the other', () => {
    itemButtons()[0].click();
    fixture.detectChanges();
    expect(host.expanded).toBe('a');

    itemButtons()[1].click();
    fixture.detectChanges();
    expect(host.expanded).toBe('b');
    expect(itemButtons()[0].classList.contains('collapsed')).toBe(true);
  });

  it('single mode: clicking the open item collapses it back to none', () => {
    itemButtons()[0].click();
    fixture.detectChanges();
    itemButtons()[0].click();
    fixture.detectChanges();
    expect(host.expanded).toBeUndefined();
  });

  it('multiple mode: both items can be open at once', () => {
    host.multiple = true;
    // Zoneless change detection only walks views it knows are dirty; a plain
    // field write outside an event handler needs an explicit nudge or the
    // dev-mode checkNoChanges pass flags it as NG0100.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    itemButtons()[0].click();
    fixture.detectChanges();
    itemButtons()[1].click();
    fixture.detectChanges();

    expect(host.expanded).toEqual(['a', 'b']);
    expect(itemButtons()[0].classList.contains('collapsed')).toBe(false);
    expect(itemButtons()[1].classList.contains('collapsed')).toBe(false);
  });

  it('multiple mode: clicking an open item removes just that value', () => {
    host.multiple = true;
    host.expanded = ['a', 'b'];
    // See comment above: zoneless CD needs a nudge for plain field writes.
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    itemButtons()[0].click();
    fixture.detectChanges();

    expect(host.expanded).toEqual(['b']);
  });
});
