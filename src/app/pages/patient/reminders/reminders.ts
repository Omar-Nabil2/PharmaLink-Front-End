import Swal from "sweetalert2";
import { Component, OnInit, OnDestroy, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subject, takeUntil, finalize, BehaviorSubject } from "rxjs";
import { RemindersService, ReminderDto, CreateReminderRequest } from "../../../core/services/reminders.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-reminders",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./reminders.html",
  styleUrl: "./reminders.scss",
})
export class Reminders implements OnInit, OnDestroy {
  minDate = new Date().toISOString().split("T")[0];

  private _reminders = new BehaviorSubject<ReminderDto[]>([]);
  reminders$ = this._reminders.asObservable();

  isLoading = true;
  error: string | null = null;
  saving = false;

  showDialog = false;
  editingId: string | null = null;

  form: CreateReminderRequest = this.emptyForm();

  private destroy$ = new Subject<void>();

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor(private svc: RemindersService) {}

  ngOnInit() { 
    this.load(); 
    this.route.queryParams.subscribe(params => {
      const action = params['action'];
      const id = params['id'];
      if (action && id) {
        this.processAction(action, id);
      }
    });
  }

  processAction(action: string, logId: string) {
    if (action === 'take') {
      // Typically, you'd have an endpoint to mark the log as taken
      Swal.fire({
        title: 'تم',
        text: 'تم تسجيل أخذ الجرعة بنجاح.',
        icon: 'success',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#0ea5e9'
      });
    } else if (action === 'snooze') {
      Swal.fire({
        title: 'تأجيل',
        text: 'تم تأجيل التذكير لمدة 15 دقيقة.',
        icon: 'info',
        confirmButtonText: 'حسناً',
        confirmButtonColor: '#0ea5e9'
      });
    }
    
    // Clear query params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { action: null, id: null },
      queryParamsHandling: 'merge'
    });
  }

  load() {
    this.isLoading = true;
    this.error = null;
    this.svc.getAll().pipe(takeUntil(this.destroy$), finalize(() => this.isLoading = false)).subscribe({
      next: (data) => this._reminders.next(data),
      error: () => this.error = "حدث خطأ أثناء تحميل المنبهات"
    });
  }

  get reminders(): ReminderDto[] {
    return this._reminders.getValue();
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
      startDate: r.startDate?.substring(0, 10) || "",
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

  addTime() { this.form.reminderTimes.push("08:00"); }

  removeTime(i: number) { this.form.reminderTimes.splice(i, 1); }

  save() {
    if (!this.form.medicineName?.trim() || this.form.reminderTimes.length === 0) return;
    this.saving = true;
    const req$ = this.editingId
      ? this.svc.update(this.editingId, this.form)
      : this.svc.create(this.form);
    req$.pipe(takeUntil(this.destroy$), finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.closeDialog();
        this.load();
        Swal.fire({ icon: "success", title: "تم الحفظ", text: "تم حفظ المنبه بنجاح", confirmButtonText: "حسناً", confirmButtonColor: "#007671", timer: 2500, timerProgressBar: true });
      },
      error: () => Swal.fire({ icon: "error", title: "خطأ", text: "حدث خطأ أثناء الحفظ", confirmButtonText: "حسناً", confirmButtonColor: "#007671" })
    });
  }

  toggle(r: ReminderDto) {
    this.svc.toggle(r.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        const updated = this._reminders.getValue().map(x => x.id === r.id ? { ...x, isActive: !x.isActive } : x);
        this._reminders.next(updated);
      },
      error: () => Swal.fire({ icon: "error", title: "خطأ", text: "حدث خطأ أثناء تحديث حالة المنبه", confirmButtonText: "حسناً", confirmButtonColor: "#007671" })
    });
  }

  delete(r: ReminderDto) {
    Swal.fire({
      title: "تأكيد الحذف",
      text: `هل تريد حذف منبه "${r.medicineName}"؟`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      reverseButtons: true
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.svc.delete(r.id).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this._reminders.next(this._reminders.getValue().filter(x => x.id !== r.id));
            Swal.fire({ icon: "success", title: "تم الحذف", text: "تم حذف المنبه بنجاح", confirmButtonText: "حسناً", confirmButtonColor: "#007671", timer: 2000, timerProgressBar: true });
          },
          error: () => Swal.fire({ icon: "error", title: "خطأ", text: "حدث خطأ أثناء الحذف", confirmButtonText: "حسناً", confirmButtonColor: "#007671" })
        });
      }
    });
  }

  formatTime(time: string): string {
    if (!time) return "";
    const [h, m] = time.split(":");
    let hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "م" : "ص";
    if (hour === 0) hour = 12;
    if (hour > 12) hour -= 12;
    return `${hour}:${m} ${suffix}`;
  }

  formatDate(date: string): string {
    if (!date) return "مستمر";
    return new Date(date).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
  }

  getDaysRemaining(endDate?: string): string {
    if (!endDate) return "مستمر";
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return "انتهى";
    if (days === 0) return "اليوم آخر يوم";
    return `${days} يوم متبقي`;
  }

  private emptyForm(): CreateReminderRequest {
    const today = new Date().toISOString().substring(0, 10);
    return { medicineName: "", dosage: "", notes: "", reminderTimes: ["08:00"], startDate: today, endDate: undefined, notifyByEmail: true, notifyByWhatsApp: false };
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
