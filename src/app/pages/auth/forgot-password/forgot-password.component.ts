import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
    forgotForm: FormGroup;
    isLoading = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly authService: AuthService,
        private readonly errorHandler: ErrorHandlerService,
        private readonly messageService: MessageService
    ) {
        this.forgotForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit(): void {
        if (this.forgotForm.invalid) {
            this.forgotForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;
        this.authService.forgotPassword(this.forgotForm.value).subscribe({
            next: () => {
                this.isLoading = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Email Sent',
                    detail: 'If the email is registered, a reset link has been sent.',
                    life: 5000
                });
                this.forgotForm.reset();
            },
            error: (err) => {
                this.isLoading = false;
                this.errorHandler.handleError(err, 'Reset Request Failed');
            }
        });
    }
}