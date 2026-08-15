import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorType } from '../../../core/interfaces/auth.interface';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, GoogleSigninButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  private returnUrl = '/';
  private authSubscription!: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly socialAuthService: SocialAuthService
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Google Login Subscription
    this.authSubscription = this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.isLoading = true;
        this.authService.googleLogin(user.idToken).subscribe({
          next: (res: any) => this.processGoogleLoginSuccess(res),
          error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.errorHandlerService.handleError(err, 'فشل تسجيل الدخول بواسطة جوجل');
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  // Helper getter for form controls
  get f() {
    return this.loginForm.controls;
  }

  // ---------------------------------------------------------
  // Old Flow: Normal Email & Password Login
  // ---------------------------------------------------------
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'تأكد من بيانات الدخول',
        detail: 'عذراً! يرجى إدخال بريدك الإلكتروني وكلمة المرور بشكل صحيح.',
      });
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        try {
          this.isLoading = false;

          if (res.requiresPhoneVerification) {
            // Case 1: Phone number not verified. Cache userId and redirect to verification.
            if (typeof window !== 'undefined') {
              localStorage.setItem('userId', res.userId);
            }

            this.messageService.add({
              severity: 'info',
              summary: 'التحقق مطلوب',
              detail: 'رقم هاتفك غير موثق. جاري التوجيه للتحقق من رمز OTP...',
            });

            setTimeout(() => {
              this.router.navigate(['/auth/verify-otp']);
            }, 1500);
          } else {
            // Case 2: Verification complete. Store credentials and log in.
            if (typeof window !== 'undefined') {
              if (res.accessToken) {
                localStorage.setItem('accessToken', res.accessToken);
                localStorage.setItem('token', res.accessToken); // Backward compatibility
              }
              if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
              localStorage.setItem('userId', res.userId);
              if (res.fullName) localStorage.setItem('fullName', res.fullName);
              if (res.email) localStorage.setItem('email', res.email);
              if (res.roleName) localStorage.setItem('roleName', res.roleName);

              // Crucial: Update AuthService state so that guards can evaluate correctly immediately
              this.authService.setCurrentUser({
                accessToken: res.accessToken || '',
                refreshToken: res.refreshToken,
                userId: res.userId,
                fullName: res.fullName,
                email: res.email,
                roleName: res.roleName,
              });
            }

            // Trigger a global navbar storage check
            window.dispatchEvent(new Event('storage'));

            this.messageService.add({
              severity: 'success',
              summary: 'مرحباً بعودتك',
              detail: `تم تسجيل الدخول بنجاح كـ ${res.fullName || 'مستخدم'}.`,
            });

            // Redirect to the correct dashboard based on role
            setTimeout(() => {
              let destination = this.returnUrl;
              if (!destination || destination === '/') {
                destination = this.authService.getDashboardPath();
              }
              this.router.navigateByUrl(destination);
            }, 1000);
          }
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
          this.errorHandlerService.handleError(err, 'فشل تسجيل الدخول');
        } catch (fatalErr) {
          this.isLoading = false;
          console.error('[LoginFatalError]', fatalErr);
        }
      },
    });
  }

  // ---------------------------------------------------------
  // Isolated Flow: Google Login Success logic
  // ---------------------------------------------------------
  private processGoogleLoginSuccess(res: any): void {
    try {
      this.isLoading = false;

      if (res.requiresPhoneVerification) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('userId', res.userId);
        }
        this.messageService.add({
          severity: 'info',
          summary: 'التحقق مطلوب',
          detail: 'رقم هاتفك غير موثق. جاري التوجيه للتحقق من رمز OTP...',
        });
        setTimeout(() => {
          this.router.navigate(['/auth/verify-otp']);
        }, 1500);
      } else {
        if (typeof window !== 'undefined') {
          if (res.accessToken) {
            localStorage.setItem('accessToken', res.accessToken);
            localStorage.setItem('token', res.accessToken); // Backward compatibility
          }
          if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
          localStorage.setItem('userId', res.userId);
          if (res.fullName) localStorage.setItem('fullName', res.fullName);
          if (res.email) localStorage.setItem('email', res.email);
          if (res.roleName) localStorage.setItem('roleName', res.roleName);

          // Crucial: Update AuthService state so that guards can evaluate correctly immediately
          this.authService.setCurrentUser({
            accessToken: res.accessToken || '',
            refreshToken: res.refreshToken,
            userId: res.userId,
            fullName: res.fullName,
            email: res.email,
            roleName: res.roleName,
          });
        }

        window.dispatchEvent(new Event('storage'));

        this.messageService.add({
          severity: 'success',
          summary: 'مرحباً بعودتك',
          detail: `تم تسجيل الدخول بواسطة جوجل بنجاح كـ ${res.fullName || 'مستخدم'}.`,
        });

        setTimeout(() => {
          let destination = this.returnUrl;
          if (!destination || destination === '/') {
            destination = this.authService.getDashboardPath();
          }
          this.router.navigateByUrl(destination);
        }, 1000);
      }
    } catch (storageErr) {
      this.isLoading = false;
      console.error('[GoogleLoginStorageError]', storageErr);
    }
  }
}

