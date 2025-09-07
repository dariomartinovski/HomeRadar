import { Component } from "@angular/core";
import {PropertyFormComponent} from '../../shared/components/property-form/property-form.component';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [ 
    PropertyFormComponent,
    RouterLink
  ]
})
export class ProfilePage {

}
