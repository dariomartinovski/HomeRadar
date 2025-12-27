import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import {UserService} from '../../../core/services/user.service';

@Component({
  selector: 'app-subscription-success',
  standalone: true,
  imports: [CommonModule, MatIcon],
  template: `
    <div class="success-container">
      <div class="success-card">
        <mat-icon class="success-icon">check_circle</mat-icon>
        <h1>Subscription Successful!</h1>
        <p>Thank you for subscribing. Your payment has been processed successfully.</p>
        <p class="session-info" *ngIf="sessionId">Session ID: {{ sessionId }}</p>
        <button class="primary-button" (click)="goToProfile()">
          Go to Profile
        </button>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }

    .success-card {
      background: white;
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      max-width: 500px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .success-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #4caf50;
      margin-bottom: 1rem;
    }

    h1 {
      color: #333;
      margin-bottom: 1rem;
    }

    p {
      color: #666;
      margin-bottom: 1rem;
    }

    .session-info {
      font-size: 0.875rem;
      color: #999;
    }

    .primary-button {
      background: #1976d2;
      color: white;
      border: none;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1.5rem;
      transition: background 0.3s;
    }

    .primary-button:hover {
      background: #1565c0;
    }
  `]
})
export class SubscriptionSuccessComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #userService = inject(UserService);

  sessionId: string | null = null;

  ngOnInit() {
    this.sessionId = this.#route.snapshot.queryParamMap.get('session_id');

    this.#userService.getUserDetails().subscribe({
      next: user => this.#userService.setCurrentUser(user),
      error: error => console.error("There was a problem while fetching the user details: ", error)
    })
  }

  goToProfile() {
    this.#router.navigate(['/profile']);
  }
}
