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

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  coordinates: [number, number][];
}

@Component({
  selector: 'property-detail-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-wrapper">
      <div #mapContainer class="map-container"></div>

      @if (showRouteDialog()) {
        <div class="route-dialog">
          <div class="route-dialog-content">
            <button class="close-btn" (click)="clearRoute()">✕</button>
            <h3>Route Information</h3>
            <div class="route-info">
              <div class="info-row">
                <span class="label">Distance:</span>
                <span class="value">{{ formatDistance(routeInfo()?.distance || 0) }}</span>
              </div>
              <div class="info-row">
                <span class="label">ETA:</span>
                <span class="value">{{ formatDuration(routeInfo()?.duration || 0) }}</span>
              </div>
            </div>
            <div class="route-actions">
              <button class="action-btn primary" (click)="clearRoute()">Clear Route</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .map-wrapper {
      position: relative;
      width: 100%;
      height: 500px;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .map-container {
      width: 100%;
      height: 100%;
    }

    .route-dialog {
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 1000;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      min-width: 200px;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .route-dialog-content {
      padding: 12px 16px;
      position: relative;
    }

    .close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      background: none;
      border: none;
      font-size: 16px;
      color: #666;
      cursor: pointer;
      padding: 2px 6px;
      line-height: 1;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: #333;
    }

    .route-dialog h3 {
      margin: 0 0 10px 0;
      font-size: 15px;
      color: #333;
      font-weight: 600;
      padding-right: 20px;
    }

    .route-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 10px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #666;
      font-size: 13px;
    }

    .value {
      font-weight: 600;
      color: #2c3e50;
      font-size: 14px;
    }

    .route-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      flex: 1;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn.primary {
      background: #e74c3c;
      color: white;
    }

    .action-btn.primary:hover {
      background: #c0392b;
    }

    :host ::ng-deep .leaflet-popup-content-wrapper {
      border-radius: 8px;
      padding: 4px;
    }

    :host ::ng-deep .leaflet-popup-content {
      margin: 8px 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    :host ::ng-deep .destination-marker {
      background: #3498db;
      border: 3px solid white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }
  `]
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
    // Initialize map centered on the property
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
    }).setView([this.property.latitude, this.property.longitude], 15);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // Add property marker
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

    // Add click event for routing
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.addDestinationAndRoute(e.latlng);
    });
  }

  private async addDestinationAndRoute(latlng: L.LatLng): Promise<void> {
    // Clear previous route and marker (but don't re-center)
    this.clearRoute(false);

    // Add destination marker
    const destinationIcon = L.divIcon({
      className: 'destination-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    this.destinationMarker = L.marker([latlng.lat, latlng.lng], {
      icon: destinationIcon,
    }).addTo(this.map);

    this.destinationMarker.bindPopup('Destination').openPopup();

    // Fetch route from OSRM (Open Source Routing Machine)
    try {
      const route = await this.fetchRoute(
        this.property.latitude,
        this.property.longitude,
        latlng.lat,
        latlng.lng
      );

      if (route) {
        // Draw route line with Google Maps style deep blue
        this.routeLine = L.polyline(route.coordinates, {
          color: '#1a73e8',
          weight: 5,
          opacity: 0.8,
        }).addTo(this.map);

        // Fit map to show entire route
        const bounds = L.latLngBounds([
          [this.property.latitude, this.property.longitude],
          [latlng.lat, latlng.lng],
        ]);
        this.map.fitBounds(bounds, { padding: [50, 50] });

        // Show route info
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

    // Only re-center if explicitly requested (not used by default)
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
