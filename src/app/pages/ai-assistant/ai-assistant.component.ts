import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AiAssistantService } from '@core/services/ai-assistant.service';
import { SearchService } from '@core/services/search.service';
import { MedicineSearchDTO } from '@pages/inventory/search.model';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { marked } from 'marked';
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
  private readonly searchService = inject(SearchService);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  activeTab = signal<ActiveTab>('chat');
  isSidebarOpen = signal<boolean>(true);



  setTab(tab: ActiveTab): void {
    this.activeTab.set(tab);
    // Optionally close sidebar on mobile when a tab is selected
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      this.isSidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update((val) => !val);
  }

  // ── Chat Tab ──────────────────────────────────────────────────────────────
  @ViewChild('chatScroll') chatScroll!: ElementRef<HTMLDivElement>;

  messages = signal<ChatMessage[]>(this.loadMessages());
  chatInput = '';
  isChatLoading = signal(false);
  isStreaming = signal(false);

  constructor() {
    effect(() => {
      // Auto-save to localStorage whenever messages change
      if (typeof window !== 'undefined') {
        const msgsToSave = this.messages().filter(m => !m.isError && !m.isStreaming);
        localStorage.setItem('ai_chat_history', JSON.stringify(msgsToSave));
      }
    });
  }

  private loadMessages(): ChatMessage[] {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ai_chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return [
      {
        role: 'assistant',
        content: 'مرحباً! أنا دكتور زياد 👨‍⚕️ (الصيدلي الذكي الخاص بفارما لينك)\nيمكنني مساعدتك في:\n• معلومات الأدوية\n• تفاعلات الأدوية\n• الجرعات والتحذيرات\n\nاسألني أي سؤال عن الأدوية!',
      },
    ];
  }

  async sendMessage(): Promise<void> {
    const text = this.chatInput.trim();
    if (!text || this.isChatLoading()) return;

    this.chatInput = '';

    // Build history (exclude first system greeting, errors, and the current message)
    const history = this.messages()
      .filter((m) => m.content !== this.messages()[0]?.content && !m.isError)
      .map((m) => ({ role: m.role, content: m.content }));

    // Push user message
    const updatedMsgs = [
      ...this.messages(),
      { role: 'user' as const, content: text, timestamp: new Date() },
    ];
    this.messages.set(updatedMsgs);

    // Add placeholder for AI reply
    const placeholderIdx = updatedMsgs.length;
    this.messages.set([
      ...updatedMsgs,
      { role: 'assistant', content: '', isStreaming: true, timestamp: new Date() },
    ]);
    this.isChatLoading.set(true);
    this.isStreaming.set(true);
    this.scrollToBottom();

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      let fullReply = '';
      let displayedReply = '';
      
      const typeInterval = setInterval(() => {
        if (displayedReply.length < fullReply.length) {
          const diff = fullReply.length - displayedReply.length;
          
          // Smooth out typing: 1 char usually, up to 5 chars if there's a huge backlog.
          let charsToAdd = 1;
          if (diff > 20) charsToAdd = 2;
          if (diff > 50) charsToAdd = 3;
          if (diff > 100) charsToAdd = 4;
          if (diff > 200) charsToAdd = 5;
          
          displayedReply += fullReply.slice(displayedReply.length, displayedReply.length + charsToAdd);
          
          const current = this.messages();
          const updated = [...current];
          updated[placeholderIdx] = {
            role: 'assistant',
            content: displayedReply,
            isStreaming: true,
            timestamp: new Date(),
          };
          this.messages.set(updated);
          this.scrollToBottom();
        }
      }, 30);

      for await (const chunk of this.service.chatStream(text, history, token)) {
        fullReply += chunk;
      }
      
      while (displayedReply.length < fullReply.length) {
        await new Promise(r => setTimeout(r, 50));
      }
      
      clearInterval(typeInterval);

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
        const history2 = updatedMsgs
          .filter(m => !m.isError)
          .map((m) => ({ role: m.role, content: m.content }));
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
            this.scrollToBottom();
          },
          error: (err) => {
            const msg = err?.error?.message || 'تعذر الاتصال بالمساعد الذكي.';
            const current = this.messages();
            const updated = [...current];
            updated[placeholderIdx] = {
              role: 'assistant',
              content: msg,
              isStreaming: false,
              isError: true,
              timestamp: new Date(),
            };
            this.messages.set(updated);
            this.scrollToBottom();
          },
        });
      } catch {
        const current = this.messages();
        const updated = [...current];
        updated[placeholderIdx] = {
          role: 'assistant',
          content: 'تعذر الاتصال بالمساعد الذكي.',
          isStreaming: false,
          isError: true,
          timestamp: new Date(),
        };
        this.messages.set(updated);
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

  trackByMessage(index: number, msg: ChatMessage): number {
    return index;
  }

  clearChat(): void {
    this.messages.set([
      {
        role: 'assistant',
        content: 'مرحباً! أنا دكتور زياد 👨‍⚕️ (الصيدلي الذكي الخاص بفارما لينك)\nيمكنني مساعدتك في:\n• معلومات الأدوية\n• تفاعلات الأدوية\n• الجرعات والتحذيرات\n\nاسألني أي سؤال عن الأدوية!',
      },
    ]);
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.chatScroll?.nativeElement) {
        this.chatScroll.nativeElement.scrollTo({
          top: this.chatScroll.nativeElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 50);
  }

  // ── Drug Info Tab ──────────────────────────────────────────────────────────
  drugSearchQuery: any = '';
  drugInfo = signal<DrugInfoResult | null>(null);
  isDrugLoading = signal(false);
  drugError = signal('');
  expandedSections = signal<Record<string, boolean>>({});

  drugSuggestions = signal<MedicineSearchDTO[]>([]);

  // ── Interactions Tab ───────────────────────────────────────────────────────
  drugChipInput: any = '';
  drugChips = signal<string[]>([]);
  interactionResult = signal<InteractionCheckResult | null>(null);
  isInteractionLoading = signal(false);
  interactionError = signal('');

  interactionSuggestions = signal<MedicineSearchDTO[]>([]);

  ngOnInit(): void {}

  filterDrugs(event: any): void {
    const query = event.query;
    if (!query || query.trim().length === 0) {
      this.drugSuggestions.set([]);
      this.interactionSuggestions.set([]);
      return;
    }
    this.searchService.searchMedicines(query).subscribe({
      next: (res) => {
        this.drugSuggestions.set(res || []);
        this.interactionSuggestions.set(res || []);
      },
      error: () => {
        this.drugSuggestions.set([]);
        this.interactionSuggestions.set([]);
      }
    });
  }

  onDrugSelect(event: any): void {
    // PrimeNG AutoComplete sends the selected object
    const drug: MedicineSearchDTO = event.value;
    this.drugSearchQuery = drug.name;
    this.searchDrug();
  }

  onInteractionDrugSelect(event: any): void {
    const drug: MedicineSearchDTO = event.value;
    this.drugChipInput = drug.name;
    this.addDrugChip();
  }

  searchDrug(): void {
    const name = typeof this.drugSearchQuery === 'string' ? this.drugSearchQuery.trim() : (this.drugSearchQuery?.name || '');
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
    const name = typeof this.drugChipInput === 'string' ? this.drugChipInput.trim() : (this.drugChipInput?.name || '');
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

  getSeverityLabel(severity: string): string {
    switch (severity) {
      case 'None':
        return 'لا توجد تفاعلات';
      case 'Minor':
        return 'تفاعل طفيف';
      case 'Moderate':
        return 'تفاعل متوسط';
      case 'Severe':
        return 'تفاعل خطير';
      case 'Contraindicated':
        return 'ممنوع الاستخدام معاً';
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

  parseMarkdown(content: string): string {
    if (!content) return '';
    return marked.parse(content, { async: false }) as string;
  }

  ngOnDestroy(): void {}
}
