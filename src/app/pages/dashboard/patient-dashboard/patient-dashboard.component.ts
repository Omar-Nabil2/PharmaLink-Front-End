import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { BadgeModule } from 'primeng/badge';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { PatientDashboardService } from '../../../core/services/patient-dashboard.service';
import { CartService } from '../../../core/services/cart.service';
import { PatientDashboardData, DashboardStatistics, RecentOrder, CurrentOrder } from '../../../core/interfaces/patient-dashboard.interface';
import { StatusTranslatePipe } from '../../../shared/pipes/status-translate.pipe';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, TableModule, BadgeModule, TagModule, ButtonModule, StatusTranslatePipe],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
})
export class PatientDashboardComponent implements OnInit {
  private readonly dashboardService = inject(PatientDashboardService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = true;
  errorMessage = '';

  statistics?: DashboardStatistics;
  currentOrder?: CurrentOrder | null;
  recentOrders: RecentOrder[] = [];
  hasMoreOrders = false;

  cartItemCount = 0;

  // Structured gallery layout based on image aspect ratios
  promoGallery = [
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/Home-full-width-slider---App_1772128688.webp', alt: 'Welcome Banner', link: '/patient/products' }
      ]
    },
    {
      type: 'grid-3', // Medium landscape
      images: [
        { url: '/images/promo/banner1.webp', alt: 'Promo 1', link: '/patient/products' },
        { url: '/images/promo/banner2.webp', alt: 'Promo 2', link: '/patient/products' },
        { url: '/images/promo/banner3.webp', alt: 'Promo 3', link: '/patient/products' }
      ]
    },
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/Bigsave-web-ar--1-_1777390000.webp', alt: 'Big Save', link: '/patient/products' }
      ]
    },
    {
      type: 'grid-2', // Wide/Medium
      images: [
        { url: '/images/promo/HoilPGsawIf5gZruJeYXO28NqJGGjaffkqkOToby.webp', alt: 'Offer 1', link: '/patient/products' },
        { url: '/images/promo/Mg51WhjdDyuDH0IRCJdHE3LH1ot2nZYCYSmdPUMI.webp', alt: 'Offer 2', link: '/patient/products' }
      ]
    },
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/body-care-Banner-Product-slider-Web-1139x230_1783509447.webp', alt: 'Body Care', link: '/patient/products' }
      ]
    },
    {
      type: 'grid-4', // Portrait/Tall
      images: [
        { url: '/images/promo/1--1-_1776683754.webp', alt: 'Brand 1', link: '/patient/products' },
        { url: '/images/promo/2--1-_1776683672.webp', alt: 'Brand 2', link: '/patient/products' },
        { url: '/images/promo/3--1-_1776683586.webp', alt: 'Brand 3', link: '/patient/products' },
        { url: '/images/promo/Tall-Carousel_1772492384.webp', alt: 'Brand 4', link: '/patient/products' }
      ]
    },
    {
      type: 'full', // Ultra wide
      images: [
        { url: '/images/promo/Banner-Product-slider-Web-1139x230--1-_1783435700.webp', alt: 'Products', link: '/patient/products' }
      ]
    }
  ];



  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    forkJoin({
      dashboard: this.dashboardService.getDashboardData(),
      cart: this.cartService.getCart(),
    }).subscribe({
      next: ({ dashboard, cart }) => {
        this.statistics = dashboard.statistics;
        this.currentOrder = dashboard.currentOrder;
        this.recentOrders = dashboard.recentOrders || [];
        this.hasMoreOrders = dashboard.hasMoreOrders || false;
        this.cartItemCount = cart?.items?.length ?? 0;
        this.isLoading = false;
        this.cdr.detectChanges();   // ← الإضافة المهمة
      },
      error: (error) => {
        this.errorMessage = 'فشل في تحميل بيانات لوحة التحكم.';
        this.isLoading = false;
        console.error(error);
        this.cdr.detectChanges();   // ← ولو حصل خطأ كمان
      },
    });
  }

  getSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status?.toLowerCase()) {
      case 'delivered':
      case 'approved':
      case 'completed':
        return 'success';
      case 'in transit':
      case 'pending':
      case 'assigned':
        return 'info';
      case 'cancelled':
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}