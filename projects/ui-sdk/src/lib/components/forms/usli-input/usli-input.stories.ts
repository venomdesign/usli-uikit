import { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsliInputComponent } from './usli-input.component';

const meta: Meta<UsliInputComponent> = {
  component: UsliInputComponent,
  title: 'Form Components/Input',
  tags: ['autodocs'],
  imports: [ReactiveFormsModule],
};

export default meta;
type Story = StoryObj<UsliInputComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-input
        [formControl]="ctrl"
        type="text"
        placeholder="Enter text"
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
      <usli-form-field label="Email">
        <usli-input
          [formControl]="ctrl"
          type="email"
          placeholder="your@email.com"
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
      ctrl: new FormControl('', [Validators.required, Validators.email]),
    },
    template: `
      <usli-form-field label="Email">
        <usli-input
          [formControl]="ctrl"
          type="email"
          placeholder="your@email.com"
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
      ctrl: new FormControl({ value: 'Disabled input', disabled: true }),
    },
    template: `
      <usli-input
        [formControl]="ctrl"
        type="text"
      />
    `,
  }),
};

export const Password: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-form-field label="Password">
        <usli-input
          [formControl]="ctrl"
          type="password"
          placeholder="••••••••"
        />
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};

export const Number: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-form-field label="Age">
        <usli-input
          [formControl]="ctrl"
          type="number"
          placeholder="Enter age"
        />
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};
