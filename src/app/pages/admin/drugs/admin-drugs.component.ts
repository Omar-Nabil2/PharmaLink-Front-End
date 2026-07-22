import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { AdminDrugService } from '@core/services/admin-drug.service';
import {
  CreateDrugDto,
  DRUG_CATEGORY_LABELS,
  DrugCategory,
  DrugDto,
  DrugSearchRequest,
  UpdateDrugDto,
} from './admin-drugs.model';

@Component({
  selector: 'app-admin-drugs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    Select,
    TagModule,
    ToastModule,
    CheckboxModule,
  ],
  providers: [MessageService],
  templateUrl: './admin-drugs.component.html',
  styleUrl: './admin-drugs.component.scss',
})
export class AdminDrugsComponent implements OnInit {
  private readonly drugService = inject(AdminDrugService);
  private readonly messageService = inject(MessageService);

  drugs = signal<DrugDto[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(false);
  isSeeding = signal<boolean>(false);

  // Filters state
  searchValue = signal<string>('');
  selectedCategory = signal<DrugCategory | null>(null);
  sortColumn = signal<string>('BrandName');
  sortDirection = signal<string>('ASC');

  // Pagination
  first = signal<number>(0);
  pageNumber = signal<number>(1);
  pageSize = signal<number>(10);

  // Modals state
  isFormDialogOpen = signal<boolean>(false);
  isDetailsDialogOpen = signal<boolean>(false);
  isDeleteConfirmOpen = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  selectedDrug = signal<DrugDto | null>(null);

  // Form Fields
  formArabicName = signal<string>('');
  formBrandName = signal<string>('');
  formGenericName = signal<string>('');
  formStrength = signal<string>('500mg');
  formForm = signal<string>('ORAL.SOLID');
  formPrice = signal<number>(10.0);
  formManufacturer = signal<string>('Pharma');
  formDrugClass = signal<string>('General');
  formCategory = signal<DrugCategory>(DrugCategory.PainRelievers);
  formRequiresPrescription = signal<boolean>(false);
  formIsActive = signal<boolean>(true);

  // Category dropdown options
  categoryOptions = [
    { label: 'جميع التصنيفات', value: null },
    { label: 'مسكنات الألم', value: DrugCategory.PainRelievers },
    { label: 'مضادات حيوية', value: DrugCategory.Antibiotics },
    { label: 'الجهاز الهضمي', value: DrugCategory.DigestiveSystem },
    { label: 'السكري', value: DrugCategory.Diabetes },
    { label: 'القلب والأوعية', value: DrugCategory.Cardiovascular },
    { label: 'ضغط الدم', value: DrugCategory.BloodPressure },
    { label: 'مضادات الالتهاب', value: DrugCategory.AntiInflammatory },
    { label: 'أخرى', value: DrugCategory.Other },
  ];

  formCategoryOptions = [
    { label: 'مسكنات الألم', value: DrugCategory.PainRelievers },
    { label: 'مضادات حيوية', value: DrugCategory.Antibiotics },
    { label: 'الجهاز الهضمي', value: DrugCategory.DigestiveSystem },
    { label: 'السكري', value: DrugCategory.Diabetes },
    { label: 'القلب والأوعية', value: DrugCategory.Cardiovascular },
    { label: 'ضغط الدم', value: DrugCategory.BloodPressure },
    { label: 'مضادات الالتهاب', value: DrugCategory.AntiInflammatory },
    { label: 'أخرى', value: DrugCategory.Other },
  ];

  ngOnInit(): void {
    // Initial load triggered automatically via p-table lazy load or explicitly
  }

  loadDrugs(): void {
    this.isLoading.set(true);

    const filters: DrugSearchRequest = {
      searchValue: this.searchValue().trim() || undefined,
      category: this.selectedCategory(),
      sortColumn: this.sortColumn(),
      sortDirection: this.sortDirection(),
      pageNumber: this.pageNumber(),
      pageSize: this.pageSize(),
    };

    this.drugService.getDrugs(filters).subscribe({
      next: (res) => {
        this.drugs.set(res.items ?? []);
        const count = res.totalCount ?? (res.totalPages ? res.totalPages * this.pageSize() : (res.items?.length ?? 0));
        this.totalRecords.set(count);
        this.isLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل تحميل كتالوج الأدوية من الخادم.',
        });
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadDrugs();
  }

  onCategoryChange(): void {
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadDrugs();
  }

  onSortChange(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('ASC');
    }
    this.loadDrugs();
  }

  resetFilters(): void {
    this.searchValue.set('');
    this.selectedCategory.set(null);
    this.sortColumn.set('BrandName');
    this.sortDirection.set('ASC');
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadDrugs();
  }

  onPageChange(event: any): void {
    if (event.first != null) {
      this.first.set(event.first);
    }
    const page = Math.floor((event.first ?? 0) / (event.rows ?? 10)) + 1;
    this.pageNumber.set(page);
    this.pageSize.set(event.rows ?? 10);
    this.loadDrugs();
  }

  // CRUD Dialog Actions
  openCreateDialog(): void {
    this.isEditing.set(false);
    this.selectedDrug.set(null);
    this.formArabicName.set('');
    this.formBrandName.set('');
    this.formGenericName.set('');
    this.formStrength.set('500mg');
    this.formForm.set('ORAL.SOLID');
    this.formPrice.set(10.0);
    this.formManufacturer.set('Pharma');
    this.formDrugClass.set('General');
    this.formCategory.set(DrugCategory.PainRelievers);
    this.formRequiresPrescription.set(false);
    this.formIsActive.set(true);
    this.isFormDialogOpen.set(true);
  }

  openEditDialog(drug: DrugDto): void {
    this.isEditing.set(true);
    this.selectedDrug.set(drug);
    this.formArabicName.set(drug.arabicName ?? '');
    this.formBrandName.set(drug.brandName ?? '');
    this.formGenericName.set(drug.genericName ?? '');
    this.formStrength.set(drug.strength ?? '');
    this.formForm.set(drug.form ?? '');
    this.formPrice.set(drug.price ?? 0);
    this.formManufacturer.set(drug.manufacturer ?? '');
    this.formDrugClass.set(drug.drugClass ?? '');
    this.formCategory.set(drug.category ?? DrugCategory.Other);
    this.formRequiresPrescription.set(drug.requiresPrescription ?? false);
    this.formIsActive.set(drug.isActive ?? true);
    this.isFormDialogOpen.set(true);
  }

  openDetailsDialog(drug: DrugDto): void {
    this.selectedDrug.set(drug);
    this.isDetailsDialogOpen.set(true);
  }

  openDeleteDialog(drug: DrugDto): void {
    this.selectedDrug.set(drug);
    this.isDeleteConfirmOpen.set(true);
  }

  saveDrug(): void {
    if (!this.formArabicName().trim() || !this.formBrandName().trim() || !this.formGenericName().trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى إدخال اسم الدواء بالعربية والإنجليزية.',
      });
      return;
    }

