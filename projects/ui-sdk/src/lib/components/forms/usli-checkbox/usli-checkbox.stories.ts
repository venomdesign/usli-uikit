import { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsliCheckboxComponent } from './usli-checkbox.component';

const meta: Meta<UsliCheckboxComponent> = {
  component: UsliCheckboxComponent,
  title: 'Form Components/Checkbox',
  tags: ['autodocs'],
  imports: [ReactiveFormsModule],
};

export default meta;
type Story = StoryObj<UsliCheckboxComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(false),
    },
    template: `
      <usli-checkbox
        [formControl]="ctrl"
        label="Accept terms"
      />
    `,
  }),
};

export const Checked: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(true),
    },
    template: `
      <usli-checkbox
        [formControl]="ctrl"
        label="Subscribe to newsletter"
      />
    `,
  }),
};

export const WithValidation: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(false, Validators.requiredTrue),
    },
    template: `
      <usli-checkbox
        [formControl]="ctrl"
        label="I agree to the terms and conditions"
      />
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl({ value: true, disabled: true }),
    },
    template: `
      <usli-checkbox
        [formControl]="ctrl"
        label="This checkbox is disabled"
      />
    `,
  }),
};

export const Multiple: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl1: new FormControl(true),
      ctrl2: new FormControl(false),
      ctrl3: new FormControl(true),
    },
    template: `
      <div>
        <usli-checkbox [formControl]="ctrl1" label="Option 1" />
        <usli-checkbox [formControl]="ctrl2" label="Option 2" />
        <usli-checkbox [formControl]="ctrl3" label="Option 3" />
      </div>
    `,
  }),
};

export const NoLabel: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(false),
    },
    template: `
      <usli-checkbox [formControl]="ctrl" />
    `,
  }),
};
