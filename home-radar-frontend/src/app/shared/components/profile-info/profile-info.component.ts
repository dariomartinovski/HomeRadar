import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../interfaces/user.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { Component, inject } from '@angular/core';

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
  ]
})
export class ProfileInfoComponent {
  user?: User | null

  private readonly _userService = inject(UserService)

  ngOnInit(): void {
    this._userService.getUserDetails().subscribe((user) => {
      this.user = user;
    });
  }
}
