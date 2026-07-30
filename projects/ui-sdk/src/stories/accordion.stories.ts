import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { UsliAccordionComponent, UsliAccordionItemComponent } from 'ui-sdk';

const IMPORTS = [UsliAccordionItemComponent];

const meta: Meta<UsliAccordionComponent> = {
  component: UsliAccordionComponent,
  title: 'Components/Accordion',
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: IMPORTS })],
  argTypes: {
    multiple: { control: 'boolean' },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'error', 'warning', 'info', 'success'],
    },
  },
};

export default meta;
type Story = StoryObj<UsliAccordionComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <usli-accordion [multiple]="multiple" [variant]="variant">
        <usli-accordion-item value="a" label="What is USLI UI Kit?">
          A shared Angular component library built on Bootstrap.
        </usli-accordion-item>
        <usli-accordion-item value="b" label="How do I install it?">
          Add the ui-sdk package as a dependency and import the components you need.
        </usli-accordion-item>
        <usli-accordion-item value="c" label="Is it themeable?">
          Yes — components accept a variant input matching the Button color palette.
        </usli-accordion-item>
      </usli-accordion>
    `,
  }),
};

export const Multiple: Story = { ...Default, args: { multiple: true } };
export const PrimaryVariant: Story = { ...Default, args: { variant: 'primary' } };
