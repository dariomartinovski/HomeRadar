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
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";

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
    RouterModule
  ]
})
export class HomePage implements OnInit {
  #perkService = inject(PerkService);
  #propertyService = inject(PropertyService);
  #route = inject(ActivatedRoute);

  selectedProperty?: Property;

  perks = toSignal(this.#perkService.fetchPerks(), { initialValue: [] as Perk[] });
  properties = signal<Property[]>([]);
  categories = toSignal(this.#perkService.findAllCategories(), { initialValue: [] as PerkType[] });
  areas = toSignal(this.#propertyService.findAreas(), { initialValue: [] as string[] });

  ngOnInit() {
    //TODO refactor this, same code as below
    const { title, area } = this.#route.snapshot.queryParams;
    this.#propertyService
      .fetchPropertiesFiltered(title || null, area || null)
      .subscribe(filteredProperties => {
        this.properties.set(filteredProperties);
      });
  }

  handlePropertyClick(selectedProperty: Property) {
    this.selectedProperty = selectedProperty;
  }

  handleSearch() {
    const { title, area } = this.#route.snapshot.queryParams;
    this.#propertyService
      .fetchPropertiesFiltered(title || null, area || null)
      .subscribe(filteredProperties => {
        this.properties.set(filteredProperties);
      });
  }
}
