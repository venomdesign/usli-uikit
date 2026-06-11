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
  { path: '**', redirectTo: '' },
];
