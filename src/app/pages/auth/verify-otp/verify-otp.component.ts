import { Component, OnInit, OnDestroy, AfterViewInit, QueryList, ViewChildren, ElementRef } from '@angular/core';
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
        summary: 'تم رفض الوصول',
        detail: 'لم يتم العثور على تفاصيل تسجيل المريض. يرجى التسجيل أولاً.'
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

  // Unified KeyDown Handler: Manages Entry, Deletion, and Navigation
  onKeyDown(event: KeyboardEvent, index: number): void {
    const key = event.key;

    if (key === 'Backspace') {
      event.preventDefault(); // Stop default browser action

      if (this.otpDigits[index]) {
        // Clear current index if filled
        this.otpDigits[index] = '';
      } else {
        // If empty, clear previous index and move backward asynchronously
        if (index > 0) {
          this.otpDigits[index - 1] = '';
        }
        setTimeout(() => {
          this.focusInput(index - 1);
        }, 0);
      }
    } else if (/^[0-9]$/.test(key)) {
      event.preventDefault(); // Stop browser typing to prevent double entry
      
      // Update cell value
      this.otpDigits[index] = key;
      
      // Advance focus asynchronously to prevent key event leakages to the next box
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
      // Prevent entering non-numeric letters/symbols but allow system operations (Tab, Shift, Control)
      const allowedSystemKeys = ['Tab', 'Enter', 'Delete', 'ArrowUp', 'ArrowDown', 'Control', 'Alt', 'Meta', 'Shift'];
      if (!allowedSystemKeys.includes(key)) {
        event.preventDefault();
      }
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

  // Mocked API Methods (Original endpoints under maintenance)
  sendOtpRequest(isInitialLoad: boolean = false): void {
    if (!this.userId) return;

    if (!isInitialLoad) {
      this.isResending = true;
    }

    // Simulate API network latency delay
    setTimeout(() => {
      this.isResending = false;
      this.startTimer();

      // Simulated success response: Ok(new { message = "Verification code sent to your registered phone number." });
      this.messageService.add({
        severity: 'success',
        summary: 'تم إرسال الرمز',
        detail: 'تم إرسال رمز التحقق إلى رقم هاتفك المسجل.'
      });

      // Clear fields on resend
      if (!isInitialLoad) {
        this.otpDigits = ['', '', '', '', '', ''];
        this.focusInput(0);
      }
    }, 800);
  }

  onVerify(): void {
    if (!this.userId) return;

    const code = this.otpDigits.join('');
    if (code.length < 6) return;

    this.isLoading = true;

    // Simulate API network latency delay
    setTimeout(() => {
      try {
        // Mock code "112233" as success
        if (code === '112233') {
          this.isLoading = false;
          // Simulated success response: Ok(new { message = "Phone number verified successfully." });
          this.messageService.add({
            severity: 'success',
            summary: 'تم التحقق بنجاح',
            detail: 'تم توثيق رقم الهاتف بنجاح.'
          });

          // Clear local storage key after verification completes
          if (typeof window !== 'undefined') {
            localStorage.removeItem('userId');
          }

          // Navigate to login
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 1500);
        } else {
          this.isLoading = false; // Explicitly ensure loading state is cleared
          
          // Simulated API error response for incorrect codes
          const mockError = new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: {
              title: 'Verification Failed',
              errors: {
                code: 'Otp.InvalidCode',
                message: 'The verification code entered is incorrect. (Use 112233 for testing success).'
              }
            }
          });

          this.errorHandlerService.handleError(mockError, 'فشل التحقق');

          // Human-friendly recovery: clear entries and refocus first input so they can try again
          this.otpDigits = ['', '', '', '', '', ''];
          setTimeout(() => {
            this.focusInput(0);
          }, 100);
        }
      } catch (err) {
        this.isLoading = false;
        console.error('[VerifyFatalError]', err);
      }
    }, 800);
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
