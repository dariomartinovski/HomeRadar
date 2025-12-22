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
  signal, OnInit,
} from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import { SelectedArea } from '../../../interfaces/selected-area.interface';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import { Coordinate } from '../../../interfaces/coordinate.interface';
import { Perk } from '../../../interfaces/perk.interface';
import {getIcon} from '../../utils/icon-url.util';
import { capitilize } from '../../utils/capitilize.util';
import {DEFAULT_PREFERENCES_RADIUS} from '../../../data/default-user-preferences.const';
import { UserPreferences } from '../../../interfaces/user-preferences.interface';
import { SubscribeButtonComponent } from '../subscribe-button/subscribe-button.component';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { CreateSubscriptionRequest, SubscriptionType } from '../../../interfaces/subscription.interface';
import { catchError, of } from 'rxjs';
import { PropertyType } from '../../../enums/property-type.enum';
import { ActivatedRoute } from '@angular/router';
import {UserService} from '../../../core/services/user.service';
import {User} from '../../../interfaces/user.interface';
import {PreferenceTypeEnum} from '../../../enums/preference-type.enum';
import {ImageService} from '../../../core/services/image.service';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [SubscribeButtonComponent]
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private injector = inject(EnvironmentInjector);

  properties = input<Property[]>([]);
  perks = input<Perk[]>([]);
  radius = input<number>(DEFAULT_PREFERENCES_RADIUS);

  showSubscribeButton = signal(false);
  isSubscribing = signal(false);
  showLegend = signal(false);

  userPreferences = input<UserPreferences>()//defaultUserPreferences);

  @Output() selectedProperty = new EventEmitter<Property>();
  @Output() selectedArea = new EventEmitter<SelectedArea>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;

  // Use marker cluster groups for better performance
  private propertyClusterGroup!: L.MarkerClusterGroup;
  private perkClusterGroup!: L.MarkerClusterGroup;

  private propertyMarkers: { marker: L.Marker; property: Property }[] = [];
  private perkMarkers: { marker: L.Marker; perk: Perk }[] = [];

  private selectedCircle!: L.Circle;
  private selectedCenterMarker!: L.Marker;

  private iconCache = new Map<string, L.Icon>();

  private user?: User;

  subscriptionService = inject(SubscriptionService);
  #route = inject(ActivatedRoute);
  #userService = inject(UserService);
  #imageService = inject(ImageService);

  ngOnInit() {
    this.user = this.#userService.getCurrentUser();
  }

  ngAfterViewInit(): void {
    this.initMap();

    runInInjectionContext(this.injector, () => {
      effect(() => {
        if (!this.map) return;
        this.updatePerksMarkers();
        this.#route.queryParams.subscribe(params => {
          if (params['perkId']) {
            this.focusPerk(+params['perkId']);
          }
        });
      });

      effect(() => {
        if (!this.map) return;
        this.updatePropertyMarkers();
        this.#route.queryParams.subscribe(params => {
          if (params['propertyId']) {
            this.focusProperty(+params['propertyId']);
          }
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (this.propertyClusterGroup) {
      this.propertyClusterGroup.clearLayers();
    }
    if (this.perkClusterGroup) {
      this.perkClusterGroup.clearLayers();
    }
    this.iconCache.clear();
    this.map.remove();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      preferCanvas: true, // Use Canvas renderer for better performance
      zoomControl: false,
    }).setView([41.9981, 21.4254], 13);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
      updateWhenIdle: true, // Only update tiles when map stops moving
      keepBuffer: 2, // Keep fewer tiles in memory
    }).addTo(this.map);

    // Initialize marker cluster groups with custom icon creation
    this.propertyClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      disableClusteringAtZoom: 18,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        let className = 'marker-cluster-';
        let size = 40;

        // Color code based on density
        if (childCount < 10) {
          className += 'small';
        } else if (childCount < 50) {
          className += 'medium';
          size = 50;
        } else if (childCount < 100) {
          className += 'large';
          size = 60;
        } else {
          className += 'xlarge';
          size = 70;
        }

        return new L.DivIcon({
          html: `<div><span>${childCount}</span></div>`,
          className: 'marker-cluster ' + className,
          iconSize: new L.Point(size, size)
        });
      }
    });

    this.perkClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 40,
      disableClusteringAtZoom: 18,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      chunkedLoading: true,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        let className = 'perk-cluster-';
        let size = 40;

        // Color code based on density
        if (childCount < 10) {
          className += 'small';
        } else if (childCount < 50) {
          className += 'medium';
          size = 50;
        } else if (childCount < 100) {
          className += 'large';
          size = 60;
        } else {
          className += 'xlarge';
          size = 70;
        }

        return new L.DivIcon({
          html: `<div><span>${childCount}</span></div>`,
          className: 'marker-cluster ' + className,
          iconSize: new L.Point(size, size)
        });
      }
    });

    this.map.addLayer(this.propertyClusterGroup);
    this.map.addLayer(this.perkClusterGroup);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      this.map.flyTo([lat, lng], 17, {
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

  private getOrCreateIcon(iconUrl: string): L.Icon {
    if (!this.iconCache.has(iconUrl)) {
      const icon = new L.Icon({
        iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      this.iconCache.set(iconUrl, icon);
    }
    return this.iconCache.get(iconUrl)!;
  }

  private addMarkersForProperties() {
    // Batch marker creation
    const markers: L.Marker[] = [];

    const userInteractedProperties = new Map(
      this.user?.propertyPreferences.map(it => [it.propertyId, it.preferenceType]) ?? []
    );

    this.properties().forEach((property) => {
      let iconUrl: string;

      const pref = userInteractedProperties.get(property.id);

      if (!pref) {
        iconUrl = property.type === PropertyType.HOUSE
          ? '/assets/icons/house_pin.png'
          : '/assets/icons/apartments_pin.png';
      } else {
        if (pref === PreferenceTypeEnum.LIKE) {
          iconUrl = property.type === PropertyType.HOUSE
            ? '/assets/icons/house_liked_pin.png'
            : '/assets/icons/apartments_liked_pin.png';
        } else {
          iconUrl = property.type === PropertyType.HOUSE
            ? '/assets/icons/house_disliked_pin.png'
            : '/assets/icons/apartments_disliked_pin.png';
        }
      }

      const icon = this.getOrCreateIcon(iconUrl);

      const marker = L.marker([property.latitude, property.longitude], {
        icon,
        title: property.title,
      });

      marker.bindPopup(property.title);

      marker.on('click', () => {
        this.map.flyTo([property.latitude, property.longitude], 17, {
          animate: true,
          duration: 1.4,
        });
        this.selectedProperty.emit(property);
      });

      this.propertyMarkers.push({ marker, property });
      markers.push(marker);
    });

    // Add all markers at once to the cluster group
    this.propertyClusterGroup.addLayers(markers);
  }

  private addMarkersForPerks(): void {
    const markers: L.Marker[] = [];

    this.perks().forEach((perk) => {
      const perkIconUrl = this.#imageService.getImageUrl(perk.perkType.iconImageId);
      const perkIcon = getIcon(perkIconUrl);

      const marker = L.marker([perk.latitude, perk.longitude], {
        icon: perkIcon,
        title: perk.title,
      });

      marker.bindPopup(this.createPerkPopup(perk));

      marker.on('click', () => {
        this.map.flyTo([perk.latitude, perk.longitude], 18, {
          animate: true,
          duration: 1.4,
        });
        this.selectedProperty.emit(undefined);
      });

      this.perkMarkers.push({ marker, perk });
      markers.push(marker);
    });

    this.perkClusterGroup.addLayers(markers);
  }

  private clearPropertyMarkers(): void {
    this.propertyClusterGroup.clearLayers();
    this.propertyMarkers = [];
  }

  private clearPerkMarkers(): void {
    this.perkClusterGroup.clearLayers();
    this.perkMarkers = [];
  }

  private updatePropertyMarkers(): void {
    this.clearPropertyMarkers();
    this.addMarkersForProperties();

    if (this.selectedCircle) {
      const center = this.selectedCircle.getLatLng();
      this.filterMarkersByRadius(center.lat, center.lng, this.userPreferences()?.radius ?? DEFAULT_PREFERENCES_RADIUS);
    }
  }

  private updatePerksMarkers(): void {
    this.clearPerkMarkers();
    this.addMarkersForPerks();

    if (this.selectedCircle) {
      const center = this.selectedCircle.getLatLng();
      this.filterMarkersByRadius(center.lat, center.lng, this.userPreferences()?.radius ?? DEFAULT_PREFERENCES_RADIUS);
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
          <strong>Type:</strong> ${capitilize(perk.perkType.name)}
        </p>

        <p style="margin: 0 0 4px; font-size: 12px; color: #777;">
          📍 ${perk.latitude.toFixed(5)}, ${perk.longitude.toFixed(5)}
        </p>

        ${openingHoursHtml}
      </div>
    `;
  }

  private addCircleFromCoordinates(coordinate: Coordinate): void {
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
        radius: this.userPreferences()?.radius ?? DEFAULT_PREFERENCES_RADIUS,
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
      this.userPreferences()?.radius ?? DEFAULT_PREFERENCES_RADIUS
    );

    this.selectedArea.emit({ center: coordinate, radius: this.userPreferences()?.radius ?? DEFAULT_PREFERENCES_RADIUS });
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
    const centerLatLng = L.latLng(latitude, longitude);

    // Filter properties
    const visiblePropertyMarkers: L.Marker[] = [];
    const hiddenPropertyMarkers: L.Marker[] = [];

    this.propertyMarkers.forEach(({ marker, property }) => {
      const distance = centerLatLng.distanceTo(
        L.latLng(property.latitude, property.longitude)
      );

      if (distance <= radius) {
        visiblePropertyMarkers.push(marker);
      } else {
        hiddenPropertyMarkers.push(marker);
      }
    });

    // Filter perks
    const visiblePerkMarkers: L.Marker[] = [];
    const hiddenPerkMarkers: L.Marker[] = [];

    this.perkMarkers.forEach(({ marker, perk }) => {
      const distance = centerLatLng.distanceTo(
        L.latLng(perk.latitude, perk.longitude)
      );

      if (distance <= radius) {
        visiblePerkMarkers.push(marker);
      } else {
        hiddenPerkMarkers.push(marker);
      }
    });

    // Batch update cluster groups
    this.propertyClusterGroup.clearLayers();
    this.propertyClusterGroup.addLayers(visiblePropertyMarkers);

    this.perkClusterGroup.clearLayers();
    this.perkClusterGroup.addLayers(visiblePerkMarkers);
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

    // Restore all markers
    this.propertyClusterGroup.clearLayers();
    this.propertyClusterGroup.addLayers(this.propertyMarkers.map(pm => pm.marker));

    this.perkClusterGroup.clearLayers();
    this.perkClusterGroup.addLayers(this.perkMarkers.map(pm => pm.marker));

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

  private focusProperty(id: number) {
    const found = this.propertyMarkers.find(pm => pm.property.id === id);
    if (found) {
      this.map.flyTo([found.property.latitude, found.property.longitude], 17, {
        animate: true,
        duration: 1.4,
      });
      found.marker.openPopup();
      this.selectedProperty.emit(found.property);
    }
  }

  private focusPerk(id: number) {
    const found = this.perkMarkers.find(pm => pm.perk.id === id);
    if (found) {
      this.map.flyTo([found.perk.latitude, found.perk.longitude], 17, {
        animate: true,
        duration: 1.4,
      });
      found.marker.openPopup();
      this.selectedProperty.emit(undefined);
    }
  }

  toggleLegend() {
    this.showLegend.update(value => !value);
  }
}
