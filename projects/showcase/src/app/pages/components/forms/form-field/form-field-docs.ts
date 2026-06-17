import { Component } from '@angular/core';
import { UsliFormFieldComponent } from 'ui-sdk';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-field-docs',
  standalone: true,
  imports: [UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './form-field-docs.html',
  styleUrl: './form-field-docs.scss',
})
export class FormFieldDocs {}
