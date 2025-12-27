import {Component} from '@angular/core';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  imports: [MatDialogModule, MatButtonModule],
  selector: 'cancel-subscription-dialog',
  standalone: true,
  styles: [`
    .warning {
      color: #f44336;
      font-weight: 500;
      margin-top: 1em;
    }

    mat-dialog-actions {
      gap: 0.5em;
    }
  `],
  template: `
    <h2 mat-dialog-title>Cancel Subscription</h2>
    <mat-dialog-content>
      <p>Are you sure you want to cancel your subscription?</p>
      <p class="warning">You will lose access to premium features at the end of your current billing period.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Keep Subscription</button>
      <button mat-raised-button color="warn" [mat-dialog-close]="true">Cancel Subscription</button>
    </mat-dialog-actions>
  `
})
export class CancelSubscriptionDialog {
}
