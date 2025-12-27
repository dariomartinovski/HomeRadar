import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { User } from '../../../interfaces/user.interface';
import { ReactiveFormsModule } from '@angular/forms';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {Component, inject, input, output} from '@angular/core';
import {PlanType} from '../../../enums/plan-type.enum';
import {CapitalizePipe} from '../../pipes/capitilzie.pipe';
import {SubscriptionService} from '../../../core/services/subscription.service';
import {CancelSubscriptionDialog} from '../../dialogs/cancel-subscription/cancel-subscription.dialog';

@Component({
  selector: 'profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatAutocompleteModule,
    CapitalizePipe
  ]
})
export class ProfileInfoComponent {
  user = input.required<User>();
  onSubscriptionCanceled = output<void>();

  #subscriptionService = inject(SubscriptionService);
  #dialog = inject(MatDialog);

  canceling = false;

  getPlanBadgeClass(planType: string): string {
    switch(planType) {
      case PlanType.PREMIUM: return 'plan-premium';
      case PlanType.STANDARD: return 'plan-standard';
      case PlanType.FREE:
      default: return 'plan-free';
    }
  }

  getPlanIcon(planType: string): string {
    switch(planType) {
      case PlanType.PREMIUM: return 'workspace_premium';
      case PlanType.STANDARD: return 'star';
      case PlanType.FREE:
      default: return 'check_circle';
    }
  }

  canCancelSubscription(): boolean {
    const plan = this.user().subscription.planType;
    const status = this.user().subscription.status;
    return (plan === 'STANDARD' || plan === 'PREMIUM') && status === 'ACTIVE';
  }

  cancelSubscription(): void {
    const dialogRef = this.#dialog.open(CancelSubscriptionDialog, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.canceling = true;
        this.#subscriptionService.cancelSubscription().subscribe({
          next: () => {
            this.canceling = false;
            this.onSubscriptionCanceled.emit();
            alert('Your subscription has been canceled successfully. You will have access until the end of your billing period.');
          },
          error: (error) => {
            console.error('Error canceling subscription:', error);
            this.canceling = false;
            alert('Failed to cancel subscription. Please try again or contact support.');
          }
        });
      }
    });
  }
}
