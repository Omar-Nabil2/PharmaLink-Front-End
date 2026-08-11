import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PrescriptionAnalyticsComponent } from '@pages/pharmacist/prescription-analytics/prescription-analytics.component';
import { AiForecastingComponent } from '@pages/ai-forecasting/ai-forecasting.component';

export type OwnerAiTab = 'prescription-analytics' | 'ai-forecasting';

@Component({
  selector: 'app-owner-ai-assistant',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PrescriptionAnalyticsComponent,
    AiForecastingComponent
  ],
  templateUrl: './owner-ai-assistant.component.html',
  styleUrl: './owner-ai-assistant.component.scss'
})
export class OwnerAiAssistantComponent implements OnInit {
  private readonly router = inject(Router);

  readonly isSidebarOpen = signal<boolean>(true);
  readonly activeTab = signal<OwnerAiTab>('prescription-analytics');

  ngOnInit(): void {
    this.syncTabWithUrl();
  }

  private syncTabWithUrl(): void {
    const url = this.router.url;
    if (url.includes('ai-forecasting')) {
      this.activeTab.set('ai-forecasting');
    } else {
      this.activeTab.set('prescription-analytics');
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((v) => !v);
  }

  setTab(tab: OwnerAiTab): void {
    this.activeTab.set(tab);
    if (tab === 'ai-forecasting') {
      this.router.navigate(['/owner/ai-forecasting']);
    } else {
      this.router.navigate(['/owner/prescription-analytics']);
    }
  }
}
