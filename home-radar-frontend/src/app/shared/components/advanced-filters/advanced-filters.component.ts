import { Component, inject, output, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'advanced-filters',
  templateUrl: './advanced-filters.component.html',
  styleUrls: ['./advanced-filters.component.scss'],
  imports: [MatCheckbox, MatInputModule, MatButtonModule, ReactiveFormsModule, MatSelectModule, MatOptionModule],
})
export class AdvancedFiltersComponent implements OnInit {
  #formBuilder = inject(FormBuilder);
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  onApplyFilters = output<void>();

  private readonly initialFilters = {
    priceMin: null,
    priceMax: null,
    propertyCategory: null,
    rooms: null,
    bedrooms: null,
    bathrooms: null,
    size: null,
    yearBuilt: null,
    parking: false,
    balcony: false,
    elevator: false,
  };

  advancedFiltersForm = this.#formBuilder.group(this.initialFilters);

  ngOnInit() {
    const queryParams = this.#route.snapshot.queryParams;

    const patch: Record<string, any> = {};

    Object.keys(this.initialFilters).forEach((key) => {
      if (queryParams[key] !== undefined) {
        if (
          typeof this.initialFilters[
            key as keyof typeof this.initialFilters
          ] === 'boolean'
        ) {
          patch[key] = queryParams[key] === 'true';
        } else {
          patch[key] = queryParams[key];
        }
      }
    });

    this.advancedFiltersForm.patchValue(patch);
  }

  applyFilters() {
    const filters = this.advancedFiltersForm.value;

    const queryParams: any = {};
    (Object.keys(filters) as (keyof typeof filters)[]).forEach((key) => {
      const value = filters[key];
      if (value !== null && value !== false) {
        queryParams[key] = value;
      }
    });

    this.#router
      .navigate([], {
        relativeTo: this.#route,
        queryParams,
        queryParamsHandling: 'merge',
      })
      .then(() => {
        this.onApplyFilters.emit();
      });
  }

  resetFilters() {
    this.advancedFiltersForm.reset(this.initialFilters);
    this.#router
      .navigate([], {
        relativeTo: this.#route,
        queryParams: {},
      })
      .then(() => {
        this.onApplyFilters.emit();
      });
  }
}
