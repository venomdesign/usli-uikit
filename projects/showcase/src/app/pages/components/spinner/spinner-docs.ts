import { Component } from '@angular/core';
import { UsliSpinnerComponent } from 'ui-sdk';

@Component({
  selector: 'app-spinner-docs',
  standalone: true,
  imports: [UsliSpinnerComponent],
  templateUrl: './spinner-docs.html',
  styleUrl: './spinner-docs.scss',
})
export class SpinnerDocs {}
