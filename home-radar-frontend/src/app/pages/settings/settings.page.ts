import { Component, inject   } from "@angular/core";
import { RouterLink } from '@angular/router';
import { UserPreferencesComponent } from "../../shared/components/user-preferences/user-preferences.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { PerkService } from "../../core/services/perks.service";
import { UserPreferencesService } from "../../core/services/user-preferences.service";
import {PerkType} from '../../interfaces/perk-type.interface';

@Component({
  selector: 'settings',
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
  imports: [RouterLink, UserPreferencesComponent]
})
export class SettingsPage {
  #perkService = inject(PerkService);
  #userPreferencesService = inject(UserPreferencesService);

  userPreferences = toSignal(this.#userPreferencesService.getUserPreference(), {
    // initialValue: defaultUserPreferences,
  });

  categories = toSignal(this.#perkService.findAllCategories(), {
    initialValue: [] as PerkType[],
  });
}
