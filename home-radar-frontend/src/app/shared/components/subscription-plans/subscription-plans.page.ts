import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {SubscriptionService} from '../../../core/services/subscription.service';
import {LoadingOverlayComponent} from '../loading-overlay/loading-overlay.component';
import {PRODUCT_STRIPE_ID} from '../../../data/product-prices.enum';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  priceId: string; // Stripe Price ID
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'subscription-plans',
  templateUrl: './subscription-plans.page.html',
  styleUrl: './subscription-plans.page.scss',
  imports: [MatIcon, CommonModule, LoadingOverlayComponent]
})
export class SubscriptionPlansPage {
  #subscriptionService = inject(SubscriptionService);
  #router = inject(Router);

  loading = false;

  plans: SubscriptionPlan[] = [
    {
      id: 'Free',
      name: 'Free',
      price: 0,
      priceId: '',
      features: [
        '1 free listing all time',
        'Can unlist existing and list new one',
        'Property Listing Alerts within a week'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 9.99,
      priceId: PRODUCT_STRIPE_ID.STANDARD, // Replace with actual Stripe Price ID
      popular: true,
      features: [
        'List up to 3 properties',
        'Modify perk preferences',
        'Property Listing Alert within a day',
        'Like/Dislike properties'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 19.99,
      priceId: PRODUCT_STRIPE_ID.PREMIUM, // Replace with actual Stripe Price ID
      features: [
        'Unlimited listings',
        'Full settings access',
        'Immediate Property Listings Alerts',
        'Like/Dislike properties',
        'Priority support'
      ]
    }
  ];

  subscribe(plan: SubscriptionPlan) {
    if (plan.price === 0) {
      this.#router.navigate(['/profile']);
      return;
    }

    this.loading = true;
    this.#subscriptionService.createCheckoutSession(plan.priceId).subscribe({
      next: (response) => {
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      },
      error: (error) => {
        console.error('Subscription error:', error);
        this.loading = false;
        alert('Failed to start subscription process. Please try again.');
      }
    });
  }

  goBack() {
    this.#router.navigate(['/profile']);
  }
}
