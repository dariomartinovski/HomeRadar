import { Component, inject   } from "@angular/core";
import { RouterLink } from '@angular/router';
import { UserPreferencesComponent } from "../../shared/components/user-preferences/user-preferences.component";
import { toSignal } from "@angular/core/rxjs-interop";
import { PerkType } from "../../enums/perk-type.enum";
import { PerkService } from "../../core/services/perks.service";
import { UserPreferencesService } from "../../core/services/user-preferences.service";
import { UserPreferences } from "../../interfaces/user-preferences.interface";
import { defaultUserPreferences } from "../../data/default-user-preferences.const";

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
    initialValue: defaultUserPreferences,
  });

  categories = toSignal(this.#perkService.findAllCategories(), {
    initialValue: [] as PerkType[],
  });
}