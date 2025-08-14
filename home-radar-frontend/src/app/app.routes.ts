import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { P } from '@angular/cdk/keycodes';
import { ProfilePage } from './pages/profile/profile.page';
import { SettingsPage } from './pages/settings/settings.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'profile',
    component: ProfilePage
  },
  {
    path: 'settings',
    component: SettingsPage
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
