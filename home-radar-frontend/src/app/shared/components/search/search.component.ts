import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { AdvancedFiltersComponent } from '../advanced-filters/advanced-filters.component';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    FormsModule,
    MatIcon,
    AdvancedFiltersComponent
  ]
})
export class SearchComponent implements OnInit {
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  areas = input<string[]>([]);
  onSearch = output<void>();

  title = '';
  area = '';
  isAdvancedFiltersOpen = signal<boolean>(false);

  ngOnInit() {
    const queryParams = this.#route.snapshot.queryParams;
    this.title = queryParams['title'] || '';
    this.area = queryParams['area'] || '';
  }

  onSubmit() {
    this.#router.navigate([], {
      queryParams: {
        title: this.title || null,
        area: this.area || null
      },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.onSearch.emit();
      this.isAdvancedFiltersOpen.set(false);
    });
  }

  onToggleAdvancedFilters() {
    this.isAdvancedFiltersOpen.set(!this.isAdvancedFiltersOpen());
  }

  onApplyAdvancedFilters() {
    this.isAdvancedFiltersOpen.set(false);
    this.onSearch.emit();
  }
}