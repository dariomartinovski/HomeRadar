import { inject, Injectable } from '@angular/core';
import { User } from '../../interfaces/user.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RegisterRequest } from '../../interfaces/auth/register-request';
import { catchError, map, Observable, of } from 'rxjs';
import { AuthenticationResponse } from '../../interfaces/auth/authentication-response';
import { AuthenticationRequest } from '../../interfaces/auth/authentication-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  httpClient = inject(HttpClient)

  register(request: RegisterRequest): Observable<AuthenticationResponse> {
    return this.httpClient.post<AuthenticationResponse>(`/api/auth/register`, request);
  }

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.httpClient.post<AuthenticationResponse>(`/api/auth/authenticate`, request).pipe(
      map((response: AuthenticationResponse) => {
        localStorage.setItem('token', response.token);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        return of({ error: error.message } as any);
      })
    );
  }

  logout() {
    // this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
