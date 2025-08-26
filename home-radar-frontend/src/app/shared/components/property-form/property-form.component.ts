import {AfterViewInit, Component, ElementRef, EventEmitter, inject, OnInit, Output, ViewChild} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { PropertyType } from '../../../enums/property-type.enum';
import { HeatingType } from '../../../enums/heating-type.enum';
import { PropertyCategory } from '../../../enums/property-category.enum';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import * as L from 'leaflet';

@Component({
  selector: 'property-form',
  templateUrl: './property-form.component.html',
  styleUrls: ['./property-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatIconModule,
    MatAutocompleteModule,
    MatAutocompleteTrigger
  ]
})
export class PropertyFormComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef;

  propertyForm!: FormGroup;
  categories = Object.values(PropertyCategory);
  propertyTypes = Object.values(PropertyType);
  heatingTypes = Object.values(HeatingType);

  @Output() formSubmit = new EventEmitter<any>();

  addressOptions: any[] = [];
  addressInput$ = new Subject<string>();

  private map!: L.Map;
  private marker!: L.Marker;
  private readonly SKOPJE_CENTER: L.LatLngExpression = [42.0024, 21.4361];
  private readonly DEFAULT_ZOOM = 14;
  private readonly geocoder = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1';

  private fb = inject(FormBuilder)
  private http = inject(HttpClient)

  ngOnInit() {
    this.propertyForm = this.fb.group({
      title: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      address: ['', Validators.required],
      contactNumber: ['', Validators.required],
      type: ['', Validators.required],
      squareMeters: ['', [Validators.required, Validators.min(1)]],
      numberOfRooms: ['', [Validators.required, Validators.min(1)]],
      floor: [''],
      heating: ['', Validators.required],
      price: ['', Validators.required],
      parking: [false],
      wifi: [false],
      balcony: [false],
      elevator: [false],
      yearBuilt: [''],
      bedrooms: [''],
      bathrooms: [''],
      imageUrl: [''],
      neighborhood: [''],
      latitude: [42.0024, Validators.required],
      longitude: [21.4361, Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.setupAddressAutocomplete();
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.SKOPJE_CENTER,
      zoom: this.DEFAULT_ZOOM
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    const icon = L.icon({
      iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    this.marker = L.marker(this.SKOPJE_CENTER, {
      draggable: true,
      icon: icon
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.updateMarker(e.latlng);
      this.reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    this.marker.on('dragend', () => {
      const position = this.marker.getLatLng();
      this.reverseGeocode(position.lat, position.lng);
    });

    setTimeout(() => {
      this.map.invalidateSize();
    }, 0);
  }

  private setupAddressAutocomplete(): void {
    this.addressInput$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => this.searchAddress(query))
    ).subscribe(results => {
      this.addressOptions = results;
    });
  }

  onAddressInput(): void {
    const query = this.propertyForm.get('address')?.value;
    if (query && query.length > 3) {
      this.addressInput$.next(query);
    }
  }

  onAddressSelect(option: any): void {
    const lat = parseFloat(option.lat);
    const lon = parseFloat(option.lon);
    this.updateMarker([lat, lon]);
    this.map.setView([lat, lon], 16);
  }

  private searchAddress(query: string) {
    return this.http.get<any[]>(`${this.geocoder}&q=${encodeURIComponent(query)}`);
  }

  private reverseGeocode(lat: number, lng: number): void {
    this.http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .subscribe({
        next: (data) => {
          this.propertyForm.patchValue({
            address: data.display_name,
            latitude: lat,
            longitude: lng
          });
        },
        error: (err) => console.error('Reverse geocoding error:', err)
      });
  }

  private updateMarker(latlng: L.LatLngExpression): void {
    this.marker.setLatLng(latlng);
    const position = latlng as L.LatLng;
    this.propertyForm.patchValue({
      latitude: position.lat,
      longitude: position.lng
    });
  }

  onSubmit(): void {
    if (this.propertyForm.valid) {
      this.formSubmit.emit(this.propertyForm.value);
    }
  }
}
