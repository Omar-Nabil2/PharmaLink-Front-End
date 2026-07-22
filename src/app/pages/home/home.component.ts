import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  protected readonly title = signal('فارما لينك');

  categories = [
    'الروشتات والوصفات',
    'دليل الصيدليات',
    'متابعة الطلبات',
    'المخزون الدوائي',
    'الدعم المباشر',
  ];

  faqs = [
    {
      q: 'كيف يمكنني إنشاء حساب مريض جديد؟',
      a: 'يمكنك التسجيل بسهولة بإدخال الاسم ورقم الهاتف والبريد الإلكتروني، ثم تفعيل الحساب عبر رمز التحقيق المرسل لهاتفك.',
      open: false,
    },
    {
      q: 'هل يمكن للصيدلية إدارة أكثر من فرع ومكان؟',
      a: 'نعم، تتيح لك المنصة إضافة وإدارة جميع فروع صيدليتك ومتابعة طلبات كل فرع بشكل مستقل ومباشر.',
      open: false,
    },
    {
      q: 'كيف تضمن فارما لينك أمان البيانات والوصفات الطبية؟',
      a: 'نستخدم أعلى معايير التشفير وحماية البيانات مع مراجعة دقيقة لكل وصفة من صيادلة مرخصين لضمان أعلى درجات الأمان.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
