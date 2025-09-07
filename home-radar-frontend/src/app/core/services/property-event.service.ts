import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Property } from '../../interfaces/property.interface';

@Injectable({ providedIn: 'root' })
export class PropertyEventService {
  private propertyCreatedSource = new Subject<Property>();
  propertyCreated$ = this.propertyCreatedSource.asObservable();

  emitPropertyCreated(property: Property) {
    this.propertyCreatedSource.next(property);
  }
}
