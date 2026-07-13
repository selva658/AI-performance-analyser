import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated) return true;

  return router.parseUrl('/login');
};

export const coachGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.role() === 'coach') return true;

  const playerId = auth.user()?.playerId;
  return router.parseUrl(playerId ? `/players/${playerId}` : '/login');
};

// Players may open their own profile, but not another player's.
export const ownPlayerGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.role() === 'coach') return true;

  const playerId = auth.user()?.playerId;
  if (route.paramMap.get('id') === playerId) return true;

  return router.parseUrl(playerId ? `/players/${playerId}` : '/login');
};
