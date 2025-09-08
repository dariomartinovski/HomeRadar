import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  input,
  effect,
  runInInjectionContext,
  inject,
  EnvironmentInjector,
  signal,
} from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import { SelectedArea } from '../../../interfaces/selected-area.interface';
import * as L from 'leaflet';
import { Coordinate } from '../../../interfaces/coordinate.interface';
import { Perk } from '../../../interfaces/perk.interface';
import { getPerkIcon } from '../../utils/perk-icon-url.util';
import { capitilize } from '../../utils/capitilize.util';
import { defaultUserPreferences } from '../../../data/default-user-preferences.const';
import { UserPreferences } from '../../../interfaces/user-preferences.interface';
import { SubscribeButtonComponent } from '../subscribe-button/subscribe-button.component';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { CreateSubscriptionRequest, SubscriptionType } from '../../../interfaces/subscription.interface';
import { catchError, of } from 'rxjs';
import { PropertyType } from '../../../enums/property-type.enum';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [SubscribeButtonComponent]
})
export class MapComponent implements AfterViewInit, OnDestroy {
  private injector = inject(EnvironmentInjector);

  properties = input<Property[]>([]);
  perks = input<Perk[]>([]);
  radius = input<number>(500);

  showSubscribeButton = signal(false);
  isSubscribing = signal(false);

  userPreferences = input<UserPreferences>(defaultUserPreferences);

  @Output() selectedProperty = new EventEmitter<Property>();
  @Output() selectedArea = new EventEmitter<SelectedArea>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;

  private propertyMarkers: { marker: L.Marker; property: Property }[] = [];
  private perkMarkers: { marker: L.Marker; perk: Perk }[] = [];

  private selectedCircle!: L.Circle;
  private selectedCenterMarker!: L.Marker;

  subscriptionService = inject(SubscriptionService)

