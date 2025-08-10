import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import { PropertyCategory } from '../../../enums/property-category.enum';

@Component({
  selector: 'property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss']
})
export class PropertyDetails {
  @Input() property?: Property;
  @Output() closePopup = new EventEmitter<void>();

  close() {
    this.closePopup.emit();
  }

  getImageUrl(property: Property): string {
    // if (property.category === PropertyCategory.FOR_RENT) {
    //   return property.type === 'HOUSE'
    //     ? 'assets/images/rent-house.jpg'
    //     : 'assets/images/rent-flat.jpg';
    // }
    return property.type === 'HOUSE'
      ? 'assets/images/sale_house_small.jpg'
      : 'assets/images/sale_flat_small.jpg';
  }
}