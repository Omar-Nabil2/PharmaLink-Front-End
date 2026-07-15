import { Component, OnInit, OnDestroy, AfterViewInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
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
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChildren('digitInput') digitInputs!: QueryList<ElementRef<HTMLInputElement>>;

  userId: string | null = null;
  otpDigits: string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;

  // Countdown timer variables
  countdownSeconds = 120; // 2 minutes
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
    this.countdownSeconds = 120;
    this.timerInterval = setInterval(() => {
      if (this.countdownSeconds > 0) {
        this.countdownSeconds--;
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
    const minutes = Math.floor(this.countdownSeconds / 60);
    const seconds = this.countdownSeconds % 60;
    const padMin = minutes.toString().padStart(2, '0');
    const padSec = seconds.toString().padStart(2, '0');
    return `${padMin}:${padSec}s`;
  }

  get canResend(): boolean {
    return this.countdownSeconds === 0 && !this.isResending && !this.isLoading;
  }

  // OTP Digit Navigation Methods
  onDigitInput(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Filter non-numeric characters
    if (value && !/^[0-9]$/.test(value)) {
      this.otpDigits[index] = '';
      input.value = '';
      return;
    }

    this.otpDigits[index] = value;

    // If a digit was entered, advance focus
    if (value) {
      this.focusInput(index + 1);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      if (!this.otpDigits[index]) {
        // Current cell is empty, move backward and clear previous cell
        this.focusInput(index - 1);
        if (index > 0) {
          this.otpDigits[index - 1] = '';
        }
      } else {
        // Clear current cell
        this.otpDigits[index] = '';
      }
      event.preventDefault();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    // Extract only digits
    const digitsOnly = pastedData.replace(/[^0-9]/g, '').slice(0, 6);

    if (digitsOnly.length > 0) {
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = digitsOnly[i] || '';
      }
      // Focus the last populated index
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

  // API Methods
  sendOtpRequest(isInitialLoad: boolean = false): void {
    if (!this.userId) return;

    if (!isInitialLoad) {
      this.isResending = true;
    }

    this.authService.requestPhoneVerification(this.userId).subscribe({
      next: (res) => {
        this.isResending = false;
        this.startTimer();

        // Displays standard server response detail
        this.messageService.add({
          severity: 'success',
          summary: 'OTP Sent',
          detail: res.message || 'Verification code sent to your registered phone number.'
        });

        // Clear existing fields on resend
        if (!isInitialLoad) {
          this.otpDigits = ['', '', '', '', '', ''];
          this.focusInput(0);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isResending = false;
        // Delegate display and logging to ErrorHandlerService (handles 503 WebhookFailed etc.)
        this.errorHandlerService.handleError(err, 'Failed to Send OTP');
      }
    });
  }

  onVerify(): void {
    if (!this.userId) return;

    const code = this.otpDigits.join('');
    if (code.length < 6) return;

    this.isLoading = true;
    this.authService.verifyPhone(this.userId, code).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Verified Successfully',
          detail: res.message || 'Your phone number has been verified. Welcome to PharmaLink!'
        });

        // Clear local storage key after verification completes
        if (typeof window !== 'undefined') {
          localStorage.removeItem('userId');
        }

        // Navigate to login
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorHandlerService.handleError(err, 'Verification Failed');
      }
    });
  }

  onCancel(): void {
    // Clear registration key and return to register
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
    this.router.navigate(['/auth/register']);
  }

  // Helper validation getter
  get isCodeComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }
}
