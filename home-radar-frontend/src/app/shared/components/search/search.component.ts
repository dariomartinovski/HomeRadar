import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    FormsModule,
    MatIcon]
})
export class SearchComponent {
  #router = inject(Router);

  areas = input<string[]>([]);
  onSearch = output<void>();

  title = '';
  area = '';

  onSubmit() {
    this.#router.navigate([], {
      queryParams: {
        title: this.title || null,
        area: this.area || null
      },
      queryParamsHandling: 'merge'
    }).then(() => {
      this.onSearch.emit();
    });
  }
}