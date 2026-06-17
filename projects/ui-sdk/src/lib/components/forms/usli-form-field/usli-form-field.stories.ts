import { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators, FormGroup } from '@angular/forms';
import { UsliFormFieldComponent } from './usli-form-field.component';
import { UsliInputComponent } from '../usli-input/usli-input.component';
import { UsliTextareaComponent } from '../usli-textarea/usli-textarea.component';
import { UsliSelectComponent } from '../usli-select/usli-select.component';

const meta: Meta<UsliFormFieldComponent> = {
  component: UsliFormFieldComponent,
  title: 'Form Components/Form Field',
  tags: ['autodocs'],
  imports: [ReactiveFormsModule, UsliInputComponent, UsliTextareaComponent, UsliSelectComponent],
};

export default meta;
type Story = StoryObj<UsliFormFieldComponent>;

export const WithInput: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('', Validators.required),
    },
    template: `
      <usli-form-field label="Email Address">
        <usli-input
          [formControl]="ctrl"
          type="email"
          placeholder="your@email.com"
        />
      </usli-form-field>
    `,
  }),
};

export const WithTextarea: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('', [Validators.required, Validators.minLength(10)]),
    },
    template: `
      <usli-form-field label="Description">
        <usli-textarea
          [formControl]="ctrl"
          placeholder="Enter at least 10 characters"
          [rows]="5"
        />
      </usli-form-field>
    `,
  }),
};

export const WithSelect: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('', Validators.required),
    },
    template: `
      <usli-form-field label="Country">
        <usli-select [formControl]="ctrl">
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
        </usli-select>
      </usli-form-field>
    `,
  }),
};

export const WithValidationError: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('', Validators.required),
      submitted: false,
    },
    template: `
      <div>
        <usli-form-field label="Username">
          <usli-input
            [formControl]="ctrl"
            type="text"
            placeholder="Enter username"
          />
        </usli-form-field>
        <button (click)="ctrl.markAsTouched()">Show Error</button>
      </div>
    `,
  }),
};

export const WithMinLengthError: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('ab', Validators.minLength(5)),
    },
    template: `
      <div>
        <usli-form-field label="Password">
          <usli-input
            [formControl]="ctrl"
            type="password"
            placeholder="Min 5 characters"
          />
        </usli-form-field>
        <p>{{ ctrl.errors | json }}</p>
      </div>
    `,
  }),
};

export const WithEmailError: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('notanemail', Validators.email),
    },
    template: `
      <div>
        <usli-form-field label="Email">
          <usli-input
            [formControl]="ctrl"
            type="email"
            placeholder="Valid email required"
          />
        </usli-form-field>
        <p>{{ ctrl.errors | json }}</p>
      </div>
    `,
  }),
};

export const NoLabel: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-form-field>
        <usli-input
          [formControl]="ctrl"
          type="text"
          placeholder="No label field"
        />
      </usli-form-field>
    `,
  }),
};
