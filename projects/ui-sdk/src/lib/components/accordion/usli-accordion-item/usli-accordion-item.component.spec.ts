import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { USLI_ACCORDION, type UsliAccordionControl } from '../usli-accordion.token';
import { UsliAccordionItemComponent } from './usli-accordion-item.component';

@Component({
  standalone: true,
  imports: [UsliAccordionItemComponent],
  template: `<usli-accordion-item value="a" label="Item A">Body A</usli-accordion-item>`,
})
class TestHost {}

async function setup(isExpanded: boolean) {
  const mockGroup: UsliAccordionControl = {
    variant: signal(undefined),
    isExpanded: vi.fn().mockReturnValue(isExpanded),
    toggle: vi.fn(),
  };

  await TestBed.configureTestingModule({
    imports: [TestHost],
    providers: [{ provide: USLI_ACCORDION, useValue: mockGroup }],
  }).compileComponents();

  const fixture: ComponentFixture<TestHost> = TestBed.createComponent(TestHost);
  fixture.detectChanges();
  return { fixture, mockGroup };
}

describe('UsliAccordionItemComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders collapsed when the group reports it is not expanded', async () => {
    const { fixture } = await setup(false);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.accordion-button');
    expect(button.classList.contains('collapsed')).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders expanded when the group reports it is expanded', async () => {
    const { fixture } = await setup(true);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.accordion-button');
    const collapse: HTMLElement = fixture.nativeElement.querySelector('.accordion-collapse');
    expect(button.classList.contains('collapsed')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(collapse.classList.contains('show')).toBe(true);
  });

  it('calls group.toggle with its own value when the header button is clicked', async () => {
    const { fixture, mockGroup } = await setup(false);
    fixture.nativeElement.querySelector('.accordion-button').click();
    expect(mockGroup.toggle).toHaveBeenCalledWith('a');
  });

  it('links the header button and panel via aria-controls / id', async () => {
    const { fixture } = await setup(false);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.accordion-button');
    const collapse: HTMLElement = fixture.nativeElement.querySelector('.accordion-collapse');
    expect(button.getAttribute('aria-controls')).toBe(collapse.id);
  });
});
