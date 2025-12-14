import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log("its coming here??")
  console.log(authService.isAuthenticated())

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};
