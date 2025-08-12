import { Component, inject, OnInit } from "@angular/core";
import { MapComponent } from "../../shared/components/map/map.component";
import { mockProperties } from "../../data/properties.mock";
import { mockPerks } from "../../data/perks.mock";
import { Property } from "../../interfaces/property.interface";
import { PropertyDetails } from "../../shared/components/property-details/property-details.component";
import { Perk } from "../../interfaces/perk.interface";
import { PerkService } from "../../core/services/perks.service";
import { Observable, of } from "rxjs";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'home',
  imports: [MapComponent, PropertyDetails, CommonModule],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage implements OnInit {
  #perkService = inject(PerkService);
  
  properties$: Observable<Property[]> = of(mockProperties);
  perks$: Observable<Perk[]> = of([]);
  selectedProperty?: Property;

  mockProperties = mockProperties;
  mockPerks = mockPerks;

  ngOnInit(): void {
    console.log("call starting")
    this.#perkService.fetchPerks().subscribe({
      next: (perks) => console.log(perks),
      error: (err) => console.error(err)
    });
  }

  handlePropertyClick(selectedProperty: Property) {
    this.selectedProperty = selectedProperty;
  }
}
