import type { Meta, StoryObj } from '@storybook/angular';
import { Component } from '@angular/core';

interface Shade {
  key: string;
  cssVar: string;
  hex: string;
  darkText: boolean;
}

interface Palette {
  name: string;
  shades: Shade[];
  accents: Shade[];
}

const palettes: Palette[] = [
  {
    name: 'USLI Orange',
    shades: [
      { key: '50',  cssVar: '--orange-50',  hex: '#fff4ea', darkText: true  },
      { key: '100', cssVar: '--orange-100', hex: '#fde4c0', darkText: true  },
      { key: '200', cssVar: '--orange-200', hex: '#fbce94', darkText: true  },
      { key: '300', cssVar: '--orange-300', hex: '#f9b868', darkText: true  },
      { key: '400', cssVar: '--orange-400', hex: '#f8a63f', darkText: true  },
      { key: '500', cssVar: '--orange-500', hex: '#f69728', darkText: true  },
      { key: '600', cssVar: '--orange-600', hex: '#d4841e', darkText: false },
      { key: '700', cssVar: '--orange-700', hex: '#b27015', darkText: false },
      { key: '800', cssVar: '--orange-800', hex: '#905c0d', darkText: false },
      { key: '900', cssVar: '--orange-900', hex: '#6e4807', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--orange-a100', hex: '#ffe0b2', darkText: true  },
      { key: 'A200', cssVar: '--orange-a200', hex: '#ffb74d', darkText: true  },
      { key: 'A400', cssVar: '--orange-a400', hex: '#ff9800', darkText: true  },
      { key: 'A700', cssVar: '--orange-a700', hex: '#ff6d00', darkText: false },
    ],
  },
  {
    name: 'USLI Blue',
    shades: [
      { key: '50',  cssVar: '--blue-50',  hex: '#e3e9f6', darkText: true  },
      { key: '100', cssVar: '--blue-100', hex: '#b3c2e6', darkText: true  },
      { key: '200', cssVar: '--blue-200', hex: '#809dd8', darkText: true  },
      { key: '300', cssVar: '--blue-300', hex: '#4d78c9', darkText: false },
      { key: '400', cssVar: '--blue-400', hex: '#255dbf', darkText: false },
      { key: '500', cssVar: '--blue-500', hex: '#00338e', darkText: false },
      { key: '600', cssVar: '--blue-600', hex: '#002c7c', darkText: false },
      { key: '700', cssVar: '--blue-700', hex: '#00216a', darkText: false },
      { key: '800', cssVar: '--blue-800', hex: '#001657', darkText: false },
      { key: '900', cssVar: '--blue-900', hex: '#000b44', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--blue-a100', hex: '#80b0ff', darkText: true  },
      { key: 'A200', cssVar: '--blue-a200', hex: '#448aff', darkText: false },
      { key: 'A400', cssVar: '--blue-a400', hex: '#2979ff', darkText: false },
      { key: 'A700', cssVar: '--blue-a700', hex: '#2962ff', darkText: false },
    ],
  },
  {
    name: 'USLI Gray',
    shades: [
      { key: '50',  cssVar: '--gray-50',  hex: '#fafafa', darkText: true  },
      { key: '100', cssVar: '--gray-100', hex: '#f5f5f5', darkText: true  },
      { key: '200', cssVar: '--gray-200', hex: '#eeeeee', darkText: true  },
      { key: '300', cssVar: '--gray-300', hex: '#e0e0e0', darkText: true  },
      { key: '400', cssVar: '--gray-400', hex: '#bdbdbd', darkText: true  },
      { key: '500', cssVar: '--gray-500', hex: '#a8a8a8', darkText: true  },
      { key: '600', cssVar: '--gray-600', hex: '#757575', darkText: false },
      { key: '700', cssVar: '--gray-700', hex: '#616161', darkText: false },
      { key: '800', cssVar: '--gray-800', hex: '#424242', darkText: false },
      { key: '900', cssVar: '--gray-900', hex: '#212121', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--gray-a100', hex: '#ffffff', darkText: true  },
      { key: 'A200', cssVar: '--gray-a200', hex: '#eeeeee', darkText: true  },
      { key: 'A400', cssVar: '--gray-a400', hex: '#bdbdbd', darkText: true  },
      { key: 'A700', cssVar: '--gray-a700', hex: '#616161', darkText: false },
    ],
  },
  {
    name: 'Info',
    shades: [
      { key: '50',  cssVar: '--info-50',  hex: '#e8f4ff', darkText: true  },
      { key: '100', cssVar: '--info-100', hex: '#c0e0ff', darkText: true  },
      { key: '200', cssVar: '--info-200', hex: '#90c8fe', darkText: true  },
      { key: '300', cssVar: '--info-300', hex: '#60b0fd', darkText: true  },
      { key: '400', cssVar: '--info-400', hex: '#3da0fc', darkText: true  },
      { key: '500', cssVar: '--info-500', hex: '#5aaafa', darkText: true  },
      { key: '600', cssVar: '--info-600', hex: '#4996e3', darkText: false },
      { key: '700', cssVar: '--info-700', hex: '#3478c3', darkText: false },
      { key: '800', cssVar: '--info-800', hex: '#235aa0', darkText: false },
      { key: '900', cssVar: '--info-900', hex: '#163d7a', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--info-a100', hex: '#b3d8ff', darkText: true  },
      { key: 'A200', cssVar: '--info-a200', hex: '#64b5ff', darkText: true  },
      { key: 'A400', cssVar: '--info-a400', hex: '#1890ff', darkText: false },
      { key: 'A700', cssVar: '--info-a700', hex: '#0070e0', darkText: false },
    ],
  },
  {
    name: 'Success',
    shades: [
      { key: '50',  cssVar: '--success-50',  hex: '#edfaee', darkText: true  },
      { key: '100', cssVar: '--success-100', hex: '#bce8be', darkText: true  },
      { key: '200', cssVar: '--success-200', hex: '#88d58b', darkText: true  },
      { key: '300', cssVar: '--success-300', hex: '#55bb59', darkText: true  },
      { key: '400', cssVar: '--success-400', hex: '#2da332', darkText: false },
      { key: '500', cssVar: '--success-500', hex: '#14661a', darkText: false },
      { key: '600', cssVar: '--success-600', hex: '#105515', darkText: false },
      { key: '700', cssVar: '--success-700', hex: '#0d4411', darkText: false },
      { key: '800', cssVar: '--success-800', hex: '#09330c', darkText: false },
      { key: '900', cssVar: '--success-900', hex: '#062207', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--success-a100', hex: '#ccff90', darkText: true  },
      { key: 'A200', cssVar: '--success-a200', hex: '#b2ff59', darkText: true  },
      { key: 'A400', cssVar: '--success-a400', hex: '#76ff03', darkText: true  },
      { key: 'A700', cssVar: '--success-a700', hex: '#64dd17', darkText: true  },
    ],
  },
  {
    name: 'Warning',
    shades: [
      { key: '50',  cssVar: '--warning-50',  hex: '#fffde7', darkText: true  },
      { key: '100', cssVar: '--warning-100', hex: '#fff9c4', darkText: true  },
      { key: '200', cssVar: '--warning-200', hex: '#fff59d', darkText: true  },
      { key: '300', cssVar: '--warning-300', hex: '#fff176', darkText: true  },
      { key: '400', cssVar: '--warning-400', hex: '#ffee58', darkText: true  },
      { key: '500', cssVar: '--warning-500', hex: '#efc100', darkText: true  },
      { key: '600', cssVar: '--warning-600', hex: '#c29a00', darkText: true  },
      { key: '700', cssVar: '--warning-700', hex: '#997800', darkText: false },
      { key: '800', cssVar: '--warning-800', hex: '#705800', darkText: false },
      { key: '900', cssVar: '--warning-900', hex: '#4d3c00', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--warning-a100', hex: '#ffff8d', darkText: true  },
      { key: 'A200', cssVar: '--warning-a200', hex: '#ffff00', darkText: true  },
      { key: 'A400', cssVar: '--warning-a400', hex: '#ffea00', darkText: true  },
      { key: 'A700', cssVar: '--warning-a700', hex: '#ffd600', darkText: true  },
    ],
  },
  {
    name: 'Error',
    shades: [
      { key: '50',  cssVar: '--error-50',  hex: '#fff0f0', darkText: true  },
      { key: '100', cssVar: '--error-100', hex: '#f9c4c4', darkText: true  },
      { key: '200', cssVar: '--error-200', hex: '#f09090', darkText: true  },
      { key: '300', cssVar: '--error-300', hex: '#e65858', darkText: false },
      { key: '400', cssVar: '--error-400', hex: '#d92828', darkText: false },
      { key: '500', cssVar: '--error-500', hex: '#b10505', darkText: false },
      { key: '600', cssVar: '--error-600', hex: '#940404', darkText: false },
      { key: '700', cssVar: '--error-700', hex: '#770303', darkText: false },
      { key: '800', cssVar: '--error-800', hex: '#590202', darkText: false },
      { key: '900', cssVar: '--error-900', hex: '#3b0101', darkText: false },
    ],
    accents: [
      { key: 'A100', cssVar: '--error-a100', hex: '#ff8a80', darkText: true  },
      { key: 'A200', cssVar: '--error-a200', hex: '#ff5252', darkText: false },
      { key: 'A400', cssVar: '--error-a400', hex: '#ff1744', darkText: false },
      { key: 'A700', cssVar: '--error-a700', hex: '#d50000', darkText: false },
    ],
  },
];

@Component({
  selector: 'usli-colors-story',
  standalone: true,
  styles: [`
    .page { padding: 2rem; font-family: 'Roboto', sans-serif; background: #fafafa; min-height: 100vh; }
    h1 { font-size: 1.5rem; font-weight: 500; color: #212121; margin: 0 0 2rem; }
    .palette { margin-bottom: 2.5rem; }
    .palette-name { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #757575; margin: 0 0 0.5rem; }
    .shades { display: flex; border-radius: 6px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.12); }
    .accents { display: flex; gap: 4px; margin-top: 4px; }
    .swatch {
      flex: 1;
      padding: 0.625rem 0.5rem;
      min-height: 72px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .accent-swatch {
      flex: 1;
      padding: 0.625rem 0.5rem;
      min-height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,.12);
    }
    .swatch-key { font-size: 11px; font-weight: 700; }
    .swatch-hex { font-size: 10px; opacity: 0.8; font-family: 'Roboto Mono', monospace; }
  `],
  template: `
    <div class="page">
      <h1>Color Palette</h1>
      @for (palette of palettes; track palette.name) {
        <div class="palette">
          <p class="palette-name">{{ palette.name }}</p>
          <div class="shades">
            @for (shade of palette.shades; track shade.key) {
              <div class="swatch"
                   [style.background-color]="shade.hex"
                   [style.color]="shade.darkText ? '#212121' : '#ffffff'">
                <span class="swatch-key">{{ shade.key }} | Variable: {{ shade.cssVar }}</span>
                <span class="swatch-hex">{{ shade.hex }}</span>
              </div>
            }
          </div>
          <div class="accents">
            @for (shade of palette.accents; track shade.key) {
              <div class="accent-swatch"
                   [style.background-color]="shade.hex"
                   [style.color]="shade.darkText ? '#212121' : '#ffffff'">
                <span class="swatch-key">{{ shade.key }}</span>
                <span class="swatch-hex">{{ shade.hex }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
class ColorsStoryComponent {
  palettes = palettes;
}

const meta: Meta<ColorsStoryComponent> = {
  title: 'Design System/Colors',
  component: ColorsStoryComponent,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ColorsStoryComponent>;

export const AllPalettes: Story = {};
