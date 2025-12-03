import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import {PreferenceTypeEnum} from '../../enums/preference-type.enum';
import {UserPropertyPreference} from '../../interfaces/user-property-preference.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  httpClient = inject(HttpClient)
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;
  private http: HttpClient = inject(HttpClient);

  #path = '/api/users';

  constructor() {
    const userJson = localStorage.getItem('currentUser');
    const user: User | null = userJson ? JSON.parse(userJson) : null;

    this.currentUserSubject = new BehaviorSubject<User | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  getUserDetails(): Observable<User> {
    return new Observable<User>((observer) => {
      this.httpClient.get<User>(`/api/users/self`).subscribe({
        next: (user) => {
          this.setCurrentUser(user);
          observer.next(user);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  setCurrentUser(user: User) {
    this.currentUserSubject.next(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  getCurrentUser() {
    const userJson = localStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
  }

  setUserPropertyPreference(propertyId: number, preference: PreferenceTypeEnum): Observable<User> {
    return this.http.put<User>(`${this.#path}/property/${propertyId}/preference?type=${preference}`, {});
  }
}
