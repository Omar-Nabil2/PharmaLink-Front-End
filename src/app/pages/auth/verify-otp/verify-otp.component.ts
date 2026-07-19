import { Component, OnInit, OnDestroy, AfterViewInit, QueryList, ViewChildren, ElementRef, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

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

  // Countdown timer variables — a signal so setInterval writes are picked up
  // under Zoneless change detection (this app has no zone.js patching setInterval).
  countdownSeconds = signal(120); // 2 minutes
  timerInterval: any = null;

  constructor(
    private readonly authService: AuthService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.userId = localStorage.getItem('userId');
    }

    if (!this.userId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Access Denied',
        detail: 'No patient registration details found. Please sign up first.'
      });
      this.router.navigate(['/auth/register']);
      return;
    }

    // Auto-request initial verification code on landing
    this.sendOtpRequest(true);
  }

  ngAfterViewInit(): void {
    // Focus first input automatically
    setTimeout(() => {
      this.focusInput(0);
    }, 300);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Timer Management
  startTimer(): void {
    this.stopTimer();
    this.countdownSeconds.set(120);
    this.timerInterval = setInterval(() => {
      if (this.countdownSeconds() > 0) {
        this.countdownSeconds.update(v => v - 1);
      } else {
        this.stopTimer();
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
    const minutes = Math.floor(this.countdownSeconds() / 60);
    const seconds = this.countdownSeconds() % 60;
    const padMin = minutes.toString().padStart(2, '0');
    const padSec = seconds.toString().padStart(2, '0');
    return `${padMin}:${padSec}s`;
  }

  get canResend(): boolean {
    return this.countdownSeconds() === 0 && !this.isResending && !this.isLoading;
  }

  // Unified KeyDown Handler: Manages Entry, Deletion, and Navigation
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

  sendOtpRequest(isInitialLoad: boolean = false): void {
    if (!this.userId) return;

    if (!isInitialLoad) {
      this.isResending = true;
    }

    this.authService.requestPhoneVerification(this.userId).subscribe({
      next: (response) => {
        this.isResending = false;
        this.startTimer();

        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: response?.message || 'Verification code sent to your registered phone number.'
        });

        if (!isInitialLoad) {
          this.otpDigits = ['', '', '', '', '', ''];
          this.focusInput(0);
        }
      },
      error: (err) => {
        this.isResending = false;
        this.errorHandlerService.handleError(err, 'Failed to Send Code');
      }
    });
  }

  onVerify(): void {
    if (!this.userId) return;

    const code = this.otpDigits.join('');
    if (code.length < 6) return;

    this.isLoading = true;

    this.authService.verifyPhone(this.userId, code).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Verified Successfully',
          detail: response?.message || 'Phone number verified successfully.'
        });

        if (typeof window !== 'undefined') {
          localStorage.removeItem('userId');
        }

        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;

        this.errorHandlerService.handleError(err, 'Verification Failed');

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
    }
    this.router.navigate(['/auth/register']);
  }

  get isCodeComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }
}