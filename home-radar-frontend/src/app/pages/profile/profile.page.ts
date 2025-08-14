import { Component } from "@angular/core";
import {PropertyFormComponent} from '../../shared/components/property-form/property-form.component';

@Component({
  selector: 'profile',
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
  imports: [ PropertyFormComponent
  ]
})
export class ProfilePage {

}
