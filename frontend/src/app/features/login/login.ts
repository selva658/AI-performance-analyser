import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule, Sparkles, LogIn } from 'lucide-angular';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  readonly icons = { Sparkles, LogIn };

  email = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit() {
    if (!this.email.trim() || !this.password) return;

    this.loading = true;
    this.errorMessage = null;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: ({ user }) => {
        this.loading = false;
        if (user.role === 'coach') {
          this.router.navigateByUrl('/dashboard');
        } else {
          this.router.navigateByUrl(`/players/${user.playerId}`);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Could not sign in. Please try again.';
      },
    });
  }
}
