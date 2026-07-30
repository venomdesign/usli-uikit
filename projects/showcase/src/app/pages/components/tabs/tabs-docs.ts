import { Component } from '@angular/core';
import { UsliTabsComponent, UsliTabComponent } from 'ui-sdk';

@Component({
  selector: 'app-tabs-docs',
  standalone: true,
  imports: [UsliTabsComponent, UsliTabComponent],
  templateUrl: './tabs-docs.html',
  styleUrl: './tabs-docs.scss',
})
export class TabsDocs {}
