import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliRadioGroupComponent, UsliRadioComponent } from 'ui-sdk';

@Component({
  selector: 'app-radio-group-docs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UsliRadioGroupComponent, UsliRadioComponent],
  templateUrl: './radio-group-docs.html',
  styleUrl: './radio-group-docs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupDocs implements OnInit {
  radioForm!: FormGroup;
  selectionControl!: FormControl;
  preferenceControl!: FormControl;
  agreementControl!: FormControl;
  disabledPreferenceControl!: FormControl;

  radioOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  ngOnInit(): void {
    this.selectionControl = new FormControl('', Validators.required);
    this.preferenceControl = new FormControl('option1');
    this.agreementControl = new FormControl('', Validators.required);
    this.disabledPreferenceControl = new FormControl({ value: 'option1', disabled: true });

    this.radioForm = new FormGroup({
      selection: this.selectionControl,
      preference: this.preferenceControl,
      agreement: this.agreementControl,
    });
  }
}
