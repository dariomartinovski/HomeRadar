import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'forbidden',
  templateUrl: './forbidden.page.html',
  styleUrls: ['./forbidden.page.scss']
})
export class ForbiddenPage {
  constructor(private router: Router) {}

  goToHome(): void {
    this.router.navigate(['/']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
