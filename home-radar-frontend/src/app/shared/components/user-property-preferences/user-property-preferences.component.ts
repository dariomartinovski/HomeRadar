import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertySimple } from '../../../interfaces/property-simple.interface';
import { UserService } from '../../../core/services/user.service';
import {PropertyType} from '../../../enums/property-type.enum';

@Component({
  selector: 'user-property-preferences',
  templateUrl: './user-property-preferences.component.html',
  styleUrl: './user-property-preferences.component.scss',
  imports: [CommonModule, RouterLink],
})
export class UserPropertyPreferencesComponent implements OnInit {
  #userService = inject(UserService);

  activeTab: 'liked' | 'disliked' = 'liked';
  likedProperties: PropertySimple[] = [];
  dislikedProperties: PropertySimple[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadProperties();
  }

  private loadProperties(): void {
    this.loading = true;
    this.#userService.getPreferredPropertiesSummaries().subscribe({
      next: (data) => {
        this.likedProperties = data.LIKE || [];
        this.dislikedProperties = data.DISLIKE || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: 'liked' | 'disliked'): void {
    this.activeTab = tab;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  }

  protected readonly PropertyType = PropertyType;
}
