import { Component } from '@angular/core';
import { UsliInputComponent } from 'ui-sdk';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-docs',
  standalone: true,
  imports: [UsliInputComponent, ReactiveFormsModule],
  templateUrl: './input-docs.html',
  styleUrl: './input-docs.scss',
})
export class InputDocs {}
