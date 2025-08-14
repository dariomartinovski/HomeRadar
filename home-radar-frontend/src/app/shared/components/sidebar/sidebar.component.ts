import { Component, input, signal } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { CapitilizePipe } from "../../pipes/capitilzie.pipe";
import { PerkType } from "../../../enums/perk-type.enum";
import { CategoriesFilterComponent } from "../categories-filter/categories-filter.component";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  imports: [
    CategoriesFilterComponent,
    MatIconModule,
    RouterLink]
})
export class SidebarComponent {
    categories = input<PerkType[]>([]);
    expanded = signal(false);

    toggle() {
        this.expanded.set(!this.expanded());
    }
}