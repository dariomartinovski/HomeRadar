import { Component } from "@angular/core";
import { MapComponent } from "../../shared/components/map/map.component";
import { mockProperties } from "../../data/properties.mock";
import { Property } from "../../interfaces/property.interface";
import { PropertyDetails } from "../../shared/components/property-details/property-details.component";

@Component({
  selector: 'home',
  imports: [MapComponent, PropertyDetails],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss'
})
export class HomePage {
  mockProperties = mockProperties;
  selectedProperty?: Property;

  handlePropertyClick(selectedProperty: Property) {
    this.selectedProperty = selectedProperty;
  }
}
