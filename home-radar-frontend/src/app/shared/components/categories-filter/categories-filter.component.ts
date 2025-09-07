import { Component, inject, input, OnInit, output } from '@angular/core';
import { PerkType } from '../../../enums/perk-type.enum';
import { PerkIconUrlPipe } from '../../pipes/perk-icon-url.pipe';
import { CapitalizePipe } from '../../pipes/capitilzie.pipe';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss'],
  imports: [PerkIconUrlPipe, CapitalizePipe, MatIconModule],
})
export class CategoriesFilterComponent implements OnInit {
  #route = inject(ActivatedRoute);
  
  categories = input<PerkType[]>([]);
  expanded = input<boolean>(false);

  selectedCategories = new Set<PerkType>();

  selectionChange = output<PerkType[]>();

  ngOnInit(): void {
    const { category } = this.#route.snapshot.queryParams;
    let preselected: string[] = [];

    if (category) {
      preselected = category.split(",");
      console.log("preselcted is ", preselected)
    }

    preselected.forEach((c) => {
      if (Object.values(PerkType).includes(c as PerkType)) {
        this.selectedCategories.add(c as PerkType);
      }
    });
  }

  toggleCategory(perkType: PerkType, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedCategories.add(perkType);
    } else {
      this.selectedCategories.delete(perkType);
    }
    this.selectionChange.emit(Array.from(this.selectedCategories));
  }

   isChecked(perkType: PerkType): boolean {
    return this.selectedCategories.has(perkType);
  }
}
