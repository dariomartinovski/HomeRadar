import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

interface SubscriptionStatus {
  plan: 'freemium' | 'standard' | 'premium';
  active: boolean;
  expiresAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  #path: string = 'http://localhost:8080/api/subscriptions';
  #http = inject(HttpClient);

  createCheckoutSession(priceId: string): Observable<CheckoutSessionResponse> {
    return this.#http.post<CheckoutSessionResponse>(`${this.#path}/create-checkout-session`, {
      priceId
    });
  }

  getSubscriptionStatus(): Observable<SubscriptionStatus> {
    return this.#http.get<SubscriptionStatus>(`${this.#path}/status`);
  }

  cancelSubscription(): Observable<void> {
    return this.#http.post<void>(`${this.#path}/cancel`, {});
  }
}
