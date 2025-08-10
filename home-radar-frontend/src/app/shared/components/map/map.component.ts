import {
  Component,
  Input,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Property } from '../../../interfaces/property.interface';
import { SelectedArea } from '../../../interfaces/selected-area.interface';
import * as L from 'leaflet';
import { Coordinate } from '../../../interfaces/coordinate.interface';

@Component({
  selector: 'map-component',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements AfterViewInit, OnDestroy {
  @Input() properties: Property[] = [];
  @Input() radius: number = 500;

  @Output() selectedProperty = new EventEmitter<Property>();
  @Output() selectedArea = new EventEmitter<SelectedArea>();

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  private map!: L.Map;
  private markers: { marker: L.Marker; property: Property }[] = [];
  private selectedCircle!: L.Circle;
  private selectedCenterMarker!: L.Marker;

  ngAfterViewInit(): void {
    this.initMap();
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

    this.addMarkersForProperties();
  }

  private addMarkersForProperties() {
    //TODO there are red, orange, yellow, blue, black, gold, violet, grey icons
    //just change the color in the url at the end
    this.properties.forEach((property) => {
      const greenIcon = new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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

      this.markers.push({ marker, property });
    });
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
        radius: this.radius,
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
      this.radius
    );

    this.selectedArea.emit({ center: coordinate, radius: this.radius });
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
    this.markers.forEach(({ marker, property }) => {
      const distance = this.map.distance(
        L.latLng(latitude, longitude),
        L.latLng(property.latitude, property.longitude)
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

    this.markers.forEach(({ marker }) => {
      if (!this.map.hasLayer(marker)) {
        marker.addTo(this.map);
      }
    });

    this.selectedArea.emit({ center: undefined!, radius: 0 });
    this.selectedProperty.emit(undefined);
  }
}
