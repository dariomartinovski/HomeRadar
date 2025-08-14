import { Component, effect, input, signal } from "@angular/core";
import { PerkType } from "../../../enums/perk-type.enum";
import { PerkIconUrlPipe } from "../../pipes/perk-icon-url.pipe";
import { CapitilizePipe } from "../../pipes/capitilzie.pipe";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: 'categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss'],
  imports: [PerkIconUrlPipe, CapitilizePipe, MatIconModule],
})
export class CategoriesFilterComponent {
    categories = input<PerkType[]>([]);
    expanded = signal(false);

    // constructor(){
    //     effect(() => {
    //         console.log("the types are ", this.categories);
    //     })
    // }

    toggle() {
        this.expanded.set(!this.expanded());
    }
}
