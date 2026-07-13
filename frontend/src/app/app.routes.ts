import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import {VideoAnalysis} from './features/video-analysis/video-analysis'
import { SidebarComponent } from './layout/sidebar/sidebar';
import { PlayerList } from './features/players/player-list/player-list';
import { PlayerProfile } from './features/players/player-profile/player-profile';
import { TrainingPlans } from './features/training-plans/training-plans';
import { Login } from './features/login/login';
import { authGuard, coachGuard, ownPlayerGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: '',
    component: SidebarComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardLayout,
        canActivate: [coachGuard]
      },
      {
        path: 'video-analysis',
        component: VideoAnalysis,
        canActivate: [coachGuard]
      },
      {
        path: 'players',
        component: PlayerList,
        canActivate: [coachGuard]
      },
      {
        path: 'players/:id',
        component: PlayerProfile,
        canActivate: [ownPlayerGuard]
      },
      {
        path: 'training-plans',
        component: TrainingPlans,
        canActivate: [coachGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
