import { Component, EventEmitter, inject, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { RegisterRequest } from '../../interfaces/auth/register-request';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  @Output() registrationSuccess = new EventEmitter<void>();
  registerForm: FormGroup;
  service = inject(AuthService);
  router = inject(Router);
  submitted: boolean = false;
  errorMessage: string | null = null;
  hidePassword: boolean = true;
  hideRepeatPassword: boolean = true;

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phoneNumber: [
          '',
          [Validators.required, this.phoneNumberValidator.bind(this)],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator.bind(this),
          ],
        ],
        repeatPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator.bind(this) }
    );
  }

  passwordValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const errors: any = {};

    if (value.length < 8) {
      errors.minLength = true;
    }
    if (!/[A-Z]/.test(value)) {
      errors.missingUpper = true;
    }
    if (!/[a-z]/.test(value)) {
      errors.missingLower = true;
    }
    if (!/[0-9]/.test(value)) {
      errors.missingNumber = true;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.missingSpecial = true;
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const repeatPassword = formGroup.get('repeatPassword')?.value;
    return password === repeatPassword ? null : { passwordMismatch: true };
  }

  formatPhoneNumber(event: any) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^\d+]/g, '');
    let formattedValue = '';

    if (value.startsWith('+389') && value.length > 4) {
      formattedValue = '+389' + value.substring(4, 6);
      if (value.length > 6) {
        formattedValue += ' ' + value.substring(6, 9);
      }
      if (value.length > 9) {
        formattedValue += ' ' + value.substring(9, 12);
      }
    } else if (value.startsWith('07') && value.length <= 9) {
      formattedValue = value.substring(0, 3);
      if (value.length > 3) {
        formattedValue += ' ' + value.substring(3, 6);
      }
      if (value.length > 6) {
        formattedValue += ' ' + value.substring(6, 9);
      }
    } else {
      formattedValue = value;
    }

    input.value = formattedValue;
    this.registerForm
      .get('phoneNumber')
      ?.setValue(formattedValue, { emitEvent: false });
  }

  phoneNumberValidator(control: any) {
    const value = control.value;
    if (!value) return null;

    const cleanedValue = value.replace(/\D/g, '');

    if (cleanedValue.startsWith('07')) {
      return cleanedValue.length === 9 ? null : { invalidPhoneNumber: true };
    }

    if (cleanedValue.startsWith('3897')) {
      return cleanedValue.length === 11 ? null : { invalidPhoneNumber: true };
    }

    return { invalidPhoneNumber: true };
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null;

    if (this.registerForm.invalid) {
      return;
    }

    const rawPhoneNumber = this.registerForm.value.phoneNumber.replace(
      /\D/g,
      ''
    );
    if (rawPhoneNumber.startsWith('07')) {
      this.registerForm.value.phoneNumber = rawPhoneNumber;
    } else if (rawPhoneNumber.startsWith('389')) {
      this.registerForm.value.phoneNumber = '+' + rawPhoneNumber;
    }

    const registerRequest: RegisterRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      phoneNumber: this.registerForm.value.phoneNumber,
    };
    this.service.register(registerRequest).subscribe({
      next: (response) => {
        this.registrationSuccess.emit();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        if (error.error && error.error.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
    });
  }

  get passwordStrength(): string {
    const password = this.registerForm.get('password')?.value;
    if (!password) return 'weak';

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength =
      (password.length >= 8 ? 1 : 0) +
      (hasUpper ? 1 : 0) +
      (hasLower ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecial ? 1 : 0);

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }
}
