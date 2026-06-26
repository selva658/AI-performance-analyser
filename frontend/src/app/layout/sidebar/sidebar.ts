import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  imports: [CommonModule, NgClass, RouterLink, RouterLinkActive]
})
export class SidebarComponent {
  menuItems = [
  { label: 'Dashboard', route: '/' },
  { label: 'Video Analysis', route: '/video-analysis' },
  { label: 'Players', route: '/players' },
  { label: 'Teams', route: '/teams' },
  { label: 'Analytics', route: '/analytics' },
  { label: 'Calendar', route: '/calendar' },
  { label: 'Training Plans', route: '/training-plans' }
];
}