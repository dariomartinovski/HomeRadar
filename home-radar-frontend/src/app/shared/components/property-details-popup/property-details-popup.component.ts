import {Component, Input, Output, EventEmitter, inject} from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import {Router} from '@angular/router';
import {ImageService} from '../../../core/services/image.service';

@Component({
  selector: 'property-details-popup',
  templateUrl: './property-details-popup.component.html',
  styleUrls: ['./property-details-popup.component.scss']
})
export class PropertyDetailsPopupComponent {
  @Input() property?: Property;
  @Output() closePopup = new EventEmitter<void>();

  #router = inject(Router);
  #imageService = inject(ImageService);

  close() {
    this.closePopup.emit();
  }

  getImageUrl(property: any): string {
    if (this.property?.internalImageId) {
      return this.#imageService.getImageUrl(this.property.internalImageId);
    }

    return property.externalImageUrl
      ? property.externalImageUrl
      : (property.type === 'HOUSE'
        ? 'assets/images/sale_house_small.jpg'
        : 'assets/images/sale_flat_small.jpg');
  }

  viewFullDetails(): void {
    if (this.property?.id)
      this.#router.navigate(["/property-details/" + this.property.id]);
  }
}
