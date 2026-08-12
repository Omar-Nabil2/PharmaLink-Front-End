import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-review-team-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './change-password.component.html'
})
export class ReviewTeamChangePasswordComponent {
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  isUpdatingPassword = signal<boolean>(false);

  updatePassword(): void {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'جميع حقول كلمة المرور مطلوبة' });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'كلمة المرور الجديدة غير متطابقة' });
      return;
    }

    this.isUpdatingPassword.set(true);
    
    this.authService.changePassword({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmNewPassword: this.confirmPassword
    }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم تغيير كلمة المرور بنجاح' });
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.isUpdatingPassword.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'فشل تغيير كلمة المرور' });
        this.isUpdatingPassword.set(false);
      }
    });
  }
}
