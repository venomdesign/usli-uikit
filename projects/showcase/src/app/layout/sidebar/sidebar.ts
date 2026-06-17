import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem { label: string; path: string; exact?: boolean; }
interface NavSection { title: string; items: NavItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  sections: NavSection[] = [
    {
      title: 'Getting Started',
      items: [
        { label: 'Introduction', path: '/', exact: true },
      ],
    },
    {
      title: 'Components',
      items: [
        { label: 'Button',  path: '/components/button' },
        { label: 'Badge',   path: '/components/badge' },
        { label: 'Alert',   path: '/components/alert' },
        { label: 'Card',    path: '/components/card' },
        { label: 'Spinner', path: '/components/spinner' },
      ],
    },
    {
      title: 'Design System',
      items: [
        { label: 'Colors',      path: '/design/colors' },
        { label: 'Typography',  path: '/design/typography' },
      ],
    },
    {
      title: 'Inputs',
      items: [
        { label: 'Input',    path: '/components/forms/input' },
        { label: 'Textarea', path: '/components/forms/textarea' },
      ],
    },
    {
      title: 'Selection',
      items: [
        { label: 'Select',      path: '/components/forms/select' },
        { label: 'Checkbox',    path: '/components/forms/checkbox' },
        { label: 'Radio Group', path: '/components/forms/radio-group' },
      ],
    },
    {
      title: 'Containers',
      items: [
        { label: 'Form Field', path: '/components/forms/form-field' },
      ],
    },
  ];
}
