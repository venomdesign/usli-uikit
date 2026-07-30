import { Component } from '@angular/core';
import { UsliAccordionComponent, UsliAccordionItemComponent } from 'ui-sdk';

@Component({
  selector: 'app-accordion-docs',
  standalone: true,
  imports: [UsliAccordionComponent, UsliAccordionItemComponent],
  templateUrl: './accordion-docs.html',
  styleUrl: './accordion-docs.scss',
})
export class AccordionDocs {}
