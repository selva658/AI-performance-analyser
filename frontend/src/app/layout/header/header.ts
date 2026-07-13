import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Menu, Search, SlidersHorizontal, CalendarDays, Bell, Moon, Sun, LogOut } from 'lucide-angular';
import { ThemeService } from '../../core/theme.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, DatePipe, LucideAngularModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();

  readonly icons = { Menu, Search, SlidersHorizontal, CalendarDays, Bell, Moon, Sun, LogOut };
  readonly today = new Date();

  /** No notification source exists yet — starts at 0 so the badge stays honest instead of showing fabricated data. */
  unreadCount = 0;

  constructor(
    public theme: ThemeService,
    public auth: AuthService,
    private router: Router,
  ) {}

  get roleLabel(): string {
    return this.auth.role() === 'coach' ? 'Head Coach' : 'Player';
  }

  get initial(): string {
    return this.auth.user()?.name?.[0]?.toUpperCase() || '?';
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
