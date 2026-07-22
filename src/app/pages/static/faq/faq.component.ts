import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  activeCategory = signal<string>('all');

  faqs = signal<FaqItem[]>([
    {
      id: 1,
      category: 'orders',
      question: 'كيف يمكنني رفع الوصفة الطبية (الروشتة) واختيار الصيدلية؟',
      answer: 'يمكنك الدخول إلى صفحة "رفع روشتة" وتصوير الروشتة أو اختيار صورة من جهازك، وسيتم توجيه الطلب إلى أقرب صيدلية لمراجعتها وإبلاغك بالتفاصيل والسعر.',
      isOpen: true,
    },
    {
      id: 2,
      category: 'orders',
      question: 'ما هي مدة توصيل الطلب إلى المنزل؟',
      answer: 'تستغرق عملية التوصيل من 30 إلى 60 دقيقة بناءً على المسافة بين الصيدلية وعنوانك المحدد.',
      isOpen: false,
    },
    {
      id: 3,
      category: 'pharmacies',
      question: 'كيف يمكن لصيدلي تسجيل صيدليته في منصة فارما لينك؟',
      answer: 'يمكن لصاحب الصيدلية التقديم عبر رابط "طلب انضمام صيدلية" ورفع ترخيص المنشأة وصورة السجل التجاري، وسيتم مراجعة الطلب من مسؤول النظام خلال 24 ساعة.',
      isOpen: false,
    },
    {
      id: 4,
      category: 'account',
      question: 'هل يمكنني إضافة أكثر من عنوان توصيل لحسابي؟',
      answer: 'نعم، يمكنك إضافة وتعديل عناوين متعددة (المنزل، العمل، إلخ) من صفحة الملف الشخصي واختيار العنوان المطلوب عند كل طلب.',
      isOpen: false,
    },
    {
      id: 5,
      category: 'payments',
      question: 'ما هي وسائل الدفع المتاحة داخل المنصة؟',
      answer: 'نوفر وسائل دفع متعددة تشمل الدفع نقداً عند الاستلام (COD)، والدفع بواسطة الكروت البنكية والمحافظ الإلكترونية.',
      isOpen: false,
    },
  ]);

  toggleFaq(faqId: number): void {
    this.faqs.update((items) =>
      items.map((item) =>
        item.id === faqId ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  }

  setCategory(cat: string): void {
    this.activeCategory.set(cat);
  }

  get filteredFaqs(): FaqItem[] {
    if (this.activeCategory() === 'all') return this.faqs();
    return this.faqs().filter((f) => f.category === this.activeCategory());
  }
}
