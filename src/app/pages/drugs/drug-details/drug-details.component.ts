import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DrugService } from '@core/services/drug.service';
import { CartService } from '@core/services/cart.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { MessageService } from 'primeng/api';
import { DrugDto } from '@core/interfaces/drug.interface';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-drug-details',
  standalone: true,
  imports: [CommonModule, RouterLink, TagModule],
  templateUrl: './drug-details.html',
  styleUrl: './drug-details.scss',
})
export class DrugDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly drugService = inject(DrugService);
  private readonly cartService = inject(CartService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly messageService = inject(MessageService);

  drugId: string | null = null;
  drug: DrugDto | null = null;
  isLoading = true;
  loadFailed = false;
  addingToCart = false;
  activeTab: 'desc' | 'meta' | 'extra' = 'desc';

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.drugId = params.get('id');
      if (this.drugId) {
        this.loadDrugDetails();
      }
    });
  }

  loadDrugDetails(): void {
    if (!this.drugId) return;
    
    this.isLoading = true;
    this.loadFailed = false;

    this.drugService.getDrugById(this.drugId).subscribe({
      next: (data) => {
        this.drug = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadFailed = true;
        this.errorHandlerService.handleError(err, 'تعذر تحميل بيانات الدواء');
        this.cdr.detectChanges();
      }
    });
  }

  addToCart(): void {
    if (!this.drug || this.drug.availabilityStatus === 'OutOfStock' || this.addingToCart) return;

    this.addingToCart = true;

    this.cartService.addItem(this.drug.drugId, 1).subscribe({
      next: () => {
        this.addingToCart = false;
        this.messageService.add({
          severity: 'success',
          summary: 'تمت الإضافة للسله',
          detail: `تم إضافة ${this.drug?.brandName} للسله.`,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addingToCart = false;
        this.errorHandlerService.handleError(err, 'تعذر إضافة الدواء للسله');
        this.cdr.detectChanges();
      },
    });
  }

  availabilityLabel(status: string | null | undefined): string {
    switch (status) {
      case 'InStock': return 'متوفر';
      case 'LowStock': return 'كمية محدودة';
      case 'OutOfStock': return 'غير متوفر';
      default: return 'متوفر';
    }
  }

  availabilitySeverity(status: string | null | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'InStock': return 'success';
      case 'LowStock': return 'warn';
      case 'OutOfStock': return 'danger';
      default: return 'success';
    }
  }

  shareDrug(): void {
    if (!this.drug) return;
    
    if (navigator.share) {
      navigator.share({
        title: `دواء ${this.drug.brandName}`,
        text: `اكتشف هذا الدواء (${this.drug.brandName}) على فارما لينك:`,
        url: window.location.href,
      })
      .then(() => console.log('تمت المشاركة بنجاح'))
      .catch((error) => console.log('حدث خطأ في المشاركة', error));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.messageService.add({
          severity: 'info',
          summary: 'تم النسخ',
          detail: 'تم نسخ رابط الدواء للحافظة'
        });
      });
    }
  }
}
