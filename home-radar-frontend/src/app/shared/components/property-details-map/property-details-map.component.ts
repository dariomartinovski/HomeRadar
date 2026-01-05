import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  signal,
} from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import {RouteInfo} from '../../../interfaces/route-info.interface';

@Component({
  selector: 'property-detail-map',
  imports: [CommonModule],
  templateUrl: 'property-details-map.component.html',
  styleUrl: 'property-details-map.component.scss'
})
export class PropertyDetailMapComponent implements AfterViewInit, OnDestroy {
  @Input() property!: Property;
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;
  private propertyMarker!: L.Marker;
  private destinationMarker?: L.Marker;
  private routeLine?: L.Polyline;

  showRouteDialog = signal(false);
  routeInfo = signal<RouteInfo | null>(null);

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
    }).setView([this.property.latitude, this.property.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const propertyIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.propertyMarker = L.marker(
      [this.property.latitude, this.property.longitude],
      { icon: propertyIcon }
    ).addTo(this.map);

    this.propertyMarker.bindPopup(`
      <div style="text-align: center; padding: 4px;">
        <strong>${this.property.title}</strong><br/>
        <small>${this.property.address}</small>
      </div>
    `).openPopup();

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addDestinationAndRoute(e.latlng);
    });
  }

  private async addDestinationAndRoute(latlng: L.LatLng): Promise<void> {
    this.clearRoute(false);

    const destinationIcon = L.divIcon({
      className: 'destination-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    this.destinationMarker = L.marker([latlng.lat, latlng.lng], {
      icon: destinationIcon,
    }).addTo(this.map);

    this.destinationMarker.bindPopup('Destination').openPopup();

    try {
      const route = await this.fetchRoute(
        this.property.latitude,
        this.property.longitude,
        latlng.lat,
        latlng.lng
      );

      if (route) {
        this.routeLine = L.polyline(route.coordinates, {
          color: '#1a73e8',
          weight: 5,
          opacity: 0.8,
        }).addTo(this.map);

        const bounds = L.latLngBounds([
          [this.property.latitude, this.property.longitude],
          [latlng.lat, latlng.lng],
        ]);
        this.map.fitBounds(bounds, { padding: [50, 50] });

        this.routeInfo.set(route);
        this.showRouteDialog.set(true);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
      alert('Failed to calculate route. Please try again.');
    }
  }

  private async fetchRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number
  ): Promise<RouteInfo | null> {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          (coord: [number, number]) => [coord[1], coord[0]] // Convert [lng, lat] to [lat, lng]
        );

        return {
          distance: route.distance,
          duration: route.duration,
          coordinates,
        };
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }

    return null;
  }

  clearRoute(recenter: boolean = false): void {
    if (this.destinationMarker) {
      this.map.removeLayer(this.destinationMarker);
      this.destinationMarker = undefined;
    }

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = undefined;
    }

    this.showRouteDialog.set(false);
    this.routeInfo.set(null);

    if (recenter) {
      this.map.setView([this.property.latitude, this.property.longitude], 15);
    }
  }

  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes} min`;
  }
}
