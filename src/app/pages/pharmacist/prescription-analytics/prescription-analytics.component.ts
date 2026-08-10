import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PrescriptionAnalyticsRagService } from '@core/services/prescription-analytics-rag.service';
import { SearchService } from '@core/services/search.service';
import { PharmacyBranchSearchDTO } from '@pages/inventory/search.model';
import {
  PrescriptionAnalyticsRagRequest,
  PrescriptionAnalyticsRagResponse,
  ShortageWarning,
  UrgencyLevel,
} from '@core/models/prescription-analytics-rag.model';

@Component({
  selector: 'app-prescription-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ChartModule,
    TableModule,
    BadgeModule,
    TooltipModule,
    AutoCompleteModule,
  ],
  templateUrl: './prescription-analytics.component.html',
  styleUrl: './prescription-analytics.component.scss',
})
export class PrescriptionAnalyticsComponent {
  private readonly ragService = inject(PrescriptionAnalyticsRagService);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal('');
  readonly result = signal<PrescriptionAnalyticsRagResponse | null>(null);
  readonly showAdvanced = signal(false);

  // ── Async Branch Lookup (mirrors Owner Dashboard / Inventory branch selector) ──
  readonly branchFilterSuggestions = signal<PharmacyBranchSearchDTO[]>([]);
  readonly selectedBranchFilter = signal<PharmacyBranchSearchDTO | null>(null);
  private readonly branchFilterQuery$ = new Subject<string>();

  readonly form: FormGroup = this.fb.group({
    question: ['', [Validators.required, Validators.minLength(5)]],
    branchId: [''],
    city: [''],
    governorate: [''],
    startDate: [''],
    endDate: [''],
  });

  constructor() {
    this.branchFilterQuery$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) => this.searchService.searchBranches(term)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.branchFilterSuggestions.set(results ?? []));
  }

  onBranchFilterSearch(query: string): void {
    this.branchFilterQuery$.next(query ?? '');
  }

  onBranchFilterSelected(branch: PharmacyBranchSearchDTO): void {
    this.selectedBranchFilter.set(branch);
    this.form.patchValue({ branchId: branch.branchId });
  }

  onBranchFilterCleared(): void {
    this.selectedBranchFilter.set(null);
    this.form.patchValue({ branchId: '' });
  }

  // ── Computed chart data ──────────────────────────────────────────────────

  readonly drugsChartData = computed(() => {
    const drugs = this.result()?.topPrescribedDrugs?.slice(0, 8) ?? [];
    return {
      labels: drugs.map((d) => d.medicineName),
      datasets: [
        {
          label: 'عدد الروشتات',
          data: drugs.map((d) => d.mentionCount),
          backgroundColor: drugs.map((_, i) =>
            i === 0
              ? '#007671'
              : i === 1
                ? '#00948B'
                : i === 2
                  ? '#0f9d76'
                  : `hsl(${160 + i * 18}, 55%, ${42 + i * 4}%)`,
          ),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  });

  readonly drugsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` ${ctx.raw} روشتة`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { family: 'Tajawal', size: 12 }, color: '#5e5e5e' },
        grid: { display: false },
      },
      y: {
        ticks: { font: { family: 'Tajawal', size: 11 }, color: '#5e5e5e' },
        grid: { color: '#f0f0f0' },
        beginAtZero: true,
      },
    },
  };

  readonly categoriesChartData = computed(() => {
    const allCats = this.result()?.mostRequestedCategories ?? [];
    const activeCats = allCats.filter((c) => c.count > 0);
    const cats = activeCats.length > 0 ? activeCats : allCats;

    return {
      labels: cats.map((c) => `${c.categoryName} (${c.percentage}%)`),
      datasets: [
        {
          data: cats.map((c) => c.count),
          backgroundColor: cats.map((c) => c.colorHint || '#007671'),
          hoverOffset: 8,
          borderWidth: 2,
          borderColor: '#ffffff',
        },
      ],
    };
  });

  readonly categoriesChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: { family: 'Tajawal', size: 12 },
          padding: 14,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const allCats = this.result()?.mostRequestedCategories ?? [];
            const activeCats = allCats.filter((c) => c.count > 0);
            const cats = activeCats.length > 0 ? activeCats : allCats;
            const item = cats[ctx.dataIndex];
            return item ? ` ${item.categoryName}: ${item.count} أصناف (${item.percentage}%)` : '';
          },
        },
      },
    },
    cutout: '65%',
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  toggleAdvanced(): void {
    this.showAdvanced.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;
    const selectedBranch = this.selectedBranchFilter();

    const request: PrescriptionAnalyticsRagRequest = {
      question: raw.question.trim(),
      branchId: selectedBranch?.branchId || raw.branchId?.trim() || null,
      city: raw.city?.trim() || null,
      governorate: raw.governorate?.trim() || null,
      startDate: raw.startDate || null,
      endDate: raw.endDate || null,
    };

    this.isLoading.set(true);
    this.hasError.set(false);
    this.result.set(null);

    this.ragService.queryAnalytics(request).subscribe({
      next: (response) => {
        this.result.set(response);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.hasError.set(true);
        this.errorMessage.set(
          err?.error?.message ?? 'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.',
        );
        this.isLoading.set(false);
      },
    });
  }

  reset(): void {
    this.form.reset();
    this.selectedBranchFilter.set(null);
    this.result.set(null);
    this.hasError.set(false);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  getUrgencyConfig(level: UrgencyLevel): {
    class: string;
    icon: string;
    label: string;
  } {
    const map: Record<UrgencyLevel, { class: string; icon: string; label: string }> = {
      Critical: { class: 'urgency-critical', icon: 'pi pi-exclamation-triangle', label: 'حرج' },
      High: { class: 'urgency-high', icon: 'pi pi-arrow-up', label: 'مرتفع' },
      Medium: { class: 'urgency-medium', icon: 'pi pi-info-circle', label: 'متوسط' },
    };
    return map[level] ?? map['Medium'];
  }

  hasResults(): boolean {
    const r = this.result();
    return !!r && r.totalPrescriptionsAnalyzed > 0;
  }

  hasNoData(): boolean {
    const r = this.result();
    return !!r && r.usedProvider === 'NoData';
  }

  formatScore(score: number): string {
    return (score * 100).toFixed(1) + '%';
  }

  trackByDrug(_: number, d: { medicineName: string }): string {
    return d.medicineName;
  }

  trackByWarning(_: number, w: ShortageWarning): string {
    return w.drugName;
  }

  get questionCtrl() {
    return this.form.get('question');
  }

  // Quick-prompt suggestions
  readonly suggestions = [
    'ما هي أكثر أدوية السكر طلباً خلال الشهر الماضي؟',
    'ما أكثر أدوية الأطفال المرفوعة في الروشتات؟',
    'ما هي المضادات الحيوية الأكثر وصفاً في الفترة الأخيرة؟',
    'أدوية ضغط الدم الأكثر طلباً هذا الأسبوع؟',
  ];

  applySuggestion(text: string): void {
    this.form.get('question')?.setValue(text);
  }
}
