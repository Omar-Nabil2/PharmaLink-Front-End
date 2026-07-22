import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface CategoryItem {
  name: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly title = signal('فارما لينك');

  categories: CategoryItem[] = [
    { name: 'مسكنات الألم', icon: 'pi pi-bolt', link: '/products' },
    { name: 'مضادات حيوية', icon: 'pi pi-shield', link: '/products' },
    { name: 'الجهاز الهضمي', icon: 'pi pi-heart', link: '/products' },
    { name: 'السكري', icon: 'pi pi-chart-line', link: '/products' },
    { name: 'ضغط الدم', icon: 'pi pi-heart-fill', link: '/products' },
    { name: 'القلب والأوعية', icon: 'pi pi-sync', link: '/products' },
  ];

  faqs = [
    {
      q: 'كيف يمكنني طلب دواء بواسطة صورة الروشتة الطبية؟',
      a: 'يمكنك الدخول على قسم "رفع روشتة"، التقاط صورة سريعة للروشتة، وسيتم توجيهها فوراً لأقرب صيدلي معتمد لمراجعتها وتجهيز الطلب.',
      open: true,
    },
    {
      q: 'كيف تضمن فارما لينك سلامة ودقة صرف الأدوية؟',
      a: 'جميع الطلبات تمر بمراجعة دقيقة من قبل صيدلي مرخص قبل الاعتماد، وتُصرف مباشرة من صيدليات معتمدة رسمياً.',
      open: false,
    },
    {
      q: 'هل يمكن للصيدليات إدارة أكثر من فرع ومتابعة الطلبات لحظياً؟',
      a: 'نعم، توفر فارما لينك لوحة تحكم متكاملة للصيدليات وملاك الفروع لإدارة المخزون، توزيع الأدوار، وتتبع طلبات المرضى والتوصيل.',
      open: false,
    },
    {
      q: 'ما هي طرق الدفع المتاحة على المنصة؟',
      a: 'نوفر خيارات الدفع عند الاستلام (نقداً)، بالإضافة للدفع الإلكتروني الآمن بواسطة بطاقات البنك والمحافظ الإلكترونية.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
