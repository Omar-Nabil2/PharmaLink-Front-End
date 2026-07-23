import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';

import { DrugService } from '../../core/services/drug.service';
import { CartService } from '../../core/services/cart.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { DrugCategory, DrugDto } from '../../core/interfaces/drug.interface';

interface CategoryOption {
  label: string;
  value: DrugCategory | 'All';
}

@Component({
  selector: 'app-drugs',
  standalone: true,
  imports: [CommonModule, TagModule],
  templateUrl: './drugs.html',
})
export class DrugsComponent implements OnInit {
  readonly categories: CategoryOption[] = [
    { label: 'All', value: 'All' },
    { label: 'Pain Relievers', value: 'PainRelievers' },
    { label: 'Antibiotics', value: 'Antibiotics' },
    { label: 'Digestive System', value: 'DigestiveSystem' },
    { label: 'Diabetes', value: 'Diabetes' },
    { label: 'Cardiovascular', value: 'Cardiovascular' },
    { label: 'Blood Pressure', value: 'BloodPressure' },
    { label: 'Anti-inflammatory', value: 'AntiInflammatory' },
  ];

  drugs: DrugDto[] = [];
  pageNumber = 1;
  pageSize = 12;
  totalPages = 1;
  hasNextPage = false;
  hasPreviousPage = false;

  searchTerm = '';
  selectedCategory: DrugCategory | 'All' = 'All';

  isLoading = true;
  loadFailed = false;

  addingDrugId: string | null = null;

  private patientLatitude: number | null = null;
  private patientLongitude: number | null = null;

  private readonly searchInput$ = new Subject<string>();

  constructor(
    private readonly drugService: DrugService,
    private readonly cartService: CartService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly messageService: MessageService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.searchInput$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.pageNumber = 1;
      this.loadDrugs();
    });

    const location = await this.getPatientLocation();
    this.patientLatitude = location?.latitude ?? null;
    this.patientLongitude = location?.longitude ?? null;

    this.loadDrugs();
  }

  private getPatientLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 5000 },
      );
    });
  }

  onSearchChange(value: string): void {
    this.searchInput$.next(value);
  }

  selectCategory(category: DrugCategory | 'All'): void {
    if (this.selectedCategory === category) return;
    this.selectedCategory = category;
    this.pageNumber = 1;
    this.loadDrugs();
  }

  loadDrugs(): void {
    this.isLoading = true;
    this.loadFailed = false;

    this.drugService
      .searchDrugs({
        searchValue: this.searchTerm || undefined,
        category: this.selectedCategory === 'All' ? undefined : this.selectedCategory,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        latitude: this.patientLatitude ?? undefined,
        longitude: this.patientLongitude ?? undefined,
      })
      .subscribe({
        next: (result) => {
          this.drugs = result.items;
          this.totalPages = result.totalPages;
          this.hasNextPage = result.hasNextPage;
          this.hasPreviousPage = result.hasPreviousPage;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.loadFailed = true;
          this.errorHandlerService.handleError(err, 'Failed to Load Catalog');
        },
      });
  }

  get isFiltered(): boolean {
    return !!this.searchTerm || this.selectedCategory !== 'All';
  }

  categoryLabel(category: DrugCategory): string {
    return this.categories.find((c) => c.value === category)?.label ?? category;
  }

  availabilityLabel(status: DrugDto['availabilityStatus']): string {
    switch (status) {
      case 'InStock': return 'In Stock';
      case 'LowStock': return 'Low Stock';
      case 'OutOfStock': return 'Out of Stock';
      default: return 'Availability unknown';
    }
  }

  availabilitySeverity(status: DrugDto['availabilityStatus']): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'InStock': return 'success';
      case 'LowStock': return 'warn';
      case 'OutOfStock': return 'danger';
      default: return 'secondary';
    }
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.pageNumber) return;
    this.pageNumber = page;
    this.loadDrugs();
  }

  addToCart(drug: DrugDto): void {
    if (drug.availabilityStatus === 'OutOfStock' || this.addingDrugId) return;

    this.addingDrugId = drug.drugId;

    this.cartService.addItem(drug.drugId, 1).subscribe({
      next: () => {
        this.addingDrugId = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Added to Cart',
          detail: `${drug.brandName} was added to your cart.`,
        });
      },
      error: (err) => {
        this.addingDrugId = null;
        this.errorHandlerService.handleError(err, 'Failed to Add to Cart');
      },
    });
  }
}