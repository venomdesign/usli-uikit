import { Component } from '@angular/core';
import { UsliSelectComponent } from 'ui-sdk';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-select-docs',
  standalone: true,
  imports: [UsliSelectComponent, ReactiveFormsModule],
  templateUrl: './select-docs.html',
  styleUrl: './select-docs.scss',
})
export class SelectDocs {}
