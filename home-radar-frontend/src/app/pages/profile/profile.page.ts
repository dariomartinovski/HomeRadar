import { Component, inject, OnInit } from "@angular/core";
import { ProfileInfoComponent } from "../../shared/components/profile-info/profile-info.component";
import { UserPropertyPreferencesComponent } from "../../shared/components/user-property-preferences/user-property-preferences.component";
import { UserService } from "../../core/services/user.service";
import { User } from "../../interfaces/user.interface";
import { Router, RouterLink } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { LoadingOverlayComponent } from "../../shared/components/loading-overlay/loading-overlay.component";
import { UserRole } from '../../enums/user-role.enums';
import {PlanType} from '../../enums/plan-type.enum';

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [
    RouterLink,
    ProfileInfoComponent,
    UserPropertyPreferencesComponent,
    MatIcon,
    LoadingOverlayComponent
  ]
})
export class ProfilePage implements OnInit {
  #userService = inject(UserService)
  #router = inject(Router);

  user?: User | null = null
  loading = false;

  ngOnInit(): void {
    this.loadUser()
  }

  private loadUser() {
    this.loading = true;
    this.#userService.getUserDetails().subscribe({
      next: (user) => {
        this.user = user;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSubscriptionCanceled() {
    this.loadUser();
  }

  logout() {
    this.#userService.logout();
    this.#router.navigate(['/login']).then(() => {
      this.loading = false;
    });
  }

  viewPlans() {
    this.#router.navigate(['/subscription-plans']);
  }

  protected readonly UserRole = UserRole;
  protected readonly PlanType = PlanType;
}
