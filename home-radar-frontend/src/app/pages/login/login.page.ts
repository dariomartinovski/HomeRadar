import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationRequest } from '../../interfaces/auth/authentication-request';
import { LoginResponse } from '../../interfaces/auth/login-response';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  service = inject(AuthService);
  router = inject(Router);
  #userService = inject(UserService);
  #authService = inject(AuthService)

  errorMessage: boolean = false;
  submitted = false;
  hidePassword = true;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.loginForm.valueChanges.subscribe(() => {
        if (this.errorMessage) {
          this.errorMessage = false;
        }
      });
    this.#authService.logout()
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = false;

    if (this.loginForm.invalid) return;

    const formValue = this.loginForm.value;

    const authRequest: AuthenticationRequest = {
      email: formValue.email,
      password: formValue.password,
    };

    this.service.login(authRequest).subscribe((response: LoginResponse) =>{
      if (response.error) {
        this.errorMessage = true;
      }
      if (response.token) {
        this.#userService.getUserDetails().subscribe((user) => {
          this.#userService.setCurrentUser(user);
          this.router.navigate(['/']);
        });
      }
      },
    );
  }
}
