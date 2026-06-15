import { Component } from '@angular/core';
import { UsliAlertComponent } from 'ui-sdk';

@Component({
  selector: 'app-alert-docs',
  standalone: true,
  imports: [UsliAlertComponent],
  templateUrl: './alert-docs.html',
  styleUrl: './alert-docs.scss',
})
export class AlertDocs {}
