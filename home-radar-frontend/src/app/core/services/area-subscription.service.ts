import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateAreaSubscriptionRequest, AreaSubscriptionResponse } from '../../interfaces/area-subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class AreaSubscriptionService {
  private readonly apiUrl = 'http://localhost:8080/api/subscriptions';

  #http = inject(HttpClient)

  createAreaSubscription(request: CreateAreaSubscriptionRequest): Observable<AreaSubscriptionResponse> {
    return this.#http.post<AreaSubscriptionResponse>(this.apiUrl, request);
  }

  getUserSubscriptions(): Observable<AreaSubscriptionResponse[]> {
    return this.#http.get<AreaSubscriptionResponse[]>(this.apiUrl);
  }

  deleteSubscription(id: number): Observable<void> {
    return this.#http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
