import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    FormsModule,
    MatIcon]
})
export class SearchComponent implements OnInit {
  #router = inject(Router);
  #route = inject(ActivatedRoute);

  areas = input<string[]>([]);
  onSearch = output<void>();

  title = '';
  area = '';

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
    });
  }
}