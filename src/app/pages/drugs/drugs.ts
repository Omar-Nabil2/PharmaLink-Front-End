import { Component, OnInit, ChangeDetectorRef, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from '@environments/environment';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MessageService, TreeNode } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { TreeSelectModule } from 'primeng/treeselect';
import { FormsModule } from '@angular/forms';
import { DrugService } from '../../core/services/drug.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { DrugDto, DrugCategory } from '../../core/interfaces/drug.interface';

@Component({
  selector: 'app-drugs',
  standalone: true,
  imports: [CommonModule, TagModule, TreeSelectModule, FormsModule],
  templateUrl: './drugs.html',
})
export class DrugsComponent implements OnInit {
  viewMode: 'categories' | 'products' = 'categories';
  displayedCategories: DrugCategory[] = [];
  currentCategory: DrugCategory | null = null;
  breadcrumbs: DrugCategory[] = [];

  drugs: DrugDto[] = [];
  pageNumber = 1;
  pageSize = 12;
  totalPages = 1;
  hasNextPage = false;
  hasPreviousPage = false;

  searchTerm = '';
  sortOption = 'BrandName_ASC';
  sortOptions = [
    { label: 'الاسم (أ-ي)', value: 'BrandName_ASC' },
    { label: 'الاسم (ي-أ)', value: 'BrandName_DESC' },
    { label: 'السعر (من الأقل للأعلى)', value: 'Price_ASC' },
    { label: 'السعر (من الأعلى للأقل)', value: 'Price_DESC' },
  ];

  isLoading = true;
  loadFailed = false;

  addingDrugId: string | null = null;

  private patientLatitude: number | null = null;
  private patientLongitude: number | null = null;

  private readonly searchInput$ = new Subject<string>();
  
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly drugService = inject(DrugService);
  private readonly categoryService = inject(CategoryService);
  private readonly cartService = inject(CartService);
  private readonly errorHandlerService = inject(ErrorHandlerService);
  private readonly messageService = inject(MessageService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  async ngOnInit(): Promise<void> {
    history.replaceState({ breadcrumbs: this.breadcrumbs, currentCategory: this.currentCategory, viewMode: this.viewMode }, '', window.location.href);
    this.loadCategories();

    this.searchInput$.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm = term;
      this.pageNumber = 1;
      this.loadDrugs();
    });

    const location = await this.getPatientLocation();
    this.patientLatitude = location?.latitude ?? null;
    this.patientLongitude = location?.longitude ?? null;
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: PopStateEvent) {
    const state = event.state;
    if (state) {
      this.breadcrumbs = state.breadcrumbs || [];
      this.currentCategory = state.currentCategory || null;
      this.viewMode = state.viewMode || 'categories';
      this.searchTerm = '';
      this.pageNumber = 1;
      this.loadCategories();
    } else {
      this.breadcrumbs = [];
      this.currentCategory = null;
      this.viewMode = 'categories';
      this.loadCategories();
    }
  }

  loadCategories(): void {
    this.isLoading = true;
    if (this.currentCategory) {
      this.categoryService.getSubcategories(this.currentCategory.id).subscribe((cats) => {
        this.displayedCategories = cats;
        this.isLoading = false;
        
        if (cats.length === 0) {
          // Leaf category -> Switch to products view
          this.viewMode = 'products';
          this.loadDrugs();
        } else {
          this.viewMode = 'categories';
        }
        this.cdr.detectChanges();
      });
    } else {
      this.categoryService.getRootCategories().subscribe((cats) => {
        this.displayedCategories = cats;
        this.viewMode = 'categories';
        this.isLoading = false;
        this.cdr.detectChanges();
      });
    }
  }

  onCategoryClick(category: DrugCategory): void {
    this.currentCategory = category;
    this.breadcrumbs = [...this.breadcrumbs, category];
    this.searchTerm = '';
    this.pageNumber = 1;
    history.pushState({ breadcrumbs: this.breadcrumbs, currentCategory: this.currentCategory, viewMode: this.viewMode }, '', window.location.href);
    this.loadCategories();
  }

  onBreadcrumbClick(index: number): void {
    if (index === -1) {
      // Home clicked
      this.currentCategory = null;
      this.breadcrumbs = [];
    } else {
      // Specific breadcrumb clicked
      this.currentCategory = this.breadcrumbs[index];
      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
    }
    this.searchTerm = '';
    this.pageNumber = 1;
    history.pushState({ breadcrumbs: this.breadcrumbs, currentCategory: this.currentCategory, viewMode: this.viewMode }, '', window.location.href);
    this.loadCategories();
  }

  onSortChange(): void {
    this.pageNumber = 1;
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

  loadDrugs(): void {
    this.isLoading = true;
    this.loadFailed = false;

    const [sortColumn, sortDirection] = this.sortOption.split('_');

    this.drugService
      .searchDrugs({
        searchValue: this.searchTerm || undefined,
        categoryId: this.currentCategory?.id,
        sortColumn,
        sortDirection,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        latitude: this.patientLatitude ?? undefined,
        longitude: this.patientLongitude ?? undefined,
      })
      .subscribe({
        next: (result: any) => {
          this.drugs = result.items || result;
          this.totalPages = result.totalPages ?? 1;
          this.hasNextPage = result.hasNextPage ?? false;
          this.hasPreviousPage = result.hasPreviousPage ?? false;
          this.isLoading = false;
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.loadFailed = true;
          this.errorHandlerService.handleError(err, 'تعذر تحميل كتالوج الأدوية');
          this.cdr.detectChanges();
        },
      });
  }

  get isFiltered(): boolean {
    return !!this.searchTerm || this.currentCategory !== null;
  }

  categoryLabel(category: any): string {
    return category?.nameAr ?? category?.nameEn ?? 'أخرى';
  }

  availabilityLabel(status: DrugDto['availabilityStatus']): string {
    switch (status) {
      case 'InStock': return 'متوفر';
      case 'LowStock': return 'كمية محدودة';
      case 'OutOfStock': return 'غير متوفر';
      default: return 'متوفر';
    }
  }

  availabilitySeverity(status: DrugDto['availabilityStatus']): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'InStock': return 'success';
      case 'LowStock': return 'warn';
      case 'OutOfStock': return 'danger';
      default: return 'success';
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
          summary: 'تمت الإضافة للكارت',
          detail: `تم إضافة ${drug.brandName} للكارت.`,
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.addingDrugId = null;
        this.errorHandlerService.handleError(err, 'تعذر إضافة الدواء للكارت');
        this.cdr.detectChanges();
      },
    });
  }
}
