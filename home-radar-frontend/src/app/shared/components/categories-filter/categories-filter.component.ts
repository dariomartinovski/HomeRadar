import { Component, input, output } from '@angular/core';
import { PerkType } from '../../../enums/perk-type.enum';
import { PerkIconUrlPipe } from '../../pipes/perk-icon-url.pipe';
import { CapitilizePipe } from '../../pipes/capitilzie.pipe';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss'],
  imports: [PerkIconUrlPipe, CapitilizePipe, MatIconModule],
})
export class CategoriesFilterComponent {
  categories = input<PerkType[]>([]);
  expanded = input<boolean>(false);

  selectedCategories = new Set<PerkType>();

  selectionChange = output<PerkType[]>();

  toggleCategory(perkType: PerkType, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedCategories.add(perkType);
    } else {
      this.selectedCategories.delete(perkType);
    }
    this.selectionChange.emit(Array.from(this.selectedCategories));
  }
}
