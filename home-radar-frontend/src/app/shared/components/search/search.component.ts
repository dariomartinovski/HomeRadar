import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  imports: [
    MatIconModule
  ]
})
export class SearchComponent {

  onSubmit() {
    console.log("Submit button clicked");
  }
}