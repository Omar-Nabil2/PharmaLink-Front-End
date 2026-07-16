import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
    resetForm: FormGroup;
    isLoading = false;
    email = '';
    token = '';
    invalidLink = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly authService: AuthService,
        private readonly errorHandler: ErrorHandlerService,
        private readonly messageService: MessageService,
        private readonly route: ActivatedRoute,
        private readonly router: Router
    ) {
        this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.email = params['email'] || '';
            this.token = params['token'] || '';

            if (!this.email || !this.token) {
                this.invalidLink = true;
            }
        });
    }

    passwordMatchValidator(control: AbstractControl) {
        return control.get('password')?.value === control.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    onSubmit(): void {
        if (this.resetForm.invalid || this.invalidLink) {
            this.resetForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        const payload = {
            email: this.email,
            token: this.token,
            password: this.resetForm.value.password
        };

        this.authService.resetPassword(payload).subscribe({
            next: () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Password Updated',
                    detail: 'Your password has been reset successfully. Please login.',
                    life: 4000
                });
                this.router.navigate(['/auth/login']);
            },
            error: (err) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'Failed to reset password');
            }
        });
    }
}