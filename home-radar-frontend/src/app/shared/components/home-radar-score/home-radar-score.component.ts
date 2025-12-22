import { Component, effect, inject, input } from '@angular/core';
import { SelectedArea } from '../../../interfaces/selected-area.interface';
import { DecimalPipe, NgClass } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';
import { HomeRadarScore } from '../../../interfaces/home-radar-score.interface';
import { CapitalizePipe } from '../../pipes/capitilzie.pipe';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'home-radar-score',
  templateUrl: './home-radar-score.component.html',
  styleUrls: ['./home-radar-score.component.scss'],
  imports: [
    DecimalPipe,
    CapitalizePipe,
    ImageUrlPipe,
    NgClass
  ],
})
export class HomeRadarScoreComponent {
  #propertyService = inject(PropertyService);
  #route = inject(ActivatedRoute);

  area = input<SelectedArea>();

  statistics: HomeRadarScore | null = null;

  showDialog: boolean = false;

  constructor() {
    effect(() => {
      this.statistics = null;
      this.showDialog = (this.area() && this.area()?.radius != 0) ?? false;
    });
  }

  calculateStatistics() {
    const queryParams = this.#route.snapshot.queryParams;
    const filters = {
      title: queryParams['title'] || undefined,
      area: queryParams['area'] || undefined,
      propertyCategory: queryParams['propertyCategory'] || undefined,
      priceMin: queryParams['priceMin'] || undefined,
      priceMax: queryParams['priceMax'] || undefined,
      rooms: queryParams['rooms'] || undefined,
      bedrooms: queryParams['bedrooms'] || undefined,
      bathrooms: queryParams['bathrooms'] || undefined,
      sizeMin: queryParams['sizeMin'] || undefined,
      sizeMax: queryParams['sizeMax'] || undefined,
      yearBuilt: queryParams['yearBuilt'] || undefined,
      parking: queryParams['parking'] ? queryParams['parking'] : undefined,
      balcony: queryParams['balcony'] ? queryParams['balcony'] : undefined,
      elevator: queryParams['elevator'] ? queryParams['elevator'] : undefined,
    };

    const area = this.area();
    if (!area || !area.center || !area.radius) {
      return;
    }

    this.#propertyService
      .calculateCircleScore(area.center, area.radius, filters)
      .subscribe((result) => {
        this.statistics = result;
      });
  }

  getScoreClass(score: number) {
    if (score <= 3) return 'score-red';
    if (score <= 6) return 'score-yellow';
    if (score <= 8) return 'score-dark-green';
    return 'score-bright-green';
  }

  close() {
    this.showDialog = false;
  }
}
