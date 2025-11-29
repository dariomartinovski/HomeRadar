import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { ProfilePage } from './pages/profile/profile.page';
import { SettingsPage } from './pages/settings/settings.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import {PropertyDetailsPage} from './pages/property-details/property-details.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
  },
  {
    path: 'property-details/:id',
    component: PropertyDetailsPage,
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
