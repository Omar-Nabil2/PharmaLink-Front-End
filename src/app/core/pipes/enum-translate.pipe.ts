import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumTranslate',
  standalone: true
})
export class EnumTranslatePipe implements PipeTransform {
  
  // Dictionary of known English status strings to Arabic
  private dictionary: Record<string, string> = {
    // Prescription Reviews
    'pending': 'قيد الانتظار',
    'processing': 'قيد المعالجة',
    'approved': 'مقبول',
    'rejected': 'مرفوض',
    'failed': 'فشل المعالجة',
    
    // Order Status
    'shipped': 'في الطريق',
    'delivered': 'تم التوصيل',
    'cancelled': 'ملغي',
    'returned': 'مرتجع',
    'outfordelivery': 'في الطريق',
    'readyforpickup': 'جاهز للاستلام',
    
    // Prescription Matches
    'exactmatch': 'مطابق تماماً',
    'fuzzymatch': 'مطابقة محتملة',
    'alternativesuggested': 'بديل مقترح',
    'notfound': 'غير موجود',
    
    // Users & Drivers
    'active': 'نشط',
    'inactive': 'غير نشط',
    'available': 'متاح',
    'busy': 'مشغول',
    'offline': 'غير متصل',
    
    // Default Fallbacks
    'yes': 'نعم',
    'no': 'لا',
    'true': 'نعم',
    'false': 'لا'
  };

  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '';
    
    const key = String(value).toLowerCase().replace(/\s+/g, ''); // normalize string
    
    return this.dictionary[key] || String(value);
  }
}
