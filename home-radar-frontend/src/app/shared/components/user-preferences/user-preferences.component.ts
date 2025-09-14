import { Component, effect, inject, input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { PerkType } from "../../../enums/perk-type.enum";
import { MatSliderModule } from "@angular/material/slider";
import { CapitalizePipe } from "../../pipes/capitilzie.pipe";
import { DecimalPipe } from "@angular/common";
import { UserPreferencesService } from "../../../core/services/user-preferences.service";
import { UserPreferences } from "../../../interfaces/user-preferences.interface";
import { defaultUserPreferences } from "../../../data/default-user-preferences.const";

@Component({
  selector: 'user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss'],
  imports: [
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatSliderModule,
    CapitalizePipe,
    DecimalPipe
  ],
})
export class UserPreferencesComponent {
  #formBuilder = inject(FormBuilder);
  #userPreferencesService = inject(UserPreferencesService);
 
  categories = input<PerkType[]>([]);
  userPreferences = input<UserPreferences>(defaultUserPreferences);
 
  form!: FormGroup;

  constructor() {
    effect(() => {
      const cats = this.categories();
      if (cats.length === 0) return;
      
      const prefs = this.userPreferences();
      const initialRadius = prefs?.radius ?? defaultUserPreferences.radius;
      
      const initialPerks = cats.reduce((acc, perk) => {
        const perkPref = prefs?.perkPreferences?.find(p => p.perkType === perk);
        acc[perk] = [perkPref?.weight ?? 0.5];
        return acc;
      }, {} as Record<string, any>);

      this.form = this.#formBuilder.group({
        radius: [initialRadius],
        weightsBalance: [0.6],
        perks: this.#formBuilder.group(initialPerks),
      });
    });

    effect(() => {
      const prefs = this.userPreferences();
      const cats = this.categories();
      
      if (!this.form || !prefs || cats.length === 0) return;
      
      this.patchFormWithPreferences(prefs);
    });
  }

  private patchFormWithPreferences(preferences: UserPreferences) {
    if (!this.form) return;

    this.form.get('radius')?.setValue(preferences.radius);
    this.form.get('weightsBalance')?.setValue(preferences.weightsBalance);

    const perksObject = preferences.perkPreferences.reduce((acc, p) => {
      acc[p.perkType] = p.weight;
      return acc;
    }, {} as Record<string, number>);

    const perksGroup = this.form.get('perks');
    if (perksGroup) {
      Object.entries(perksObject).forEach(([perkType, weight]) => {
        const control = perksGroup.get(perkType);
        if (control) {
          control.setValue(weight);
        }
      });
    }
  }

  submitPreferences() {
    if (!this.form) return;

    const rawValue = this.form.value;

    const payload = {
      radius: rawValue.radius,
      weightsBalance: rawValue.weightsBalance,
      perkPreferences: Object.entries(rawValue.perks).map(([perkType, weight]) => ({
        perkType,
        weight
      }))
    } as UserPreferences;

    this.#userPreferencesService
      .createOrUpdateUserPreference(payload)
      .subscribe({
        next: () => alert("Succesfully saved preferences"),
        error: (error) => console.error(error)
      });
  }
}