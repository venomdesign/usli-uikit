import type { Meta, StoryObj } from '@storybook/angular';

import { UsliBadgeComponent } from 'ui-sdk';

const meta: Meta<UsliBadgeComponent> = {
  title: 'Components/Badge',
  component: UsliBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
    pill: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: {
    variant: 'primary',
    label: 'Badge',
    pill: false,
  },
};

export default meta;
type Story = StoryObj<UsliBadgeComponent>;

export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Tertiary: Story = { args: { variant: 'tertiary' } };
export const Error: Story = { args: { variant: 'error' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Info: Story = { args: { variant: 'info' } };
export const Success: Story = { args: { variant: 'success' } };
export const Pill: Story = { args: { variant: 'primary', label: 'New', pill: true } };
