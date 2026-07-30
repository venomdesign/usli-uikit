import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UsliTabsComponent, UsliTabComponent } from 'ui-sdk';

const IMPORTS = [UsliTabComponent];

const meta: Meta<UsliTabsComponent> = {
  component: UsliTabsComponent,
  title: 'Components/Tabs',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: IMPORTS })],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<UsliTabsComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <usli-tabs [variant]="variant">
        <usli-tab value="account" label="Account">Account settings content.</usli-tab>
        <usli-tab value="billing" label="Billing">Billing settings content.</usli-tab>
        <usli-tab value="notifications" label="Notifications" [disabled]="true">
          Notifications content.
        </usli-tab>
      </usli-tabs>
    `,
  }),
};

export const Primary: Story = { ...Default, args: { variant: 'primary' } };
export const Success: Story = { ...Default, args: { variant: 'success' } };
export const Error: Story = { ...Default, args: { variant: 'error' } };
