import {
  ChangeDetectionStrategy,
  Component,
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
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '@environments/environment';
import { PrescriptionAnalyticsRagService } from '@core/services/prescription-analytics-rag.service';
import {
  PrescriptionAnalyticsRagRequest,
  PrescriptionAnalyticsRagResponse,
  PrescriptionAnalyticsSource,
  PrescribedDrugMetric,
} from '@core/models/prescription-analytics-rag.model';

@Component({
  selector: 'app-prescription-analytics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChartModule,
    TableModule,
    DialogModule,
    TooltipModule,
  ],
  templateUrl: './prescription-analytics.component.html',
  styleUrl: './prescription-analytics.component.scss',
})
export class PrescriptionAnalyticsComponent {
  private readonly ragService = inject(PrescriptionAnalyticsRagService);
  private readonly fb = inject(FormBuilder);

  readonly isLoading = signal(false);
  readonly hasError = signal(false);
  readonly errorMessage = signal('');
  readonly result = signal<PrescriptionAnalyticsRagResponse | null>(null);
  readonly selectedImage = signal<string | null>(null);
  readonly isImageModalOpen = signal(false);

  readonly form: FormGroup = this.fb.group({
    question: ['', [Validators.required, Validators.minLength(3)]],
  });

  // Quick-prompt suggestions in Native Egyptian Arabic
  readonly suggestions = [
    'إيه أكتر أدوية السكر اللي اطلبت الفترة الأخيرة؟',
    'إيه أكتر المضادات الحيوية الواردة في الروشتات في شبرا الخيمة؟',
    'إيه أكتر أدوية الضغط والمعدة اللي اتكررت في الروشتات؟',
    'إيه أكتر أدوية الأطفال والمكملات اللي اطلبت في القليوبية؟',
    'أكتر الفيتامينات وأدوية العظام اللي اتكتبت مؤخراً إيه؟',
  ];

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
    const cats = this.result()?.mostRequestedCategories ?? [];

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
    layout: {
      padding: {
        top: 15,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { family: 'Tajawal', size: 12 },
          padding: 14,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        padding: 10,
        boxPadding: 6,
        bodyFont: { family: 'Tajawal', size: 12 },
        titleFont: { family: 'Tajawal', size: 12 },
        callbacks: {
          label: (ctx: any) => {
            const cats = this.result()?.mostRequestedCategories ?? [];
            const item = cats[ctx.dataIndex];
            return item ? ` ${item.categoryName}: ${item.count} روشتات (${item.percentage}%)` : '';
          },
        },
      },
    },
    cutout: '62%',
  };

  // ── Actions ──────────────────────────────────────────────────────────────

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request: PrescriptionAnalyticsRagRequest = {
      question: this.form.value.question.trim(),
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
          err?.error?.error ??
          err?.error?.message ??
          'حدث خطأ أثناء معالجة الطلب. يرجى المحاولة مرة أخرى.',
        );
        this.isLoading.set(false);
      },
    });
  }

  reset(): void {
    this.form.reset();
    this.result.set(null);
    this.hasError.set(false);
  }

  applySuggestion(text: string): void {
    this.form.get('question')?.setValue(text);
  }

  get questionCtrl() {
    return this.form.get('question');
  }

  hasResults(): boolean {
    const r = this.result();
    return !!r && (r.totalPrescriptionsAnalyzed > 0 || r.sources.length > 0);
  }

  hasNoMatches(): boolean {
    const r = this.result();
    return !!r && (!r.hasMatches || (r.totalPrescriptionsAnalyzed === 0 && r.sources.length === 0));
  }

  formatScore(score: number): string {
    return (score * 100).toFixed(1) + '%';
  }

  getShortId(guid: string): string {
    if (!guid) return '';
    return guid.substring(0, 8);
  }

  getImageUrl(path: string | undefined | null): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const serverUrl = environment.baseUrl.replace('/api/v1', '');
    return `${serverUrl}/${path.replace(/^\//, '')}`;
  }

  openImageModal(url: string): void {
    const fullUrl = this.getImageUrl(url);
    if (fullUrl) {
      this.selectedImage.set(fullUrl);
      this.isImageModalOpen.set(true);
    }
  }

  closeImageModal(): void {
    this.isImageModalOpen.set(false);
    this.selectedImage.set(null);
  }

  trackByDrug(_: number, d: PrescribedDrugMetric): string {
    return d.medicineName;
  }

  trackBySource(_: number, source: PrescriptionAnalyticsSource): string {
    return source.prescriptionId;
  }
}
