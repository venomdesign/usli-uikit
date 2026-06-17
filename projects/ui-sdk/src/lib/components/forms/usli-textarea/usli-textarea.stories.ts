import { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsliTextareaComponent } from './usli-textarea.component';

const meta: Meta<UsliTextareaComponent> = {
  component: UsliTextareaComponent,
  title: 'Form Components/Textarea',
  tags: ['autodocs'],
  imports: [ReactiveFormsModule],
};

export default meta;
type Story = StoryObj<UsliTextareaComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-textarea
        [formControl]="ctrl"
        placeholder="Enter your message"
        [rows]="4"
      />
    `,
  }),
};

export const WithLabel: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-form-field label="Comments">
        <usli-textarea
          [formControl]="ctrl"
          placeholder="Enter your comments"
          [rows]="4"
        />
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};

export const WithValidation: Story = {
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
    imports: [...(meta.imports || [])],
  }),
};

export const LargeTextarea: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-form-field label="Full Description">
        <usli-textarea
          [formControl]="ctrl"
          placeholder="Enter detailed description"
          [rows]="8"
        />
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl({ value: 'This textarea is disabled', disabled: true }),
    },
    template: `
      <usli-textarea
        [formControl]="ctrl"
        [rows]="4"
      />
    `,
  }),
};
