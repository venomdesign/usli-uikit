import type { Meta, StoryObj } from '@storybook/angular';

import { UsliAlertComponent } from 'ui-sdk';

const meta: Meta<UsliAlertComponent> = {
  title: 'Components/Alert',
  component: UsliAlertComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['error', 'warning', 'info', 'success'],
    },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: {
    variant: 'info',
    dismissible: false,
  },
  render: (args) => ({
    props: args,
    template: `<usli-alert [variant]="variant" [title]="title" [dismissible]="dismissible">This is an alert message.</usli-alert>`,
  }),
};

export default meta;
type Story = StoryObj<UsliAlertComponent>;

export const Info: Story = { args: { variant: 'info' } };
export const Success: Story = { args: { variant: 'success' } };
export const Warning: Story = { args: { variant: 'warning' } };
export const Error: Story = { args: { variant: 'error' } };
export const WithTitle: Story = { args: { variant: 'success', title: 'Saved' } };
export const Dismissible: Story = { args: { variant: 'warning', title: 'Heads up', dismissible: true } };
