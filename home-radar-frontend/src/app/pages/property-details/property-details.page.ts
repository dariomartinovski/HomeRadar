import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {Property} from '../../interfaces/property.interface';
import {PropertyService} from '../../core/services/property.service';
import {PropertyCategory} from '../../enums/property-category.enum';

@Component({
  selector: 'property-details',
  templateUrl: './property-details.page.html',
  styleUrl: './property-details.page.scss',
  imports: []
})
export class PropertyDetailsPage implements OnInit {
  property: Property | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService
    // Inject your property service here
    // private propertyService: PropertyService
  ) {}

  ngOnInit(): void {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.loadProperty(+propertyId);
    }
  }

  loadProperty(id: number): void {
    // Replace this with your actual service call
    this.propertyService.findById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.loading = false;
      }
    });

    // Mock data for demonstration
    // setTimeout(() => {
    //   this.property = {
    //     id: id,
    //     title: 'Luxury Downtown Apartment',
    //     latitude: 41.1086,
    //     longitude: 20.8016,
    //     category: PropertyCategory.FOR_SALE,
    //     description: 'Beautiful modern apartment in the heart of the city. Recently renovated with high-end finishes, floor-to-ceiling windows offering stunning city views, and proximity to all amenities. Perfect for professionals or small families looking for comfort and convenience.',
    //     address: '123 Main Street, Downtown',
    //     contactNumber: '+389 70 123 456',
    //     parking: true,
    //     wifi: true,
    //     balcony: true,
    //     squareMeters: 85,
    //     price: 120000,
    //     heating: 'CENTRAL',
    //     type: 'APARTMENT',
    //     floor: 5,
    //     elevator: true,
    //     numberOfRooms: 3,
    //     imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    //   };
    //   this.loading = false;
    // }, 500);
  }

  getCategoryLabel(category: PropertyCategory): string {
    return category === PropertyCategory.FOR_RENT ? 'For Rent' : 'For Sale';
  }

  getImageUrl(property: Property): string {
    return property.imageUrl
      ? property.imageUrl
      : (property.type === 'HOUSE'
        ? 'assets/images/sale_house_small.jpg'
        : 'assets/images/sale_flat_small.jpg');
  }

  goBack(): void {
    this.router.navigate(['/properties']);
  }

  contactOwner(): void {
    if (this.property?.contactNumber) {
      window.location.href = `tel:${this.property.contactNumber}`;
    }
  }

  shareProperty(): void {
    if (navigator.share && this.property) {
      navigator.share({
        title: this.property.title,
        text: this.property.description,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    }
  }
}
