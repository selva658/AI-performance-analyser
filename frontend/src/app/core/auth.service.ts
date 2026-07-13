import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export type Role = 'coach' | 'player';

export interface AuthUser {
  id: string;
  role: Role;
  playerId?: string;
  name: string;
}

interface LoginResponse {
  token: string;
  user: AuthUser;
}

const API_URL = 'http://localhost:3000/api/auth';
const TOKEN_KEY = 'athleteiq-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  get isAuthenticated(): boolean {
    return !!this._user();
  }

  role(): Role | null {
    return this._user()?.role ?? null;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/login`, { email, password }).pipe(
      tap(({ token, user }) => {
        localStorage.setItem(TOKEN_KEY, token);
        this._user.set(user);
      }),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this._user.set(null);
  }

  /** Restores a session from a stored token on app boot. Resolves once, whether it succeeds or not. */
  restoreSession(): Observable<void> {
    return new Observable((subscriber) => {
      const token = this.token;
      if (!token) {
        subscriber.next();
        subscriber.complete();
        return;
      }

      this.http.get<{ user: AuthUser }>(`${API_URL}/me`).subscribe({
        next: ({ user }) => {
          this._user.set(user);
          subscriber.next();
          subscriber.complete();
        },
        error: () => {
          this.logout();
          subscriber.next();
          subscriber.complete();
        },
      });
    });
  }
}
