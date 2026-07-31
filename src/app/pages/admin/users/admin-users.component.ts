import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';

import { AdminUsersService } from './admin-users.service';
import { AdminUserDto, AdminUserFilterDto, UserStatus, PaginatedList } from './admin-users.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ToastModule, ConfirmDialogModule, DialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  private readonly usersService = inject(AdminUsersService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // State
  users = signal<AdminUserDto[]>([]);
  totalCount = signal<number>(0);
  isLoading = signal<boolean>(false);
  
  // Filters
  filter = signal<AdminUserFilterDto>({
    pageNumber: 1,
    pageSize: 10,
    search: '',
    role: undefined,
    status: undefined
  });

  // UI State
  selectedUser = signal<AdminUserDto | null>(null);
  isDetailsModalOpen = signal<boolean>(false);
  
  // Options
  roleOptions = [
    { label: 'الكل', value: null },
    { label: 'مريض', value: 'Patient' },
    { label: 'صيدلي', value: 'Pharmacist' },
    { label: 'مدير صيدلية', value: 'PharmacyAdmin' },
    { label: 'مدير نظام', value: 'Admin' }
  ];

  statusOptions = [
    { label: 'الكل', value: null },
    { label: 'نشط', value: UserStatus.Active },
    { label: 'غير نشط', value: UserStatus.Inactive }
  ];

  // Computed
  totalPages = computed(() => Math.ceil(this.totalCount() / this.filter().pageSize));
  pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  hasPreviousPage = computed(() => this.filter().pageNumber > 1);
  hasNextPage = computed(() => this.filter().pageNumber < this.totalPages());

  // Enums for HTML
  UserStatus = UserStatus;

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.usersService.getUsers(this.filter()).subscribe({
      next: (res) => {
        this.users.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'حدث خطأ أثناء تحميل المستخدمين' });
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange() {
    this.updateFilter({ pageNumber: 1 });
  }

  onFilterChange() {
    this.updateFilter({ pageNumber: 1 });
  }

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.updateFilter({ pageNumber: newPage });
    }
  }

  private updateFilter(partial: Partial<AdminUserFilterDto>) {
    this.filter.update(f => ({ ...f, ...partial }));
    this.loadUsers();
  }

  toggleSort(field: string) {
    const current = this.filter();
    if (current.sortBy === field) {
      // Toggle direction
      if (current.sortDirection === 'asc') {
        this.updateFilter({ sortDirection: 'desc' });
      } else {
        // Remove sort
        this.updateFilter({ sortBy: undefined, sortDirection: undefined });
      }
    } else {
      // Set new sort
      this.updateFilter({ sortBy: field, sortDirection: 'asc' });
    }
  }

  getSortIcon(field: string): string {
    const current = this.filter();
    if (current.sortBy !== field) return 'pi-sort-alt text-muted-foreground/30';
    return current.sortDirection === 'asc' ? 'pi-sort-amount-up-alt text-[#007671]' : 'pi-sort-amount-down text-[#007671]';
  }

  getRoleArabic(role: string): string {
    switch (role) {
      case 'Patient': return 'مريض';
      case 'Pharmacist': return 'صيدلي';
      case 'PharmacyAdmin': return 'مدير صيدلية';
      case 'Admin': return 'مدير نظام';
      default: return role;
    }
  }

  viewDetails(user: AdminUserDto) {
    this.selectedUser.set(user);
    this.isDetailsModalOpen.set(true);
  }

  closeDetailsModal() {
    this.isDetailsModalOpen.set(false);
    this.selectedUser.set(null);
  }

  toggleStatus(user: AdminUserDto) {
    const isCurrentlyActive = user.status === UserStatus.Active;
    const newStatus = isCurrentlyActive ? UserStatus.Inactive : UserStatus.Active;
    const actionText = isCurrentlyActive ? 'إلغاء تنشيط' : 'تنشيط';
    
    this.confirmationService.confirm({
      message: `هل أنت متأكد أنك تريد ${actionText} حساب "${user.fullName}"؟`,
      header: 'تأكيد تغيير حالة الحساب',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'نعم، قم بالتأكيد',
      rejectLabel: 'إلغاء',
      acceptButtonStyleClass: isCurrentlyActive ? 'p-button-danger' : 'p-button-success',
      accept: () => {
        this.usersService.updateUserStatus(user.id, { status: newStatus }).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'نجاح', detail: `تم ${actionText} الحساب بنجاح` });
            this.loadUsers();
          },
          error: (err) => {
            let msg = 'حدث خطأ أثناء تغيير حالة الحساب';
            if (err.error?.code === 'AdminUser.CannotDeactivateSelf') {
              msg = 'لا يمكنك إلغاء تنشيط حسابك الخاص';
            }
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: msg });
          }
        });
      }
    });
  }
}
