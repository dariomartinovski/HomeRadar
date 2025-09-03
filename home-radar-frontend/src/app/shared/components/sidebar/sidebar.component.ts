import { Component, inject, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PerkType } from '../../../enums/perk-type.enum';
import { CategoriesFilterComponent } from '../categories-filter/categories-filter.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../../interfaces/user.interface';

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [CategoriesFilterComponent, MatIconModule, RouterLink],
})
export class SidebarComponent {
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  categories = input<PerkType[]>([]);
  user = input<User | null>();
  expanded = signal(false);
  onCategoryChange = output<void>();

  selectedCategories: PerkType[] = [];

  toggle() {
    this.expanded.set(!this.expanded());
  }

  onCategoriesSelected(selected: PerkType[]) {
    this.selectedCategories = selected;

    this.#router.navigate([], {
      relativeTo: this.#route,
      queryParams: {
        category: this.selectedCategories.join(',') || null,
      },
      queryParamsHandling: 'merge',
    }).then(() => {
      this.onCategoryChange.emit();
    });;
  }
}
