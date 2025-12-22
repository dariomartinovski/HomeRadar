import {
  Component,
  effect,
  EnvironmentInjector,
  inject,
  input,
  OnInit,
  output,
  runInInjectionContext
} from '@angular/core';
import { PerkType } from '../../../interfaces/perk-type.interface';
import { ImageUrlPipe } from '../../pipes/image-url.pipe';
import { CapitalizePipe } from '../../pipes/capitilzie.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss'],
  imports: [ImageUrlPipe, CapitalizePipe, MatIconModule],
})
export class CategoriesFilterComponent implements OnInit {
  #route = inject(ActivatedRoute);
  #injector = inject(EnvironmentInjector);

  categories = input<PerkType[]>([]);
  expanded = input<boolean>(false);

  selectedCategories = new Set<String>();

  selectionChange = output<String[]>();

  ngOnInit(): void {
    runInInjectionContext(this.#injector, () => {
      effect(() => {
        if (!this.categories()) return;

        const { category } = this.#route.snapshot.queryParams;
        let preselected: string[] = [];

        if (category) {
          preselected = category.split(",");
        }

        preselected.forEach((preselectedCategory) => {
          const flatCategories = this.categories().map(c => c.name);
          if (flatCategories.includes(preselectedCategory))
            this.selectedCategories.add(preselectedCategory);
        });
      });
    });
  }

  toggleCategory(perkTypeName: String, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedCategories.add(perkTypeName);
    } else {
      this.selectedCategories.delete(perkTypeName);
    }
    this.selectionChange.emit(Array.from(this.selectedCategories));
  }

   isChecked(perkType: String): boolean {
    return this.selectedCategories.has(perkType);
  }
}
