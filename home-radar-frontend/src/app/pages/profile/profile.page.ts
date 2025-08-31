import { Component } from "@angular/core";
import { PropertyFormComponent } from "../../shared/components/property-form/property-form.component";
import { ProfileInfoComponent } from "../../shared/components/profile-info/profile-info.component";

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [PropertyFormComponent, ProfileInfoComponent]
})
export class ProfilePage {

}
