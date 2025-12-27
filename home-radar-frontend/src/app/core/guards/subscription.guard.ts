import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {UserService} from '../services/user.service';
import {PlanType} from '../../enums/plan-type.enum';
import {User} from '../../interfaces/user.interface';

export const subscriptionGuard = (requiredPlan: PlanType): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const router = inject(Router);

    const user = userService.getCurrentUser() as User;
    const userPlan = user.subscription.planType;

    const hasAccess =
      (requiredPlan === PlanType.FREE) ||
      (requiredPlan === PlanType.STANDARD && (userPlan === PlanType.STANDARD || userPlan === PlanType.PREMIUM)) ||
      (requiredPlan === PlanType.PREMIUM && userPlan === PlanType.PREMIUM);

    if (hasAccess) {
      return true;
    }

    router.navigate(['/subscription-required'], {
      queryParams: { requiredPlan }
    });
    return false;
  };
};

export const standardSubscriptionGuard: CanActivateFn = subscriptionGuard(PlanType.STANDARD);
export const premiumSubscriptionGuard: CanActivateFn = subscriptionGuard(PlanType.PREMIUM);
