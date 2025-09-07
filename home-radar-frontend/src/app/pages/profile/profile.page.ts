import { Component, inject, OnInit } from "@angular/core";
import { PropertyFormComponent } from "../../shared/components/property-form/property-form.component";
import { ProfileInfoComponent } from "../../shared/components/profile-info/profile-info.component";
import { UserService } from "../../core/services/user.service";
import { User } from "../../interfaces/user.interface";

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [PropertyFormComponent, ProfileInfoComponent]
})
export class ProfilePage implements OnInit {
  #userService = inject(UserService)
  user?: User | null = null

    ngOnInit(): void {
    this.loadUser()
  }

  private loadUser() {
    this.#userService.getUserDetails().subscribe((user) => {
      this.user = user;
    });
  }
}
