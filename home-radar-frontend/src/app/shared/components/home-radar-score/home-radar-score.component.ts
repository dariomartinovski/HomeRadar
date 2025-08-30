import { Component, effect, inject, input, signal } from '@angular/core';
import { SelectedArea } from '../../../interfaces/selected-area.interface';
import { JsonPipe, NgClass } from '@angular/common';
import { PropertyService } from '../../../core/services/property.service';

@Component({
  selector: 'home-radar-score',
  templateUrl: './home-radar-score.component.html',
  styleUrls: ['./home-radar-score.component.scss'],
  imports: [NgClass],
})
export class HomeRadarScoreComponent {
  #propertyService = inject(PropertyService);

  area = input<SelectedArea>();

  score: number | null = null;
  showDialog: boolean = false;

  constructor() {
    effect(() => {
      this.score = null;
      this.showDialog = (this.area() && this.area()?.radius != 0) ?? false;
    });
  }

  calculateScore() {
    console.log("whats going on")
    const area = this.area();
    if (!area || !area.center || !area.radius) {
      return;
    }

    this.#propertyService
      .calculateCircleScore(area.center, area.radius)
      .subscribe((result) => console.log("Score is ?", result));
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
