import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-radio-group-docs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './radio-group-docs.html',
  styleUrl: './radio-group-docs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadioGroupDocs implements OnInit {
  radioForm!: FormGroup;
  selectionControl!: FormControl;
  preferenceControl!: FormControl;
  agreementControl!: FormControl;

  radioOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  ngOnInit(): void {
    this.selectionControl = new FormControl('', Validators.required);
    this.preferenceControl = new FormControl('option1');
    this.agreementControl = new FormControl('', Validators.required);

    this.radioForm = new FormGroup({
      selection: this.selectionControl,
      preference: this.preferenceControl,
      agreement: this.agreementControl,
    });
  }
}
