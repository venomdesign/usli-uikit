import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliCheckboxComponent } from 'ui-sdk';

@Component({
  selector: 'app-checkbox-docs',
  standalone: true,
  imports: [CommonModule, UsliCheckboxComponent, ReactiveFormsModule],
  templateUrl: './checkbox-docs.html',
  styleUrl: './checkbox-docs.scss',
})
export class CheckboxDocs {
  checkboxForm = new FormGroup({
    terms: new FormControl(false, Validators.requiredTrue),
    newsletter: new FormControl(false),
    notifications: new FormControl(true),
  });
}
