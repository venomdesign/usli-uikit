import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliCheckboxComponent } from 'ui-sdk';

@Component({
  selector: 'app-checkbox-docs',
  standalone: true,
  imports: [CommonModule, UsliCheckboxComponent, ReactiveFormsModule],
  templateUrl: './checkbox-docs.html',
  styleUrl: './checkbox-docs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxDocs {
  checkboxForm = new FormGroup({
    terms: new FormControl(false, Validators.requiredTrue),
    newsletter: new FormControl(false),
    notifications: new FormControl(true),
  });

  checkboxGroup = new FormArray([
    new FormControl(false),
    new FormControl(false),
    new FormControl(false),
  ]);
}
