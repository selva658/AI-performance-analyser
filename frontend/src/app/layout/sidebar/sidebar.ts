import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from "../header/header";

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  imports: [CommonModule, RouterModule, Header]
})
export class SidebarComponent {
  menuItems = [
  { label: 'Dashboard', route: '/dashboard' },
  { label: 'Video Analysis', route: '/video-analysis' },
  { label: 'Players', route: '/players' },
  { label: 'Teams', route: '/teams' },
  { label: 'Analytics', route: '/analytics' },
  { label: 'Calendar', route: '/calendar' },
  { label: 'Training Plans', route: '/training-plans' }
];
}