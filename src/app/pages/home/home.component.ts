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
    { name: 'عناية بالبشرة', image: '/images/categories/cat-skincare.png' },
    { name: 'عناية بالطفل', image: '/images/categories/cat-baby.png' },
    { name: 'فيتامينات ومكملات', image: '/images/categories/cat-vitamins.png' },
    { name: 'عناية بالشعر', image: '/images/categories/cat-hair.png' },
    { name: 'عناية شخصية', image: '/images/categories/cat-personal.png' },
    { name: 'أدوية البرد', image: '/images/categories/cat-cold.png' }
  ];

  // Structured gallery layout based on image aspect ratios
  promoGallery = [
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/Home-full-width-slider---App_1772128688.webp', alt: 'Welcome Banner', link: '/auth/register' }
      ]
    },
    {
      type: 'grid-3', // Medium landscape
      images: [
        { url: '/images/promo/banner1.webp', alt: 'Promo 1', link: '/auth/register' },
        { url: '/images/promo/banner2.webp', alt: 'Promo 2', link: '/auth/register' },
        { url: '/images/promo/banner3.webp', alt: 'Promo 3', link: '/auth/register' }
      ]
    },
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/Bigsave-web-ar--1-_1777390000.webp', alt: 'Big Save', link: '/auth/register' }
      ]
    },
    {
      type: 'grid-2', // Wide/Medium
      images: [
        { url: '/images/promo/HoilPGsawIf5gZruJeYXO28NqJGGjaffkqkOToby.webp', alt: 'Offer 1', link: '/auth/register' },
        { url: '/images/promo/Mg51WhjdDyuDH0IRCJdHE3LH1ot2nZYCYSmdPUMI.webp', alt: 'Offer 2', link: '/auth/register' }
      ]
    },
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/body-care-Banner-Product-slider-Web-1139x230_1783509447.webp', alt: 'Body Care', link: '/auth/register' }
      ]
    },
    {
      type: 'grid-4', // Portrait/Tall
      images: [
        { url: '/images/promo/1--1-_1776683754.webp', alt: 'Brand 1', link: '/auth/register' },
        { url: '/images/promo/2--1-_1776683672.webp', alt: 'Brand 2', link: '/auth/register' },
        { url: '/images/promo/3--1-_1776683586.webp', alt: 'Brand 3', link: '/auth/register' },
        { url: '/images/promo/Tall-Carousel_1772492384.webp', alt: 'Brand 4', link: '/auth/register' }
      ]
    },
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/Banner-Product-slider-Web-1139x230--1-_1783435700.webp', alt: 'Products', link: '/auth/register' }
      ]
    }
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
