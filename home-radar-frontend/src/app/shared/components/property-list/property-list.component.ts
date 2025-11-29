import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Property } from '../../../interfaces/property.interface';
import { PropertyListCardComponent } from '../property-list-card/property-list-card.component';

type SortOption = 'price-asc' | 'price-desc' | 'size-asc' | 'size-desc' | 'rooms-asc' | 'rooms-desc' | 'default';

@Component({
  selector: 'property-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyListCardComponent],
  templateUrl: './property-list.component.html',
  styleUrls: ['./property-list.component.scss']
})
export class PropertyListComponent {
  @Input() set properties(value: Property[]) {
    this._properties = value;
    this.sortProperties();
  }

  @Output() propertySelected = new EventEmitter<Property>();

  #router = inject(Router);

  private _properties: Property[] = [];
  sortedProperties: Property[] = [];
  selectedSort: SortOption = 'default';

  sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'size-asc', label: 'Size: Smallest First' },
    { value: 'size-desc', label: 'Size: Largest First' },
    { value: 'rooms-asc', label: 'Rooms: Least First' },
    { value: 'rooms-desc', label: 'Rooms: Most First' }
  ];

  onPropertyClick(property: Property): void {
    this.propertySelected.emit(property);
    this.#router.navigate(["/property-details/" + property.id]);
  }

  onSortChange(): void {
    this.sortProperties();
  }

  private sortProperties(): void {
    this.sortedProperties = [...this._properties];

    switch (this.selectedSort) {
      case 'price-asc':
        this.sortedProperties.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.sortedProperties.sort((a, b) => b.price - a.price);
        break;
      case 'size-asc':
        this.sortedProperties.sort((a, b) => a.squareMeters - b.squareMeters);
        break;
      case 'size-desc':
        this.sortedProperties.sort((a, b) => b.squareMeters - a.squareMeters);
        break;
      case 'rooms-asc':
        this.sortedProperties.sort((a, b) => a.numberOfRooms - b.numberOfRooms);
        break;
      case 'rooms-desc':
        this.sortedProperties.sort((a, b) => b.numberOfRooms - a.numberOfRooms);
        break;
      default:
        break;
    }
  }
}
