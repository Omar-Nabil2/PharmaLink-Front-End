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
import { TreeSelectModule } from 'primeng/treeselect';
import { MessageService, TreeNode } from 'primeng/api';
import { AdminDrugService } from '@core/services/admin-drug.service';
import { CategoryService } from '@core/services/category.service';
import {
  CreateDrugDto,
  DRUG_CATEGORY_LABELS,
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
    TagModule,
    ToastModule,
    CheckboxModule,
    TreeSelectModule
  ],
  providers: [MessageService],
  templateUrl: './admin-drugs.component.html',
  styleUrl: './admin-drugs.component.scss',
})
export class AdminDrugsComponent implements OnInit {
  private readonly drugService = inject(AdminDrugService);
  private readonly categoryService = inject(CategoryService);
  private readonly messageService = inject(MessageService);

  drugs = signal<DrugDto[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(false);
  isSeeding = signal<boolean>(false);

  // Filters state
  searchValue = signal<string>('');
  selectedCategory = signal<number | null>(null);
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
  formMetaDescAr = signal<string>('');
  formMetaDescEn = signal<string>('');
  formMetaKeyAr = signal<string>('');
  formMetaKeyEn = signal<string>('');
  formForm = signal<string>('ORAL.SOLID');
  formPrice = signal<number>(10.0);
  formManufacturer = signal<string>('Pharma');
  formCategory = signal<number | undefined>(undefined);
  formCategoryNode = signal<TreeNode | null>(null);
  formRequiresPrescription = signal<boolean>(false);
  formIsActive = signal<boolean>(true);

  categoryTree = signal<TreeNode[]>([]);
  selectedCategoryNode = signal<TreeNode | null>(null);

  ngOnInit(): void {
    // Load categories
    this.categoryService.getCategoriesAsTree().subscribe((tree) => {
      this.categoryTree.set(tree);
    });
  }

  loadDrugs(): void {
    this.isLoading.set(true);
    this.drugs.set([]);

    const filters: DrugSearchRequest = {
      searchValue: this.searchValue().trim() || undefined,
      categoryId: this.selectedCategory(),
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

  onCategoryChange(event: any): void {
    if (event && event.node) {
      this.selectedCategory.set(event.node.data);
    } else {
      this.selectedCategory.set(null);
    }
    this.first.set(0);
    this.pageNumber.set(1);
    this.loadDrugs();
  }

  onCategoryClear(): void {
    this.selectedCategory.set(null);
    this.selectedCategoryNode.set(null);
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
    this.formMetaDescAr.set('');
    this.formMetaDescEn.set('');
    this.formMetaKeyAr.set('');
    this.formMetaKeyEn.set('');
    this.formForm.set('ORAL.SOLID');
    this.formPrice.set(10.0);
    this.formManufacturer.set('Pharma');
    this.formCategory.set(undefined);
    this.formCategoryNode.set(null);
    this.formRequiresPrescription.set(false);
    this.formIsActive.set(true);
    this.isFormDialogOpen.set(true);
  }

  openEditDialog(drug: DrugDto): void {
    this.isEditing.set(true);
    this.selectedDrug.set(drug);
    this.formArabicName.set(drug.arabicName ?? '');
    this.formBrandName.set(drug.brandName ?? '');
    this.formMetaDescAr.set(drug.metaDescriptionAr ?? '');
    this.formMetaDescEn.set(drug.metaDescriptionEn ?? '');
    this.formMetaKeyAr.set(drug.metaKeywordsAr ?? '');
    this.formMetaKeyEn.set(drug.metaKeywordsEn ?? '');
    this.formForm.set(drug.form ?? '');
    this.formPrice.set(drug.price ?? 0);
    this.formManufacturer.set(drug.manufacturer ?? '');
    this.formCategory.set(drug.categoryId ?? undefined);
    this.formCategoryNode.set(drug.categoryId ? this.findNodeById(this.categoryTree(), drug.categoryId) : null);
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
    if (!this.formArabicName().trim() || !this.formBrandName().trim()) {
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
        metaDescriptionAr: this.formMetaDescAr().trim(),
        metaDescriptionEn: this.formMetaDescEn().trim(),
        metaKeywordsAr: this.formMetaKeyAr().trim(),
        metaKeywordsEn: this.formMetaKeyEn().trim(),
        form: this.formForm().trim(),
        price: this.formPrice(),
        manufacturer: this.formManufacturer().trim(),
        categoryId: this.formCategory(),
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
        metaDescriptionAr: this.formMetaDescAr().trim(),
        metaDescriptionEn: this.formMetaDescEn().trim(),
        metaKeywordsAr: this.formMetaKeyAr().trim(),
        metaKeywordsEn: this.formMetaKeyEn().trim(),
        form: this.formForm().trim(),
        price: this.formPrice(),
        manufacturer: this.formManufacturer().trim(),
        categoryId: this.formCategory(),
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
  getCategoryLabel(category: any): string {
    return category?.nameAr ?? category?.nameEn ?? 'أخرى';
  }

  getCategorySeverity(category: any): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    return 'secondary';
  }

  getStatusLabel(drug: DrugDto): string {
    if (!drug.isActive) return 'غير نشط';
    return 'متوفر';
  }

  getStatusSeverity(drug: DrugDto): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    if (!drug.isActive) return 'danger';
    return 'success';
  }

  private findNodeById(nodes: TreeNode[], id: number): TreeNode | null {
    for (const node of nodes) {
      if (node.data === id) return node;
      if (node.children) {
        const found = this.findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  }
}
