import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { RemindersService, ReminderDto, CreateReminderRequest } from '../../../core/services/reminders.service';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reminders.html',
  styleUrl: './reminders.scss',
})
export class Reminders implements OnInit, OnDestroy {
  reminders: ReminderDto[] = [];
  isLoading = true;
  error: string | null = null;
  saving = false;

  showDialog = false;
  editingId: string | null = null;

  form: CreateReminderRequest = this.emptyForm();

  private destroy$ = new Subject<void>();

  constructor(private svc: RemindersService) {}

  ngOnInit() { this.load(); }

  load() {
    this.isLoading = true;
    this.error = null;
    this.svc.getAll().pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false)).subscribe({
      next: (data) => this.reminders = data,
      error: () => this.error = 'حدث خطأ أثناء تحميل المنبهات'
    });
  }

  openAdd() {
    this.form = this.emptyForm();
    this.editingId = null;
    this.showDialog = true;
  }

  openEdit(r: ReminderDto) {
    this.form = {
      medicineName: r.medicineName,
      dosage: r.dosage,
      notes: r.notes,
      reminderTimes: [...r.reminderTimes],
      startDate: r.startDate?.substring(0, 10),
      endDate: r.endDate?.substring(0, 10),
      notifyByEmail: r.notifyByEmail,
      notifyByWhatsApp: r.notifyByWhatsApp
    };
    this.editingId = r.id;
    this.showDialog = true;
  }

  closeDialog() {
    this.showDialog = false;
    this.editingId = null;
  }

  addTime() {
    this.form.reminderTimes.push('08:00');
  }

  removeTime(i: number) {
    this.form.reminderTimes.splice(i, 1);
  }

  save() {
    if (!this.form.medicineName?.trim() || this.form.reminderTimes.length === 0) return;
    this.saving = true;
    const req$ = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    req$.pipe(takeUntil(this.destroy$), finalize(() => this.saving = false)).subscribe({
      next: () => { this.closeDialog(); this.load(); },
      error: () => alert('حدث خطأ أثناء الحفظ')
    });
  }

  toggle(r: ReminderDto) {
    this.svc.toggle(r.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => r.isActive = !r.isActive,
      error: () => alert('حدث خطأ')
    });
  }

  delete(r: ReminderDto) {
    if (!confirm(`هل تريد حذف منبه "${r.medicineName}"؟`)) return;
    this.svc.delete(r.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => this.reminders = this.reminders.filter(x => x.id !== r.id),
      error: () => alert('حدث خطأ أثناء الحذف')
    });
  }

  formatTimes(times: string[]): string {
    return times.join(' ، ');
  }

  getDaysRemaining(endDate?: string): string {
    if (!endDate) return 'مستمر';
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return 'انتهى';
    if (days === 0) return 'اليوم آخر يوم';
    return `${days} يوم متبقي`;
  }

  private emptyForm(): CreateReminderRequest {
    const today = new Date().toISOString().substring(0, 10);
    return {
      medicineName: '',
      dosage: '',
      notes: '',
      reminderTimes: ['08:00'],
      startDate: today,
      endDate: undefined,
      notifyByEmail: true,
      notifyByWhatsApp: false
    };
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
