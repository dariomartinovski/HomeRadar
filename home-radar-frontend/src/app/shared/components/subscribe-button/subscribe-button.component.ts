import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'subscribe-button',
  templateUrl: './subscribe-button.component.html',
  styleUrls: ['./subscribe-button.component.scss']
})
export class SubscribeButtonComponent {
  @Output() subscribe = new EventEmitter<void>();

  onClick() {
    this.subscribe.emit();
  }
}
