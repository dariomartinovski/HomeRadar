import {Component, Input, Output, EventEmitter, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../interfaces/property.interface';
import {PropertyService} from '../../../core/services/property.service';
import {ImageService} from '../../../core/services/image.service';

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

  #imageService = inject(ImageService);

  get imageUrl(): string {
    if (this.property?.internalImageId) {
      return this.#imageService.getImageUrl(this.property.internalImageId);
    }

    return this.property.externalImageUrl
      ? this.property.externalImageUrl
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
