import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [],
  templateUrl: './verify-otp.component.html',
})
export class VerifyOtpComponent implements OnInit {
  localStorageUserId: string | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.localStorageUserId = localStorage.getItem('userId');
    }
  }
}
