import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
  },
  {
    path: 'components/button',
    loadComponent: () => import('./pages/components/button/button-docs').then(m => m.ButtonDocs),
  },
  {
    path: 'components/badge',
    loadComponent: () => import('./pages/components/badge/badge-docs').then(m => m.BadgeDocs),
  },
  {
    path: 'components/alert',
    loadComponent: () => import('./pages/components/alert/alert-docs').then(m => m.AlertDocs),
  },
  {
    path: 'components/card',
    loadComponent: () => import('./pages/components/card/card-docs').then(m => m.CardDocs),
  },
  {
    path: 'components/spinner',
    loadComponent: () => import('./pages/components/spinner/spinner-docs').then(m => m.SpinnerDocs),
  },
  {
    path: 'design/colors',
    loadComponent: () => import('./pages/design/colors/colors-docs').then(m => m.ColorsDocs),
  },
  {
    path: 'design/typography',
    loadComponent: () => import('./pages/design/typography/typography-docs').then(m => m.TypographyDocs),
  },
  {
    path: 'components/forms/input',
    loadComponent: () => import('./pages/components/forms/input/input-docs').then(m => m.InputDocs),
    data: { name: 'input-docs' },
  },
  {
    path: 'components/forms/textarea',
    loadComponent: () => import('./pages/components/forms/textarea/textarea-docs').then(m => m.TextareaDocs),
    data: { name: 'textarea-docs' },
  },
  {
    path: 'components/forms/select',
    loadComponent: () => import('./pages/components/forms/select/select-docs').then(m => m.SelectDocs),
    data: { name: 'select-docs' },
  },
  {
    path: 'components/forms/checkbox',
    loadComponent: () => import('./pages/components/forms/checkbox/checkbox-docs').then(m => m.CheckboxDocs),
    data: { name: 'checkbox-docs' },
  },
  {
    path: 'components/forms/radio-group',
    loadComponent: () => import('./pages/components/forms/radio-group/radio-group-docs').then(m => m.RadioGroupDocs),
    data: { name: 'radio-group-docs' },
  },
  {
    path: 'components/forms/form-field',
    loadComponent: () => import('./pages/components/forms/form-field/form-field-docs').then(m => m.FormFieldDocs),
    data: { name: 'form-field-docs' },
  },
  { path: '**', redirectTo: '' },
];
