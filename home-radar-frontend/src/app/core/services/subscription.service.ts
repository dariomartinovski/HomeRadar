import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateSubscriptionRequest, SubscriptionResponse } from '../../interfaces/subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiUrl = 'http://localhost:8080/api/subscriptions';

  #http = inject(HttpClient)

  createSubscription(request: CreateSubscriptionRequest): Observable<SubscriptionResponse> {
    return this.#http.post<SubscriptionResponse>(this.apiUrl, request);
  }

  getUserSubscriptions(): Observable<SubscriptionResponse[]> {
    return this.#http.get<SubscriptionResponse[]>(this.apiUrl);
  }

  deleteSubscription(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
