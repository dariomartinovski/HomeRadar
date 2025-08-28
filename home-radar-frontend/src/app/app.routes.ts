import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { P } from '@angular/cdk/keycodes';
import { ProfilePage } from './pages/profile/profile.page';
import { SettingsPage } from './pages/settings/settings.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';

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
    path: 'login',
    component: LoginPage
  },
  {
    path: 'register',
    component: RegisterPage
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
