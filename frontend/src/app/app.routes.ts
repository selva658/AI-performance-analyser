import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import {VideoAnalysis} from './features/video-analysis/video-analysis'
import { SidebarComponent } from './layout/sidebar/sidebar';

export const routes: Routes = [
  {
    path: '',
    component: SidebarComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardLayout
      },
      {
        path: 'video-analysis',
        component: VideoAnalysis
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];