    if (this.isEditing() && this.selectedDrug()) {
      const dto: UpdateDrugDto = {
        arabicName: this.formArabicName().trim(),
        brandName: this.formBrandName().trim(),
        genericName: this.formGenericName().trim(),
        strength: this.formStrength().trim(),
        form: this.formForm().trim(),
        price: this.formPrice(),
        manufacturer: this.formManufacturer().trim(),
        drugClass: this.formDrugClass().trim(),
        category: this.formCategory(),
        requiresPrescription: this.formRequiresPrescription(),
        isActive: this.formIsActive(),
      };

      this.drugService.updateDrug(this.selectedDrug()!.drugId, dto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تحديث بيانات الدواء بنجاح.',
          });
          this.isFormDialogOpen.set(false);
          this.loadDrugs();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل تحديث بيانات الدواء.',
          });
        },
      });
    } else {
      const dto: CreateDrugDto = {
        arabicName: this.formArabicName().trim(),
        brandName: this.formBrandName().trim(),
        genericName: this.formGenericName().trim(),
        strength: this.formStrength().trim(),
        form: this.formForm().trim(),
        price: this.formPrice(),
        manufacturer: this.formManufacturer().trim(),
        drugClass: this.formDrugClass().trim(),
        category: this.formCategory(),
        requiresPrescription: this.formRequiresPrescription(),
      };

      this.drugService.createDrug(dto).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إضافة الدواء الجديد للكتالوج بنجاح.',
          });
          this.isFormDialogOpen.set(false);
          this.loadDrugs();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'فشل إضافة الدواء.',
          });
        },
      });
    }
  }

  confirmDelete(): void {
    if (!this.selectedDrug()) return;

    this.drugService.deleteDrug(this.selectedDrug()!.drugId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم حذف الدواء من الكتالوج بنجاح.',
        });
        this.isDeleteConfirmOpen.set(false);
        this.loadDrugs();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشل حذف الدواء.',
        });
      },
    });
  }

  seedDatabase(): void {
    this.isSeeding.set(true);
    this.drugService.seedCatalog().subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'تفعيل قاعدة البيانات',
          detail: res.message || 'تم تفعيل وتغذية كتالوج الأدوية بنجاح.',
        });
        this.isSeeding.set(false);
        this.loadDrugs();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'فشلت عملية تفعيل قاعدة البيانات.',
        });
        this.isSeeding.set(false);
      },
    });
  }

  // Formatting Helpers
  getCategoryLabel(category: DrugCategory): string {
    return DRUG_CATEGORY_LABELS[category] || 'أخرى';
  }

  getCategorySeverity(category: DrugCategory): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (category) {
      case DrugCategory.PainRelievers: return 'info';
      case DrugCategory.Antibiotics: return 'danger';
      case DrugCategory.DigestiveSystem: return 'warn';
      case DrugCategory.Diabetes: return 'secondary';
      case DrugCategory.Cardiovascular: return 'info';
      case DrugCategory.BloodPressure: return 'warn';
      case DrugCategory.AntiInflammatory: return 'danger';
      default: return 'secondary';
    }
  }

  getStatusLabel(drug: DrugDto): string {
    if (!drug.isActive) return 'غير نشط';
    return 'متوفر';
  }

  getStatusSeverity(drug: DrugDto): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!drug.isActive) return 'danger';
    return 'success';
  }
}
