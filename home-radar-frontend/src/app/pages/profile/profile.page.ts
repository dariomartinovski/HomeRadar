import { Component, inject, OnInit } from "@angular/core";
import { PropertyFormComponent } from "../../shared/components/property-form/property-form.component";
import { ProfileInfoComponent } from "../../shared/components/profile-info/profile-info.component";
import { UserService } from "../../core/services/user.service";
import { User } from "../../interfaces/user.interface";
import { Router, RouterLink } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { LoadingOverlayComponent } from "../../shared/components/loading-overlay/loading-overlay.component";

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [
    PropertyFormComponent,
    RouterLink,
    ProfileInfoComponent,
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

  logout() {
    this.#userService.logout();
     this.#router.navigate(['/login']).then(() => {
      this.loading = false;
    });
  }
}
