import type { Meta, StoryObj } from '@storybook/angular';

import { UsliSpinnerComponent } from 'ui-sdk';

const meta: Meta<UsliSpinnerComponent> = {
  title: 'Components/Spinner',
  component: UsliSpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    type: {
      control: 'select',
      options: ['border', 'grow'],
    },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    size: 'medium',
    type: 'border',
  },
};

export default meta;
type Story = StoryObj<UsliSpinnerComponent>;

export const Border: Story = { args: { type: 'border' } };
export const Grow: Story = { args: { type: 'grow' } };
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large' } };
export const Success: Story = { args: { variant: 'success' } };
