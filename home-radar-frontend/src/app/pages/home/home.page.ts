import { Component, inject, OnInit, signal } from "@angular/core";
import { MapComponent } from "../../shared/components/map/map.component";
import { mockProperties } from "../../data/properties.mock";
import { mockPerks } from "../../data/perks.mock";
import { Property } from "../../interfaces/property.interface";
import { PropertyDetails } from "../../shared/components/property-details/property-details.component";
import { Perk } from "../../interfaces/perk.interface";
import { PerkService } from "../../core/services/perks.service";
import { Observable, of } from "rxjs";
import { CommonModule } from '@angular/common';
import { toSignal } from "@angular/core/rxjs-interop";
import { PropertyService } from "../../core/services/property.service";
import { SearchComponent } from "../../shared/components/search/search.component";
import { CategoriesFilterComponent } from "../../shared/components/categories-filter/categories-filter.component";
import { PerkType } from "../../enums/perk-type.enum";
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  imports: [
    MapComponent,
    PropertyDetails,
    SearchComponent,
    CategoriesFilterComponent,
    CommonModule,
    SidebarComponent
]
})
export class HomePage {
  #perkService = inject(PerkService);
  #propertyService = inject(PropertyService);

  selectedProperty?: Property;

  perks = toSignal(this.#perkService.fetchPerks(), { initialValue: [] as Perk[] });
  properties = toSignal(this.#propertyService.fetchProperties(), { initialValue: [] as Property[] });
  categories = toSignal(this.#perkService.findAllCategories(), { initialValue: [] as PerkType[] });

  handlePropertyClick(selectedProperty: Property) {
    this.selectedProperty = selectedProperty;
  }
}
