import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { ErrorType } from '../../../core/interfaces/auth.interface';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './change-password.component.html',
})
export class ChangePasswordComponent implements OnInit {
  changeForm: FormGroup;
  isLoading = false;
  showCurrent = false;
  showNew = false;
  showConfirm = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {
    this.changeForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [Validators.required, Validators.minLength(8), this.passwordStrengthValidator()],
        ],
        confirmNewPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.changeForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.changeForm.get('confirmNewPassword')?.updateValueAndValidity();
    });
  }

  get f() {
    return this.changeForm.controls;
  }

  passwordValue(): string {
    return this.changeForm?.get('newPassword')?.value || '';
  }

  checkPasswordRule(rule: 'length' | 'upper' | 'lower' | 'digit' | 'special'): boolean {
    const val = this.passwordValue();
    if (!val) return false;
    switch (rule) {
      case 'length':
        return val.length >= 8;
      case 'upper':
        return /[A-Z]/.test(val);
      case 'lower':
        return /[a-z]/.test(val);
      case 'digit':
        return /[0-9]/.test(val);
      case 'special':
        return /[^A-Za-z0-9]/.test(val);
      default:
        return false;
    }
  }

  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const errors: Record<string, boolean> = {};
      if (value.length < 8) errors['minLength'] = true;
      if (!/[A-Z]/.test(value)) errors['noUppercase'] = true;
      if (!/[a-z]/.test(value)) errors['noLowercase'] = true;
      if (!/[0-9]/.test(value)) errors['noNumeric'] = true;
      if (!/[^A-Za-z0-9]/.test(value)) errors['noSpecial'] = true;

      return Object.keys(errors).length > 0 ? { strength: errors } : null;
    };
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword');
    const confirm = group.get('confirmNewPassword');
    if (!password || !confirm || !confirm.value) return null;

    if (password.value !== confirm.value) {
      confirm.setErrors({ ...(confirm.errors || {}), mismatch: true });
    } else {
      const errors = { ...(confirm.errors || {}) };
      delete errors['mismatch'];
      confirm.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }
    return null;
  }

  onSubmit(): void {
    if (this.changeForm.invalid) {
      this.changeForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Check form details',
        detail: 'Please fill in all fields correctly.',
      });
      return;
    }

    this.isLoading = true;
    this.authService.changePassword(this.changeForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Password updated',
          detail: 'Your password has been changed successfully.',
          life: 4000,
        });
        this.changeForm.reset();
        setTimeout(() => this.router.navigate(['/profile']), 1200);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        const parsed = this.errorHandler.parseError(err);

        if (parsed.errors && parsed.type === ErrorType.ValidationError) {
          Object.keys(parsed.errors).forEach((field) => {
            const camelField = field.charAt(0).toLowerCase() + field.slice(1);
            const control = this.changeForm.get(camelField);
            if (control) {
              const messages = parsed.errors[field];
              const errorMsg = Array.isArray(messages) ? messages[0] : messages;
              control.setErrors({ serverError: errorMsg });
            }
          });
        }

        this.errorHandler.handleError(err, 'Failed to change password');
      },
    });
  }
}
