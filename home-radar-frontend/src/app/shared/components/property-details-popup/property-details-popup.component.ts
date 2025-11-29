  import {Component, Input, Output, EventEmitter, inject} from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import {Router} from '@angular/router';

@Component({
  selector: 'property-details-popup',
  templateUrl: './property-details-popup.component.html',
  styleUrls: ['./property-details-popup.component.scss']
})
export class PropertyDetailsPopupComponent {
  @Input() property?: Property;
  @Output() closePopup = new EventEmitter<void>();

  #router = inject(Router);

  close() {
    this.closePopup.emit();
  }

  getImageUrl(property: any): string {
    return property.imageUrl
      ? property.imageUrl
      : (property.type === 'HOUSE'
        ? 'assets/images/sale_house_small.jpg'
        : 'assets/images/sale_flat_small.jpg');
  }

  viewFullDetails(): void {
    if (this.property?.id)
      this.#router.navigate(["/property-details/" + this.property.id]);
  }
}
