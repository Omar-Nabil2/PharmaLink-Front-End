import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly title = signal('Pharma Link');

  categories = ['Prescriptions', 'Pharmacies', 'Orders', 'Inventory', 'Support'];

  faqs = [
    {
      q: 'How do I create a patient account?',
      a: 'Sign up with your email and phone number, then verify with the OTP sent to your phone.',
      open: false,
    },
    {
      q: 'Can pharmacies manage multiple locations?',
      a: 'Yes. Administered pharmacies appear on your profile so you can switch and manage each location.',
      open: false,
    },
    {
      q: 'Is my data secure?',
      a: 'Pharma Link uses authenticated sessions and verification flows to keep patient and pharmacy data protected.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
