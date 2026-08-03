import { Component, OnInit, OnDestroy, AfterViewInit, QueryList, ViewChildren, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userId: string | null = null;
  otpDigits: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;

  // Countdown timer variables (1 minute = 60 seconds)
  countdownSeconds = 60; 
  timerInterval: any = null;

  constructor(
    private readonly authService: AuthService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId');
    }

    if (!this.userId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تم رفض الوصول',
        detail: 'لم يتم العثور على تفاصيل تسجيل المريض. يرجى التسجيل أولاً.'
      });
      this.router.navigate(['/auth/register']);
      return;
    }

    const savedEndTime = localStorage.getItem('otp_timer_end');
    if (!savedEndTime) {
      this.sendOtpRequest(true);
    } else {
      this.startTimer(false);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.focusInput(0);
    }, 300);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Timer Management (60 Seconds with LocalStorage persistence)
  startTimer(reset: boolean = false): void {
    const storageKey = 'otp_timer_end';
    const now = Date.now();
    let endTime: number;
    const timerDurationMs = 60 * 1000;

    if (reset) {
      endTime = now + timerDurationMs;
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, endTime.toString());
      }
    } else {
      const savedEndTime = localStorage.getItem(storageKey);
      if (savedEndTime) {
        endTime = parseInt(savedEndTime, 10);
      } else {
        endTime = now + timerDurationMs;
        if (typeof window !== 'undefined') {
          localStorage.setItem(storageKey, endTime.toString());
        }
      }
    }

    this.stopTimer();

    const remainingMs = endTime - now;
    this.countdownSeconds = Math.max(0, Math.floor(remainingMs / 1000));

    if (this.countdownSeconds === 0) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(storageKey);
      }
      return;
    }

    this.timerInterval = setInterval(() => {
      const currentNow = Date.now();
      const currentRemainingMs = endTime - currentNow;
      this.countdownSeconds = Math.max(0, Math.floor(currentRemainingMs / 1000));
      this.cdr.markForCheck();

      if (this.countdownSeconds <= 0) {
        this.stopTimer();
        if (typeof window !== 'undefined') {
          localStorage.removeItem(storageKey);
        }
      }
    }, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.countdownSeconds / 60);
    const seconds = this.countdownSeconds % 60;
    const padMin = minutes.toString().padStart(2, '0');
    const padSec = seconds.toString().padStart(2, '0');
    return `${padMin}:${padSec}s`;
  }

  get canResend(): boolean {
    return this.countdownSeconds === 0 && !this.isResending && !this.isLoading;
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    if (key === 'Backspace') {
      event.preventDefault();

      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
      } else {
        if (index > 0) {
          this.otpDigits[index - 1] = '';
        }
        setTimeout(() => {
          this.focusInput(index - 1);
        }, 0);
      }
    } else if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      
      this.otpDigits[index] = key;
      
      setTimeout(() => {
        this.focusInput(index + 1);
      }, 0);
    } else if (key === 'ArrowLeft') {
      event.preventDefault();
      setTimeout(() => {
        this.focusInput(index - 1);
      }, 0);
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      setTimeout(() => {
        this.focusInput(index + 1);
      }, 0);
    } else {
      const allowedSystemKeys = ['Tab', 'Enter', 'Delete', 'ArrowUp', 'ArrowDown', 'Control', 'Alt', 'Meta', 'Shift'];
      if (!allowedSystemKeys.includes(key)) {
        event.preventDefault();
      }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digitsOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digitsOnly.length > 0) {
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = digitsOnly[i] || '';
      }
      const focusIndex = Math.min(digitsOnly.length, 5);
      this.focusInput(focusIndex);
    }
  }

  focusInput(index: number): void {
    if (index >= 0 && index < 6) {
      const inputs = this.digitInputs.toArray();
      if (inputs[index]) {
        inputs[index].nativeElement.focus();
        inputs[index].nativeElement.select();
      }
    }
  }

  // --- الربط الحقيقي بدالة إرسال الرمز ---
  sendOtpRequest(isInitialLoad: boolean = false): void {
    if (!this.userId) return;

    if (!isInitialLoad) {
      this.isResending = true;
    }

    this.authService.requestPhoneVerification(this.userId).subscribe({
      next: () => {
        this.isResending = false;
        this.startTimer(true);

        this.messageService.add({
          severity: 'success',
          summary: 'تم إرسال الرمز',
          detail: 'تم إرسال رمز التحقق إلى رقم هاتفك المسجل.'
        });

        if (!isInitialLoad) {
          this.otpDigits = ['', '', '', '', '', ''];
          this.focusInput(0);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isResending = false;
        this.errorHandlerService.handleError(err, 'فشل إرسال الرمز');
      }
    });
  }

  // --- الربط الحقيقي بدالة التحقق من الرمز ---
  onVerify(): void {
    if (!this.userId) return;

    const code = this.otpDigits.join('');
    if (code.length < 6) return;

    this.isLoading = true;

    this.authService.verifyPhone(this.userId, code).subscribe({
      next: () => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'تم التحقق بنجاح',
          detail: 'تم توثيق رقم الهاتف بنجاح.'
        });

        if (typeof window !== 'undefined') {
          localStorage.removeItem('userId');
          localStorage.removeItem('otp_timer_end');
        }

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorHandlerService.handleError(err, 'فشل التحقق');
        this.otpDigits = ['', '', '', '', '', ''];
        setTimeout(() => {
          this.focusInput(0);
        }, 100);
      }
    });
  }

  onCancel(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
      localStorage.removeItem('otp_timer_end');
    }
    this.router.navigate(['/auth/register']);
  }

  get isCodeComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }
}