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
  ],
})
export class HomePage implements OnInit {
  #perkService = inject(PerkService);
  #propertyService = inject(PropertyService);
  #userService = inject(UserService)
  #propertyEventService = inject(PropertyEventService);

  #route = inject(ActivatedRoute);

  selectedProperty?: Property;
  user?: User | null

  perks = signal<Perk[]>([]);
  properties = signal<Property[]>([]);
  categories = toSignal(this.#perkService.findAllCategories(), {
    initialValue: [] as PerkType[],
  });
  areas = toSignal(this.#propertyService.findAreas(), {
    initialValue: [] as string[],
  });

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

  private loadFilteredProperties() {
    const { title, area } = this.#route.snapshot.queryParams;
    this.#propertyService
      .fetchPropertiesFiltered(title || null, area || null)
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
