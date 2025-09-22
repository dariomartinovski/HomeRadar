import { Component, inject, OnInit, signal } from "@angular/core";
import { MapComponent } from "../../shared/components/map/map.component";
import { Property } from "../../interfaces/property.interface";
import { PropertyDetails } from "../../shared/components/property-details/property-details.component";
import { Perk } from "../../interfaces/perk.interface";
import { PerkService } from "../../core/services/perks.service";
import { CommonModule } from '@angular/common';
import { toSignal } from "@angular/core/rxjs-interop";
import { PropertyService } from "../../core/services/property.service";
import { SearchComponent } from "../../shared/components/search/search.component";
import { PerkType } from "../../enums/perk-type.enum";
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { UserService } from "../../core/services/user.service";
import { User } from "../../interfaces/user.interface";
import { PropertyEventService } from "../../core/services/property-event.service";
import { HomeRadarScoreComponent } from "../../shared/components/home-radar-score/home-radar-score.component";
import { SelectedArea } from "../../interfaces/selected-area.interface";
import { UserPreferencesService } from "../../core/services/user-preferences.service";
import { defaultUserPreferences } from "../../data/default-user-preferences.const";

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  imports: [
    MapComponent,
    PropertyDetails,
    SearchComponent,
    SidebarComponent,
    CommonModule,
    RouterModule,
    HomeRadarScoreComponent
],
})
export class HomePage implements OnInit {
  #perkService = inject(PerkService);
  #propertyService = inject(PropertyService);
  #userService = inject(UserService)
  #propertyEventService = inject(PropertyEventService);

  #route = inject(ActivatedRoute);
  #userPreferencesService = inject(UserPreferencesService);

  selectedProperty?: Property;
  user?: User | null
  selectedArea?: SelectedArea;

  perks = signal<Perk[]>([]);
  properties = signal<Property[]>([]);
  categories = toSignal(this.#perkService.findAllCategories(), {
    initialValue: [] as PerkType[],
  });
  areas = toSignal(this.#propertyService.findAreas(), {
    initialValue: [] as string[],
  });
  userPreferences = toSignal(this.#userPreferencesService.getUserPreference(), {
    initialValue: defaultUserPreferences
  })

  ngOnInit() {
    this.loadFilteredProperties();
    this.loadFilteredPerks();
    this.loadUser();

     this.#propertyEventService.propertyCreated$.subscribe((newProperty) => {
     this.properties.set([...this.properties(), newProperty]);
  });
  }

  handlePropertySearch() {
    this.loadFilteredProperties();
  }

  handlePerkSearch() {
    this.loadFilteredPerks();
  }

  handlePropertyClick(selectedProperty: Property) {
    this.selectedProperty = selectedProperty;
  }

  handleAreaSelect(selectedArea: SelectedArea) {
    this.selectedArea = selectedArea;
  }

  private loadFilteredProperties() {
    const queryParams = this.#route.snapshot.queryParams;
    const filters = {
      title: queryParams['title'] || undefined,
      area: queryParams['area'] || undefined,
      propertyCategory: queryParams['propertyCategory'] || undefined,
      priceMin: queryParams['priceMin'] || undefined,
      priceMax: queryParams['priceMax'] || undefined,
      rooms: queryParams['rooms'] || undefined,
      bedrooms: queryParams['bedrooms'] || undefined,
      bathrooms: queryParams['bathrooms'] || undefined,
      sizeMin: queryParams['sizeMin'] || undefined,
      sizeMax: queryParams['sizeMax'] || undefined,
      yearBuilt: queryParams['yearBuilt'] || undefined,
      parking: queryParams['parking'] ? queryParams['parking'] : undefined,
      balcony: queryParams['balcony'] ? queryParams['balcony'] : undefined,
      elevator: queryParams['elevator'] ? queryParams['elevator'] : undefined,
    };
    
    this.#propertyService.fetchPropertiesFiltered(filters)
      .subscribe((filteredProperties) => {
        this.properties.set(filteredProperties);
      });
  }

  private loadFilteredPerks() {
    const { category } = this.#route.snapshot.queryParams;
    this.#perkService
      .fetchPerksFiltered(category)
      .subscribe((filteredPerks) => {
        this.perks.set(filteredPerks);
      });
  }

  private loadUser() {
    this.#userService.getUserDetails().subscribe((user) => {
      this.user = user;
    });
  }
}
