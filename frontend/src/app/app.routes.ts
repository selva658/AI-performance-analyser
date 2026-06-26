import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';
import {VideoAnalysis} from './features/video-analysis/video-analysis'

export const routes: Routes = [
  {
    path: '',
    component: DashboardLayout
  },
  {
    path: 'video-analysis',
    component: VideoAnalysis
  }
];