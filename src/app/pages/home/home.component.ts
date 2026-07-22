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
  protected readonly title = signal('Pharma Link');

  categories = ['الوصفات الطبية', 'الصيدليات الشريكة', 'متابعة الطلبات', 'المخزون الدوائي', 'الدعم الفني'];

  faqs = [
    {
      q: 'كيف يمكنني إنشاء حساب مريض؟',
      a: 'اضغط على زر إنشاء حساب وسجل باستخدام بريدك الإلكتروني ورقم هاتفك، ثم قم بتأكيد حسابك عبر رمز التفعيل OTP المرسل إلى هاتفك.',
      open: false,
    },
    {
      q: 'هل يمكن للصيدليات إدارة فروع متعددة؟',
      a: 'نعم، تدعم المنصة ربط فروع متعددة بصيدليتك الرئيسية لتتمكن من التبديل بين الفروع ومتابعة مخزون وأوردرات كل فرع بسلاسة.',
      open: false,
    },
    {
      q: 'هل بياناتي ووصفاتي الطبية آمنة؟',
      a: 'بكل تأكيد. نطبق معايير أمان مشددة وجلسات تحقق مشفرة لضمان سرية وحماية كامل بيانات المرضى والوصفات الطبية المرفوعة.',
      open: false,
    },
  ];

  toggleFaq(index: number): void {
    this.faqs[index].open = !this.faqs[index].open;
  }
}