  ngAfterViewInit(): void {
    this.initMap();

    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (!this.map) return;
        this.updatePerksMarkers();
      });

      effect(() => {
        if (!this.map) return;
        this.updatePropertyMarkers();
      });
    });
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(
      [41.9981, 21.4254],
      13
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      this.map.flyTo([lat, lng], 16, {
        animate: true,
        duration: 1,
      });

      this.addCircleFromCoordinates({ latitude: lat, longitude: lng });

      this.selectedProperty.emit(undefined);
    });

    this.map.on('contextmenu', () => {
      this.clearSelectedArea();
    });
  }

  private addMarkersForProperties() {
    //TODO there are red, orange, yellow, blue, black, gold, violet, grey icons
    this.properties().forEach((property) => {
      const greenIcon = new L.Icon({
        iconUrl:property.type == PropertyType.HOUSE ? '/assets/icons/house_pin.png' : '/assets/icons/apartments_pin.png',
          shadowUrl:
            'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([property.latitude, property.longitude], {
        icon: greenIcon,
      }).addTo(this.map);

      marker.bindPopup(property.title);

      marker.on('click', () => {
        this.map.flyTo([property.latitude, property.longitude], 17, {
          animate: true,
          duration: 1.4,
        });

        this.selectedProperty.emit(property);
      });

      this.propertyMarkers.push({ marker, property });
    });
  }

  private addMarkersForPerks(): void {
    this.perks().forEach((perk) => {
      const perkIcon = getPerkIcon(perk.type);

      const marker = L.marker([perk.latitude, perk.longitude], {
        icon: perkIcon,
      }).addTo(this.map);

      marker.bindPopup(this.createPerkPopup(perk));

      marker.on('click', () => {
        this.map.flyTo([perk.latitude, perk.longitude], 17, {
          animate: true,
          duration: 1.4,
        });

        this.selectedProperty.emit(undefined);
      });

      this.perkMarkers.push({ marker, perk });
    });
  }

  private clearPropertyMarkers(): void {
    this.propertyMarkers.forEach(({ marker }) => {
      this.map.removeLayer(marker);
    });
    this.propertyMarkers = [];
  }

  private clearPerkMarkers(): void {
    this.perkMarkers.forEach(({ marker }) => {
      this.map.removeLayer(marker);
    });
    this.perkMarkers = [];
  }

  private updatePropertyMarkers(): void {
    this.clearPropertyMarkers();

    this.addMarkersForProperties();

    if (this.selectedCircle) {
      const center = this.selectedCircle.getLatLng();
      this.filterMarkersByRadius(center.lat, center.lng, this.userPreferences().radius);
    }
  }

  private updatePerksMarkers(): void {
    this.clearPerkMarkers();

    this.addMarkersForPerks();

    if (this.selectedCircle) {
      const center = this.selectedCircle.getLatLng();
      this.filterMarkersByRadius(center.lat, center.lng, this.userPreferences().radius);
    }
  }

  private createPerkPopup(perk: Perk): string {
    const openingHoursHtml = perk.openingHours
      ? `<p><strong>Working Hours:</strong> ${perk.openingHours}</p>`
      : '';

    return `
      <div style="
        font-family: Arial, sans-serif;
        padding: 8px;
        max-width: 200px;
        line-height: 1.4;
      ">
        <h3 style="
          margin: 0 0 6px;
          font-size: 16px;
          color: #2c3e50;
        ">
          ${perk.title}
        </h3>

        <p style="margin: 0 0 4px; font-size: 13px; color: #555;">
          <strong>Type:</strong> ${capitilize(perk.type)}
        </p>

        <p style="margin: 0 0 4px; font-size: 12px; color: #777;">
          📍 ${perk.latitude.toFixed(5)}, ${perk.longitude.toFixed(5)}
        </p>

        ${openingHoursHtml}
      </div>
    `;
  }

  private addCircleFromCoordinates(coordinate: Coordinate): void {
    console.log("the radius when clicking is ", this.userPreferences().radius)

    this.checkIfValidCoordinate(coordinate);

    if (this.selectedCircle) {
      this.map.removeLayer(this.selectedCircle);
    }

    if (this.selectedCenterMarker) {
      this.map.removeLayer(this.selectedCenterMarker);
    }

    this.selectedCircle = L.circle(
      [coordinate.latitude, coordinate.longitude],
      {
        radius: this.userPreferences().radius,
        color: 'green',
      }
    ).addTo(this.map);

    const icon = L.divIcon({
      className: 'circle-center-icon',
      html: `<div style="width: 10px; height: 10px; background: green; border-radius: 50%; border: 2px solid white;"></div>`,
      iconSize: [10, 10],
      iconAnchor: [5, 5],
    });

    this.selectedCenterMarker = L.marker(
      [coordinate.latitude, coordinate.longitude],
      {
        icon,
        interactive: false,
      }
    ).addTo(this.map);

    this.filterMarkersByRadius(
      coordinate.latitude,
      coordinate.longitude,
      this.userPreferences().radius
    );

    this.selectedArea.emit({ center: coordinate, radius: this.userPreferences().radius });

    this.showSubscribeButton.set(true);
  }

  private checkIfValidCoordinate(coordinate: Coordinate) {
    if (
      coordinate.latitude < 40.873926 ||
      coordinate.latitude > 42.376477 ||
      coordinate.longitude < 20.453475 ||
      coordinate.longitude > 23.040348
    )
      throw 'Coordinate is not valid';
  }

  private filterMarkersByRadius(
    latitude: number,
    longitude: number,
    radius: number
  ) {
    const allMarkers = [
      ...this.propertyMarkers.map(item => ({ marker: item.marker, location: item.property })),
      ...this.perkMarkers.map(item => ({ marker: item.marker, location: item.perk }))
    ];

    allMarkers.forEach(({ marker, location }) => {
      const distance = this.map.distance(
        L.latLng(latitude, longitude),
        L.latLng(location.latitude, location.longitude)
      );

      if (distance <= radius) {
        if (!this.map.hasLayer(marker)) {
          marker.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(marker)) {
          this.map.removeLayer(marker);
        }
      }
    });
  }

  private clearSelectedArea(): void {
    if (this.selectedCircle) {
      this.map.removeLayer(this.selectedCircle);
      this.selectedCircle = undefined!;
    }

    if (this.selectedCenterMarker) {
      this.map.removeLayer(this.selectedCenterMarker);
      this.selectedCenterMarker = undefined!;
    }

    [...this.propertyMarkers, ...this.perkMarkers].forEach(({ marker }) => {
      if (!this.map.hasLayer(marker)) {
        marker.addTo(this.map);
      }
    });

    this.selectedArea.emit({ center: undefined!, radius: 0 });
    this.selectedProperty.emit(undefined);

    this.showSubscribeButton.set(false);

  }

   subscribeToArea() {
    if (!this.selectedCircle) {
      return;
    }

    const area = this.selectedCircle.getLatLng();
    const radius = this.selectedCircle.getRadius();

    if (this.isSubscribing()) {
      return;
    }

    this.isSubscribing.set(true);

    const subscriptionRequest: CreateSubscriptionRequest = {
      latitude: area.lat,
      longitude: area.lng,
      radiusMeters: radius,
      type: SubscriptionType.INSTANT
      };

    this.subscriptionService.createSubscription(subscriptionRequest)
      .pipe(
        catchError((error) => {
          alert('Failed to create subscription. Please try again.');
          return of(null);
        })
      )
      .subscribe((subscription) => {
        this.isSubscribing.set(false);

        if (subscription) {
          alert('Successfully subscribed to this area!');
          this.clearSelectedArea();
        }
      });
  }
}
