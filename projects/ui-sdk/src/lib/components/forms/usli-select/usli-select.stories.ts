import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsliSelectComponent } from './usli-select.component';

const meta: Meta<UsliSelectComponent> = {
  component: UsliSelectComponent,
  title: 'Form Components/Select',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
};

export default meta;
type Story = StoryObj<UsliSelectComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, ctrl: new FormControl('') },
    template: `
      <usli-select [formControl]="ctrl">
        <option value="">Choose an option</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </usli-select>
    `,
  }),
};

export const WithLabel: Story = {
  render: (args) => ({
    props: { ...args, ctrl: new FormControl('') },
    template: `
      <usli-form-field label="Select an option">
        <usli-select [formControl]="ctrl">
          <option value="">-- Please select --</option>
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
        </usli-select>
      </usli-form-field>
    `,
  }),
};

export const WithValidation: Story = {
  render: (args) => ({
    props: { ...args, ctrl: new FormControl('', Validators.required) },
    template: `
      <usli-form-field label="Country">
        <usli-select [formControl]="ctrl">
          <option value="">Select a country</option>
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
        </usli-select>
      </usli-form-field>
    `,
  }),
};
