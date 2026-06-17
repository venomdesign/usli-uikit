import { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsliSelectComponent } from './usli-select.component';

const meta: Meta<UsliSelectComponent> = {
  component: UsliSelectComponent,
  title: 'Form Components/Select',
  tags: ['autodocs'],
  imports: [ReactiveFormsModule],
};

export default meta;
type Story = StoryObj<UsliSelectComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-select [formControl]="ctrl">
        <option value="">Choose an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </usli-select>
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
      <usli-form-field label="Select an option">
        <usli-select [formControl]="ctrl">
          <option value="">-- Please select --</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="orange">Orange</option>
        </usli-select>
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};

export const WithValidation: Story = {
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
    imports: [...(meta.imports || [])],
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl({ value: 'option1', disabled: true }),
    },
    template: `
      <usli-select [formControl]="ctrl">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </usli-select>
    `,
  }),
};

export const Multiple: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-form-field label="Select technologies">
        <usli-select [formControl]="ctrl" multiple>
          <option value="angular">Angular</option>
          <option value="react">React</option>
          <option value="vue">Vue</option>
          <option value="svelte">Svelte</option>
        </usli-select>
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};
