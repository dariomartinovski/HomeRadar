import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Property } from '../../interfaces/property.interface';
import { PropertyService } from '../../core/services/property.service';
import { PropertyCategory } from '../../enums/property-category.enum';
import { CapitalizePipe } from '../../shared/pipes/capitilzie.pipe';
import { UserService } from '../../core/services/user.service';
import { PreferenceTypeEnum } from '../../enums/preference-type.enum';
import { User } from '../../interfaces/user.interface';
import {PropertyDetailMapComponent} from '../../shared/components/property-details-map/property-details-map.component';

@Component({
  selector: 'property-details',
  templateUrl: './property-details.page.html',
  styleUrl: './property-details.page.scss',
  imports: [
    CommonModule,
    CapitalizePipe,
    PropertyDetailMapComponent
  ]
})
export class PropertyDetailsPage implements OnInit {
  property: Property | null = null;
  loading = true;
  userPreference: PreferenceTypeEnum | null = null;
  savingPreference = false;
  isLoggedIn = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.isLoggedIn = !!this.userService.getCurrentUser();

    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.loadProperty(+propertyId);
    }
  }

  loadProperty(id: number): void {
    this.propertyService.findById(id).subscribe({
      next: (property) => {
        this.property = property;
        this.loading = false;
        this.checkUserPreference();
      },
      error: (error) => {
        console.error('Error loading property:', error);
        this.loading = false;
      }
    });
  }

  checkUserPreference(): void {
    if (!this.isLoggedIn) {
      return;
    }

    const currentUser: User | null = this.userService.getCurrentUser();
    if (currentUser && this.property) {
      const preference = currentUser.propertyPreferences?.find(
        (p: any) => p.propertyId === this.property?.id
      );
      this.userPreference = preference?.preferenceType || null;
    }
  }

  setPreference(preference: PreferenceTypeEnum): void {
    if (!this.property || this.savingPreference) return;

    this.savingPreference = true;

    this.userService.setUserPropertyPreference(this.property.id, preference).subscribe({
      next: (updatedUser) => {
        if (this.userPreference === preference) {
          this.userPreference = null;
        } else {
          this.userPreference = preference;
        }
        this.savingPreference = false;
        this.userService.setCurrentUser(updatedUser);
      },
      error: (error) => {
        console.error('Error saving preference:', error);
        this.savingPreference = false;
      }
    });
  }

  likeProperty(): void {
    this.setPreference(PreferenceTypeEnum.LIKE);
  }

  dislikeProperty(): void {
    this.setPreference(PreferenceTypeEnum.DISLIKE);
  }

  isLiked(): boolean {
    return this.userPreference === PreferenceTypeEnum.LIKE;
  }

  isDisliked(): boolean {
    return this.userPreference === PreferenceTypeEnum.DISLIKE;
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
