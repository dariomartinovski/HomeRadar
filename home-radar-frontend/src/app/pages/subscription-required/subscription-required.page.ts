import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {CommonModule} from '@angular/common';
import {PlanType} from '../../enums/plan-type.enum';

@Component({
  selector: 'subscription-required',
  templateUrl: './subscription-required.page.html',
  styleUrls: ['./subscription-required.page.scss'],
  imports: [CommonModule]
})
export class SubscriptionRequiredPage implements OnInit {
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  requiredPlan: string = PlanType.PREMIUM;

  ngOnInit(): void {
    this.#route.queryParams.subscribe(params => {
      this.requiredPlan = params['requiredPlan'] || PlanType.PREMIUM;
    });
  }

  goToHome(): void {
    this.#router.navigate(['/']);
  }

  goToSubscriptionPlans(): void {
    this.#router.navigate(['/subscription-plans']);
  }
}
