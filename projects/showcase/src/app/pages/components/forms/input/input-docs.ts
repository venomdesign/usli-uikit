import { Component } from '@angular/core';
import { UsliInputComponent } from 'ui-sdk';

@Component({
  selector: 'app-input-docs',
  standalone: true,
  imports: [UsliInputComponent],
  templateUrl: './input-docs.html',
  styleUrl: './input-docs.scss',
})
export class InputDocs {}
