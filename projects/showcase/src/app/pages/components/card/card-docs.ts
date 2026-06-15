import { Component } from '@angular/core';
import { UsliCardComponent } from 'ui-sdk';

@Component({
  selector: 'app-card-docs',
  standalone: true,
  imports: [UsliCardComponent],
  templateUrl: './card-docs.html',
  styleUrl: './card-docs.scss',
})
export class CardDocs {}
