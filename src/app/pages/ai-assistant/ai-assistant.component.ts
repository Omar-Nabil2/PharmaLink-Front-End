import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '@core/services/ai-assistant.service';
import { DrugService } from '@core/services/drug.service';
import { DrugDto } from '@core/interfaces/drug.interface';
import { AutoCompleteModule } from 'primeng/autocomplete';
import {
  ChatMessage,
  DrugInfoResult,
  DrugInteraction,
  InteractionCheckResult,
} from '@core/interfaces/ai-assistant.interface';

type ActiveTab = 'chat' | 'drug-info' | 'interactions';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoCompleteModule],
  templateUrl: './ai-assistant.component.html',
  styleUrl: './ai-assistant.component.scss',
})
export class AiAssistantComponent implements OnInit, OnDestroy {
  private readonly service = inject(AiAssistantService);
  private readonly drugService = inject(DrugService);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab = signal<ActiveTab>('chat');

  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
  }

  // ── Chat Tab ──────────────────────────────────────────────────────────────
  @ViewChild('chatScroll') chatScroll!: ElementRef<HTMLDivElement>;

  messages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'مرحباً! أنا مساعد فارما لينك الذكي 🤖\nيمكنني مساعدتك في:\n• معلومات الأدوية\n• تفاعلات الأدوية\n• الجرعات والتحذيرات\n\nاسألني أي سؤال عن الأدوية!',
    },
  ]);
  chatInput = '';
  isChatLoading = signal(false);
  chatError = signal('');
  isStreaming = signal(false);

  async sendMessage(): Promise<void> {
    const text = this.chatInput.trim();
    if (!text || this.isChatLoading()) return;

    this.chatInput = '';
    this.chatError.set('');

    // Push user message
    const updatedMsgs = [
      ...this.messages(),
      { role: 'user' as const, content: text, timestamp: new Date() },
    ];
    this.messages.set(updatedMsgs);

    // Build history (exclude first system greeting)
    const history = updatedMsgs
      .filter((m) => m.content !== updatedMsgs[0]?.content || updatedMsgs.indexOf(m) !== 0)
      .map((m) => ({ role: m.role, content: m.content }));

    // Add placeholder for AI reply
    const placeholderIdx = updatedMsgs.length;
    this.messages.set([
      ...updatedMsgs,
      { role: 'assistant', content: '', isStreaming: true, timestamp: new Date() },
    ]);
    this.isChatLoading.set(true);
    this.isStreaming.set(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      let fullReply = '';

      for await (const chunk of this.service.chatStream(text, history, token)) {
        fullReply += chunk;
        const current = this.messages();
        const updated = [...current];
        updated[placeholderIdx] = {
          role: 'assistant',
          content: fullReply,
          isStreaming: true,
          timestamp: new Date(),
        };
        this.messages.set(updated);
        this.scrollToBottom();
      }

      // Mark streaming done
      const current = this.messages();
      const updated = [...current];
      updated[placeholderIdx] = {
        role: 'assistant',
        content: fullReply || 'عذراً، لم أتمكن من الرد.',
        isStreaming: false,
        timestamp: new Date(),
      };
      this.messages.set(updated);
    } catch {
      // Fall back to non-streaming
      try {
        const history2 = updatedMsgs.map((m) => ({ role: m.role, content: m.content }));
        this.service.chat(text, history2).subscribe({
          next: (res) => {
            const current = this.messages();
            const updated = [...current];
            updated[placeholderIdx] = {
              role: 'assistant',
              content: res.reply,
              isStreaming: false,
              timestamp: new Date(),
            };
            this.messages.set(updated);
          },
          error: (err) => {
            const msg = err?.error?.message || 'تعذر الاتصال بالمساعد الذكي.';
            this.chatError.set(msg);
            const current = this.messages();
            const updated = current.slice(0, placeholderIdx);
            this.messages.set(updated);
          },
        });
      } catch {
        this.chatError.set('تعذر الاتصال بالمساعد الذكي.');
        const current = this.messages();
        this.messages.set(current.slice(0, placeholderIdx));
      }
    } finally {
      this.isChatLoading.set(false);
      this.isStreaming.set(false);
      this.scrollToBottom();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.messages.set([
      {
        role: 'assistant',
        content: 'مرحباً! أنا مساعد فارما لينك الذكي 🤖\nيمكنني مساعدتك في:\n• معلومات الأدوية\n• تفاعلات الأدوية\n• الجرعات والتحذيرات\n\nاسألني أي سؤال عن الأدوية!',
      },
    ]);
    this.chatError.set('');
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScroll?.nativeElement) {
        this.chatScroll.nativeElement.scrollTop = this.chatScroll.nativeElement.scrollHeight;
      }
    }, 50);
  }

  // ── Drug Info Tab ──────────────────────────────────────────────────────────
  drugSearchQuery: any = '';
  drugInfo = signal<DrugInfoResult | null>(null);
  isDrugLoading = signal(false);
  drugError = signal('');
  expandedSections = signal<Record<string, boolean>>({});

  drugSuggestions = signal<DrugDto[]>([]);

  // ── Interactions Tab ───────────────────────────────────────────────────────
  drugChipInput: any = '';
  drugChips = signal<string[]>([]);
  interactionResult = signal<InteractionCheckResult | null>(null);
  isInteractionLoading = signal(false);
  interactionError = signal('');

  interactionSuggestions = signal<DrugDto[]>([]);

  ngOnInit(): void {}

  filterDrugs(event: any): void {
    const query = event.query;
    if (!query || query.trim().length === 0) {
      this.drugSuggestions.set([]);
      this.interactionSuggestions.set([]);
      return;
    }
    this.drugService.searchDrugs({ searchValue: query, pageNumber: 1, pageSize: 10 }).subscribe({
      next: (res) => {
        this.drugSuggestions.set(res.items || []);
        this.interactionSuggestions.set(res.items || []);
      },
      error: () => {
        this.drugSuggestions.set([]);
        this.interactionSuggestions.set([]);
      }
    });
  }

  onDrugSelect(event: any): void {
    // PrimeNG AutoComplete sends the selected object
    const drug: DrugDto = event.value;
    this.drugSearchQuery = drug.brandName;
    this.searchDrug();
  }

  onInteractionDrugSelect(event: any): void {
    const drug: DrugDto = event.value;
    this.drugChipInput = drug.brandName;
    this.addDrugChip();
  }

  searchDrug(): void {
    const name = typeof this.drugSearchQuery === 'string' ? this.drugSearchQuery.trim() : (this.drugSearchQuery?.brandName || '');
    if (!name) return;

    this.isDrugLoading.set(true);
    this.drugError.set('');
    this.drugInfo.set(null);
    this.expandedSections.set({});

    this.service.getDrugInfo(name).subscribe({
      next: (data) => {
        this.drugInfo.set(data);
        this.isDrugLoading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || err?.error?.detail || 'لم يتم العثور على معلومات هذا الدواء.';
        this.drugError.set(msg);
        this.isDrugLoading.set(false);
      },
    });
  }

  onDrugKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.searchDrug();
  }

  toggleSection(section: string): void {
    const current = this.expandedSections();
    this.expandedSections.set({ ...current, [section]: !current[section] });
  }

  isSectionExpanded(section: string): boolean {
    return !!this.expandedSections()[section];
  }


  addDrugChip(): void {
    const name = typeof this.drugChipInput === 'string' ? this.drugChipInput.trim() : (this.drugChipInput?.brandName || '');
    if (!name) return;
    if (this.drugChips().includes(name)) {
      this.drugChipInput = '';
      return;
    }
    this.drugChips.set([...this.drugChips(), name]);
    this.drugChipInput = '';
  }

  removeDrugChip(drug: string): void {
    this.drugChips.set(this.drugChips().filter((d) => d !== drug));
  }

  onChipKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addDrugChip();
    }
    if (event.key === 'Backspace' && !this.drugChipInput && this.drugChips().length > 0) {
      const chips = this.drugChips();
      this.drugChips.set(chips.slice(0, -1));
    }
  }

  checkInteractions(): void {
    const drugs = this.drugChips();
    if (drugs.length < 2) {
      this.interactionError.set('يرجى إضافة دواءين على الأقل للفحص.');
      return;
    }

    this.isInteractionLoading.set(true);
    this.interactionError.set('');
    this.interactionResult.set(null);

    this.service.checkInteractions(drugs).subscribe({
      next: (data) => {
        this.interactionResult.set(data);
        this.isInteractionLoading.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message || 'تعذر فحص التفاعلات الدوائية.';
        this.interactionError.set(msg);
        this.isInteractionLoading.set(false);
      },
    });
  }

  getSeverityClass(severity: DrugInteraction['severity']): string {
    switch (severity) {
      case 'None':
        return 'severity-none';
      case 'Minor':
        return 'severity-minor';
      case 'Moderate':
        return 'severity-moderate';
      case 'Severe':
        return 'severity-severe';
      case 'Contraindicated':
        return 'severity-contraindicated';
      default:
        return 'severity-none';
    }
  }

  getSeverityLabel(severity: DrugInteraction['severity']): string {
    switch (severity) {
      case 'None':
        return 'لا يوجد';
      case 'Minor':
        return 'خفيف';
      case 'Moderate':
        return 'متوسط';
      case 'Severe':
        return 'شديد';
      case 'Contraindicated':
        return 'ممنوع';
      default:
        return severity;
    }
  }

  getOverallSeverityClass(result: InteractionCheckResult): string {
    if (!result.interactions.length) return 'banner-safe';
    const severities = result.interactions.map((i) => i.severity);
    if (severities.includes('Contraindicated')) return 'banner-contraindicated';
    if (severities.includes('Severe') || result.hasSevereInteractions) return 'banner-severe';
    if (severities.includes('Moderate')) return 'banner-moderate';
    if (severities.includes('Minor')) return 'banner-minor';
    return 'banner-safe';
  }

  formatMessageContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  ngOnDestroy(): void {}
}
