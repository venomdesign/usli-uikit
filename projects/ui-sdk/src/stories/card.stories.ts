import type { Meta, StoryObj } from '@storybook/angular';

import { UsliCardComponent } from 'ui-sdk';

const meta: Meta<UsliCardComponent> = {
  title: 'Components/Card',
  component: UsliCardComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  render: (args) => ({
    props: args,
    template: `<usli-card [variant]="variant" [title]="title" [subtitle]="subtitle" style="max-width: 20rem;">Some quick example text to build on the card and make up the bulk of its content.</usli-card>`,
  }),
};

export default meta;
type Story = StoryObj<UsliCardComponent>;

export const Default: Story = { args: { title: 'Card title', subtitle: 'Card subtitle' } };
export const Primary: Story = { args: { variant: 'primary', title: 'Primary accent' } };
export const Success: Story = { args: { variant: 'success', title: 'Success accent' } };
export const Error: Story = { args: { variant: 'error', title: 'Error accent' } };
export const NoTitle: Story = { args: {} };
