import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorType } from '../../../core/interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  private returnUrl = '/';

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Helper getter for form controls
  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Check Login Details',
        detail: 'Oops! Please fill in your email and password correctly.'
      });
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res) => {
        try {
          this.isLoading = false;

          if (res.requiresPhoneVerification) {
            // Case 1: Phone number not verified. Cache userId and redirect to verification.
            if (typeof window !== 'undefined') {
              localStorage.setItem('userId', res.userId);
            }

            this.messageService.add({
              severity: 'info',
              summary: 'Verification Required',
              detail: 'Your phone number is not verified. Redirecting to OTP verification...'
            });

            setTimeout(() => {
              this.router.navigate(['/auth/verify-otp']);
            }, 1500);
          } else {
            // Case 2: Verification complete. Store credentials and log in.
            if (typeof window !== 'undefined') {
              if (res.accessToken) localStorage.setItem('accessToken', res.accessToken);
              localStorage.setItem('userId', res.userId);
              if (res.fullName) localStorage.setItem('fullName', res.fullName);
              if (res.email) localStorage.setItem('email', res.email);
              if (res.roleName) localStorage.setItem('roleName', res.roleName);
            }

            // Trigger a global navbar storage check
            window.dispatchEvent(new Event('storage'));

            this.messageService.add({
              severity: 'success',
              summary: 'Welcome Back',
              detail: `Signed in successfully as ${res.fullName || 'User'}.`
            });

            // Redirect to home
            setTimeout(() => {
              this.router.navigate(['/']);
            }, 1000);
          }

          // Trigger a global navbar storage check
          window.dispatchEvent(new Event('storage'));

          this.messageService.add({
            severity: 'success',
            summary: 'Welcome Back',
            detail: `Signed in successfully as ${res.fullName}.`
          });

          // Redirect to original destination or home
          setTimeout(() => {
            this.router.navigateByUrl(this.returnUrl);
          }, 1000);
        } catch (storageErr) {
          this.isLoading = false;
          console.error('[LoginStorageError]', storageErr);
        }
      },
      error: (err: HttpErrorResponse) => {
        try {
          this.isLoading = false;

          // Clear password input box to let user re-type their credentials immediately
          this.loginForm.patchValue({ password: '' });

          // Check if server validation error can be mapped directly to email/password fields
          const parsed = this.errorHandlerService.parseError(err);
          if (parsed.errors && parsed.type === ErrorType.ValidationError) {
            const validationErrors = parsed.errors;
            Object.keys(validationErrors).forEach((field) => {
              const camelField = field.charAt(0).toLowerCase() + field.slice(1);
              const control = this.loginForm.get(camelField);
              if (control) {
                const messages = validationErrors[field];
                const errorMsg = Array.isArray(messages) ? messages[0] : messages;
                control.setErrors({ serverError: errorMsg });
              }
            });
          }

          // Delegate to toast error handler
          this.errorHandlerService.handleError(err, 'Sign In Failed');
        } catch (fatalErr) {
          this.isLoading = false;
          console.error('[LoginFatalError]', fatalErr);
        }
      }
    });
  }
}
