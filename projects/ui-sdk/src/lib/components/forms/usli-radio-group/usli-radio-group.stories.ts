import { Meta, StoryObj } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { UsliRadioGroupComponent } from './usli-radio-group.component';
import { UsliRadioComponent } from '../usli-radio/usli-radio.component';

const meta: Meta<UsliRadioGroupComponent> = {
  component: UsliRadioGroupComponent,
  title: 'Form Components/Radio Group',
  tags: ['autodocs'],
  imports: [ReactiveFormsModule, UsliRadioComponent],
};

export default meta;
type Story = StoryObj<UsliRadioGroupComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl(''),
    },
    template: `
      <usli-radio-group [formControl]="ctrl">
        <usli-radio value="option1" label="Option 1" />
        <usli-radio value="option2" label="Option 2" />
        <usli-radio value="option3" label="Option 3" />
      </usli-radio-group>
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
        <usli-radio-group [formControl]="ctrl">
          <usli-radio value="yes" label="Yes" />
          <usli-radio value="no" label="No" />
          <usli-radio value="maybe" label="Maybe" />
        </usli-radio-group>
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
      <usli-form-field label="Difficulty level">
        <usli-radio-group [formControl]="ctrl">
          <usli-radio value="easy" label="Easy" />
          <usli-radio value="medium" label="Medium" />
          <usli-radio value="hard" label="Hard" />
        </usli-radio-group>
      </usli-form-field>
    `,
    imports: [...(meta.imports || [])],
  }),
};

export const Selected: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('option2'),
    },
    template: `
      <usli-radio-group [formControl]="ctrl">
        <usli-radio value="option1" label="Option 1" />
        <usli-radio value="option2" label="Option 2" />
        <usli-radio value="option3" label="Option 3" />
      </usli-radio-group>
    `,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl({ value: 'option1', disabled: true }),
    },
    template: `
      <usli-radio-group [formControl]="ctrl">
        <usli-radio value="option1" label="Option 1" />
        <usli-radio value="option2" label="Option 2" />
        <usli-radio value="option3" label="Option 3" />
      </usli-radio-group>
    `,
  }),
};

export const WithError: Story = {
  render: (args) => ({
    props: {
      ...args,
      ctrl: new FormControl('', Validators.required),
      errorMsg: 'Please select an option',
    },
    template: `
      <usli-radio-group [formControl]="ctrl" [errorMessage]="errorMsg">
        <usli-radio value="option1" label="Option 1" />
        <usli-radio value="option2" label="Option 2" />
      </usli-radio-group>
    `,
  }),
};
