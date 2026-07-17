import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ErrorType } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly messageService: MessageService,
    private readonly errorHandlerService: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.maxLength(100)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(256)]],
        phoneNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?:\+20|0020|0)?1[0125][0-9]{8}$/)
          ]
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordStrengthValidator()
          ]
        ],
        confirmPassword: ['', [Validators.required]]
      },
      {
        validators: this.passwordMatchValidator
      }
    );

    // Re-validate confirmPassword when password changes
    this.registerForm.get('password')?.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  // Password strength validation logic matching backend requirements
  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUppercase = /[A-Z]/.test(value);
      const hasLowercase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecial = /[^A-Za-z0-9]/.test(value);

      const errors: any = {};
      if (value.length < 8) errors.minLength = true;
      if (!hasUppercase) errors.noUppercase = true;
      if (!hasLowercase) errors.noLowercase = true;
      if (!hasNumeric) errors.noNumeric = true;
      if (!hasSpecial) errors.noSpecial = true;

      return Object.keys(errors).length > 0 ? { strength: errors } : null;
    };
  }

  // Password confirmation check matching backend requirements
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (!password || !confirmPassword) return null;
    if (!confirmPassword.value) return null; // Let required validator handle it first

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      const errors = confirmPassword.errors;
      if (errors) {
        delete errors['mismatch'];
        confirmPassword.setErrors(Object.keys(errors).length > 0 ? errors : null);
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Check Form Details',
        detail: 'Oops! Some details need your attention. Please check the fields in red.'
      });
      return;
    }

    this.isLoading = true;
    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Account registered successfully!'
        });

        // Save userId in local storage as requested
        if (typeof window !== 'undefined') {
          localStorage.setItem('userId', res.userId);
        }

        // Navigate to verify otp page
        setTimeout(() => {
          this.router.navigate(['/auth/verify-otp']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        try {
          this.isLoading = false;

          // Standardize raw error into typed ParsedError model
          const parsed = this.errorHandlerService.parseError(err);

          if (parsed.errors) {
            if (parsed.type === ErrorType.UserError) {
              // Schema 2: Conflict / User mistakes (e.g. email already exists)
              const errorCode = parsed.errors.code || '';
              const errorMessage = parsed.errors.message;

              if (errorCode.includes('Email')) {
                this.registerForm.get('email')?.setErrors({ serverError: errorMessage });
              } else if (errorCode.includes('Phone')) {
                this.registerForm.get('phoneNumber')?.setErrors({ serverError: errorMessage });
              }
            } else if (parsed.type === ErrorType.ValidationError) {
              // Schema 1: Validation
              const validationErrors = parsed.errors;
              Object.keys(validationErrors).forEach((field) => {
                const camelField = field.charAt(0).toLowerCase() + field.slice(1);
                const control = this.registerForm.get(camelField);

                if (control) {
                  const messages = validationErrors[field];
                  const errorMsg = Array.isArray(messages) ? messages[0] : messages;
                  // Set custom backend validation error on control
                  control.setErrors({ serverError: errorMsg });
                }
              });
            }
          }

          // Delegate toast messaging and console logging to ErrorHandlerService
          this.errorHandlerService.handleError(err, 'Registration Failed');
        } catch (fatalErr) {
          // Safeguard: Ensure button transitions out of loading state even on fatal js exceptions
          this.isLoading = false;
          console.error('[RegisterFatalError]', fatalErr);
        }
      }
    });
  }

  // Helper getters to simplify HTML template error checking
  get f() {
    return this.registerForm.controls;
  }

  passwordValue(): string {
    return this.registerForm.get('password')?.value || '';
  }

  checkPasswordRule(rule: 'length' | 'upper' | 'lower' | 'digit' | 'special'): boolean {
    const val = this.passwordValue();
    if (!val) return false;
    switch (rule) {
      case 'length': return val.length >= 8;
      case 'upper': return /[A-Z]/.test(val);
      case 'lower': return /[a-z]/.test(val);
      case 'digit': return /[0-9]/.test(val);
      case 'special': return /[^A-Za-z0-9]/.test(val);
      default: return false;
    }
  }
}
