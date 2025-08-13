import { Component, effect, input } from "@angular/core";
import { PerkType } from "../../../enums/perk-type.enum";
import { PerkIconUrlPipe } from "../../pipes/perk-icon-url.pipe";

@Component({
  selector: 'categories-filter',
  templateUrl: './categories-filter.component.html',
  styleUrls: ['./categories-filter.component.scss'],
  imports: [PerkIconUrlPipe],
})
export class CategoriesFilterComponent {
    categories = input<PerkType[]>([]);

    constructor(){
        effect(() => {
            console.log("the types are ", this.categories);
        })
    }
}
