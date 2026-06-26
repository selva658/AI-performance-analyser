import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  imports: [CommonModule, NgClass]
})
export class SidebarComponent {
  menuItems = [
    'Dashboard',
    'Players',
    'Teams',
    'Analytics',
    'Calendar',
    'Training Plans'
  ];
}