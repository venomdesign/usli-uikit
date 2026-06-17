import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsliTextareaComponent, UsliFormFieldComponent } from 'ui-sdk';

@Component({
  selector: 'app-textarea-docs',
  standalone: true,
  imports: [UsliTextareaComponent, UsliFormFieldComponent, ReactiveFormsModule],
  templateUrl: './textarea-docs.html',
  styleUrl: './textarea-docs.scss',
})
export class TextareaDocs {
  notesCtrl = new FormControl('', Validators.required);
}
