import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home.page';
import { ProfilePage } from './pages/profile/profile.page';
import { SettingsPage } from './pages/settings/settings.page';
import { LoginPage } from './pages/login/login.page';
import { RegisterPage } from './pages/register/register.page';
import {PropertyDetailsPage} from './pages/property-details/property-details.page';
import {AdminPanelPage} from './pages/admin-panel/admin-panel.page';
import {authGuard} from './core/guards/auth.guard';
import {ForbiddenPage} from './pages/forbidden/forbidden.page';
import {SubscriptionPlansPage} from './shared/components/subscription-plans/subscription-plans.page';

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
    component: ProfilePage,
    canActivate: [authGuard]
  },
  {
    path: 'subscription-plans',
    component: SubscriptionPlansPage,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: SettingsPage,
    canActivate: [authGuard]
  },
  {
    path: 'admin-panel',
    component: AdminPanelPage,
    canActivate: [authGuard]
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
    path: 'forbidden',
    component: ForbiddenPage
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
