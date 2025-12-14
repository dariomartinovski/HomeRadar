import {Component, inject, OnInit} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {PropertyFormComponent} from '../../shared/components/property-form/property-form.component';
import {User} from '../../interfaces/user.interface';
import {UserService} from '../../core/services/user.service';
import {PerkTypeFormComponent} from '../../shared/components/perk-type-form/perk-type-form.component';
import {CreatePerkComponent} from '../../shared/components/perk-form/perk-form.component';

@Component({
  selector: 'admin-panel',
  templateUrl: './admin-panel.page.html',
  styleUrl: './admin-panel.page.scss',
  standalone: true,
  imports: [
    RouterModule,
    MatTabsModule,
    PropertyFormComponent,
    PerkTypeFormComponent,
    CreatePerkComponent,
  ],
})
export class AdminPanelPage implements OnInit {
  user?: User;

  #userService = inject(UserService);

  ngOnInit() {
    this.user = this.#userService.getCurrentUser();
  }
}
