import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../interfaces/property.interface';

@Component({
  selector: 'property-list-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-list-card.component.html',
  styleUrls: ['./property-list-card.component.scss']
})
export class PropertyListCardComponent {
  @Input({ required: true }) property!: Property;
  @Output() cardClick = new EventEmitter<Property>();

  get imageUrl(): string {
    return this.property.imageUrl
      ? this.property.imageUrl
      : (this.property.type === 'HOUSE'
        ? 'assets/images/sale_house_small.jpg'
        : 'assets/images/sale_flat_small.jpg');
  }

  getCategoryLabel(category: string): string {
    return category === 'FOR_RENT' ? 'For Rent' : 'For Sale';
  }

  onCardClick(): void {
    this.cardClick.emit(this.property);
  }
}
