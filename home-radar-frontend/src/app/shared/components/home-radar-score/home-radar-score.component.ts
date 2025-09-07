import { Component, effect, inject, input } from '@angular/core';
import { SelectedArea } from '../../../interfaces/selected-area.interface';
import { DecimalPipe, NgClass } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';
import { HomeRadarScore } from '../../../interfaces/home-radar-score.interface';
import { CapitilizePipe } from '../../pipes/capitilzie.pipe';
import { PerkIconUrlPipe } from '../../pipes/perk-icon-url.pipe';

@Component({
  selector: 'home-radar-score',
  templateUrl: './home-radar-score.component.html',
  styleUrls: ['./home-radar-score.component.scss'],
  imports: [
    DecimalPipe,
    CapitilizePipe,
    PerkIconUrlPipe,
    NgClass
  ],
})
export class HomeRadarScoreComponent {
  #propertyService = inject(PropertyService);

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
    const area = this.area();
    if (!area || !area.center || !area.radius) {
      return;
    }

    this.#propertyService
      .calculateCircleScore(area.center, area.radius)
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