import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PatientAddressesService } from '../../../../core/services/patient-addresses.service';
import { PatientAddress } from '../../../../core/interfaces/profile.interface';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

@Component({
  selector: 'app-address-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './address-list.component.html'
})
export class AddressListComponent implements OnInit {
  addresses: PatientAddress[] = [];
  isLoading = true;
  successMessage = '';

  constructor(
    private readonly addressesService: PatientAddressesService,
    private readonly errorHandler: ErrorHandlerService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    console.log('loadAddresses() called');
    this.isLoading = true;
    this.addressesService.getMyAddresses().subscribe({
      next: (data) => {
        console.log('Data received in component:', data);
        this.addresses = data || [];
        this.isLoading = false;
        console.log('Component state updated, addresses:', this.addresses);
        this.cdr.detectChanges(); // FORCE CHANGE DETECTION
      },
      error: (err) => {
        console.error('Error received in component:', err);
        this.isLoading = false;
        this.errorHandler.handleError(err, 'فشل تحميل العناوين');
        this.cdr.detectChanges();
      }
    });
  }

  deleteAddress(id: string): void {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;

    this.addressesService.deleteAddress(id).subscribe({
      next: () => {
        this.successMessage = 'تم حذف العنوان بنجاح';
        this.loadAddresses();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'فشل حذف العنوان');
      }
    });
  }

  setDefault(id: string): void {
    this.addressesService.setDefaultAddress(id).subscribe({
      next: () => {
        this.successMessage = 'تم تعيين العنوان كافتراضي بنجاح';
        this.loadAddresses();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorHandler.handleError(err, 'فشل تعيين العنوان كافتراضي');
      }
    });
  }
}
