import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface SubscriptionResponse {
  id: number;
  userId: number;
  planType: string;
  status: string;
  startDate: string;
  endDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  #path = 'http://localhost:8080/api/subscriptions';
  #http = inject(HttpClient);

  createCheckoutSession(priceId: string): Observable<CheckoutSessionResponse> {
    return this.#http.post<CheckoutSessionResponse>(`${this.#path}/checkout`, { priceId });
  }

  getCurrentSubscription(): Observable<SubscriptionResponse> {
    return this.#http.get<SubscriptionResponse>(`${this.#path}/current`);
  }

  cancelSubscription(): Observable<SubscriptionResponse> {
    return this.#http.delete<SubscriptionResponse>(`${this.#path}/cancel`);
  }
}
