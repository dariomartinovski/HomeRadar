import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import * as L from 'leaflet';
import { PerkService } from '../../../core/services/perks.service';
import { PerkTypeService } from '../../../core/services/perk-type.service';
import { PerkType } from '../../../interfaces/perk-type.interface';
import { CapitalizePipe } from '../../pipes/capitilzie.pipe';

@Component({
  selector: 'perk-form',
  templateUrl: './perk-form.component.html',
  styleUrls: ['./perk-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CapitalizePipe
  ]
})
export class CreatePerkComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  #fb = inject(FormBuilder);
  #http = inject(HttpClient);
  #perkService = inject(PerkService);
  #perkTypeService = inject(PerkTypeService);

  perkForm!: FormGroup;
  perkTypes: PerkType[] = [];
  loading = false;
  loadingPerkTypes = true;
  errorMessage = '';
  successMessage = '';

  addressOptions: any[] = [];
  addressInput$ = new Subject<string>();
  showAddressDropdown = false;

  private map!: L.Map;
  private marker!: L.Marker;
  private readonly DEFAULT_CENTER: L.LatLngExpression = [41.1172, 20.8019];
  private readonly DEFAULT_ZOOM = 14;
  private readonly geocoder = 'https://nominatim.openstreetmap.org/search?format=json&addressdetails=1';

  ngOnInit(): void {
    this.initForm();
    this.loadPerkTypes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initMap();
      this.setupAddressAutocomplete();
    }, 100);
  }

  initForm(): void {
    this.perkForm = this.#fb.group({
      title: ['', [Validators.required]],
      perkTypeId: [null, [Validators.required]],
      address: ['', [Validators.required]],
      latitude: [41.1172, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [20.8019, [Validators.required, Validators.min(-180), Validators.max(180)]],
      openingHours: ['']
    });
  }

  private initMap(): void {
    if (!this.mapContainer) {
      console.error('Map container not found');
      return;
    }

    try {
      this.map = L.map(this.mapContainer.nativeElement, {
        center: this.DEFAULT_CENTER,
        zoom: this.DEFAULT_ZOOM
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(this.map);

      const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
      const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
      const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

      const icon = L.icon({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      L.Marker.prototype.options.icon = icon;

      this.marker = L.marker(this.DEFAULT_CENTER, {
        draggable: true
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
      }, 100);
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private setupAddressAutocomplete(): void {
    this.addressInput$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap(query => this.searchAddress(query))
    ).subscribe(results => {
      this.addressOptions = results;
      this.showAddressDropdown = results.length > 0;
    });
  }

  onAddressInput(): void {
    const query = this.perkForm.get('address')?.value;
    if (query && query.length > 3) {
      this.addressInput$.next(query);
    } else {
      this.showAddressDropdown = false;
    }
  }

  onAddressSelect(option: any): void {
    const lat = parseFloat(option.lat);
    const lon = parseFloat(option.lon);
    const pos = L.latLng(lat, lon);

    this.perkForm.patchValue({ address: option.display_name });
    this.updateMarker([lat, lon]);
    this.map.setView(pos, 16);
    this.showAddressDropdown = false;
  }

  private searchAddress(query: string) {
    return this.#http.get<any[]>(`${this.geocoder}&q=${encodeURIComponent(query)}`);
  }

  private reverseGeocode(lat: number, lng: number): void {
    this.#http.get<any>(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .subscribe({
        next: (data) => {
          this.perkForm.patchValue({
            address: data.display_name,
            latitude: lat,
            longitude: lng
          });
        },
        error: (err) => console.error('Reverse geocoding error:', err)
      });
  }

  private updateMarker(latlng: L.LatLngExpression): void {
    const pos = L.latLng(latlng);
    this.marker.setLatLng(latlng);
    this.perkForm.patchValue({
      latitude: pos.lat,
      longitude: pos.lng
    });
  }

  loadPerkTypes(): void {
    this.#perkTypeService.getAllPerkTypes().subscribe({
      next: (types) => {
        this.perkTypes = types;
        this.loadingPerkTypes = false;
      },
      error: (error) => {
        console.error('Error loading perk types:', error);
        this.errorMessage = 'Failed to load perk types';
        this.loadingPerkTypes = false;
      }
    });
  }

  onSubmit(): void {
    if (this.perkForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      this.markFormGroupTouched(this.perkForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.perkForm.value;
    const request = {
      title: formValue.title,
      perkTypeId: formValue.perkTypeId,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      ...(formValue.openingHours && { openingHours: formValue.openingHours })
    };

    this.#perkService.createPerk(request).subscribe({
      next: (response) => {
        console.log('Created perk:', response);
        this.successMessage = 'Perk created successfully!';
        this.perkForm.reset({
          title: '',
          perkTypeId: null,
          address: '',
          latitude: 41.1172,
          longitude: 20.8019,
          openingHours: ''
        });
        this.marker.setLatLng(this.DEFAULT_CENTER);
        this.map.setView(this.DEFAULT_CENTER, this.DEFAULT_ZOOM);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating perk:', error);
        this.errorMessage = 'Failed to create perk. Please try again.';
        this.loading = false;
      }
    });
  }

  onReset(): void {
    this.perkForm.reset({
      title: '',
      perkTypeId: null,
      address: '',
      latitude: 41.1172,
      longitude: 20.8019,
      openingHours: ''
    });
    if (this.marker && this.map) {
      this.marker.setLatLng(this.DEFAULT_CENTER);
      this.map.setView(this.DEFAULT_CENTER, this.DEFAULT_ZOOM);
    }
    this.errorMessage = '';
    this.successMessage = '';
    this.showAddressDropdown = false;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }
}
