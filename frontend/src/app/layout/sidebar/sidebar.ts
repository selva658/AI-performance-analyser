import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from "../header/header";
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
  imports: [CommonModule, RouterModule, Header]
})
export class SidebarComponent {
  sidebarOpen = signal(true);

  private coachMenuItems = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Video Analysis', route: '/video-analysis' },
    { label: 'Players', route: '/players' },
    { label: 'Teams', route: '/teams' },
    { label: 'Analytics', route: '/analytics' },
    { label: 'Calendar', route: '/calendar' },
    { label: 'Training Plans', route: '/training-plans' }
  ];

  constructor(private auth: AuthService) {}

  get menuItems() {
    if (this.auth.role() === 'player') {
      const playerId = this.auth.user()?.playerId;
      return playerId ? [{ label: 'My Profile', route: `/players/${playerId}` }] : [];
    }
    return this.coachMenuItems;
  }

  toggleSidebar() {
    this.sidebarOpen.set(!this.sidebarOpen());
  }
}