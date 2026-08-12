import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumTranslate',
  standalone: true
})
export class EnumTranslatePipe implements PipeTransform {

  // Comprehensive dictionary of backend Enums translated to Arabic
  private dictionary: Record<string, string> = {
    // UserStatus
    'active': 'نشط',
    'inactive': 'غير نشط',
    'suspended': 'موقوف',

    // VerificationStatus
    'pending': 'قيد الانتظار',
    'verified': 'تم التحقق',
    // 'rejected': 'مرفوض',
    'deleted': 'محذوف',

    // FulfillmentMode
    'delivery': 'توصيل',
    'pickup': 'استلام',

    // OrderStatus & General
    'processing': 'جاري المعالجة / التحليل', // Covers processing in various contexts
    'shipped': 'تم الشحن',
    'completed': 'مكتمل / تم التحليل',
    'cancelled': 'ملغي',
    'pendingprescriptionreview': 'بانتظار مراجعة الروشتة',
    'prescriptionrejected': 'روشتة مرفوضة',

    // ItemStatus
    'fulfilled': 'تم التحضير',
    'awarded': 'تم الترسية',
    'unavailable': 'غير متوفر',

    // LegType
    'preparation': 'تجهيز',
    // 'delivery': 'توصيل',

    // LegStatus
    'assigned': 'تم التعيين',
    'preparing': 'جاري التجهيز',
    'readyforpickup': 'جاهز للاستلام',
    'outfordelivery': 'في الطريق',
    'delivered': 'تم التوصيل',

    // PrescriptionReviewStatus
    'pendingreview': 'بانتظار المراجعة',
    'approved': 'مقبول',
    'rejected': 'مرفوض',
    'ordercreated': 'تم إنشاء طلب',

    // Availability / Inventory
    'outofstock': 'نفذت الكمية',
    'lowstock': 'كمية قليلة',
    'instock': 'متوفر',
    'available': 'متاح',
    'all': 'الكل',

    // Sorting
    'newestfirst': 'الأحدث أولاً',
    'oldestfirst': 'الأقدم أولاً',
    'highestamount': 'الأعلى قيمة',
    'lowestamount': 'الأقل قيمة',

    // PrescriptionProcessingStatus specific
    'unknown': 'غير معروف',
    'needspatientapproval': 'يحتاج موافقة المريض',
    'pendingpharmacistreview': 'بانتظار الصيدلي',
    'failed': 'فشل',

    // PrescriptionMedicineMatchStatus
    'notfound': 'غير موجود',
    'exactmatch': 'مطابق تماماً',
    'fuzzymatch': 'مطابقة محتملة',
    'alternativesuggested': 'بديل مقترح',

    // MedicalInquiryStatus
    'answered': 'تم الرد',
    'closed': 'مغلق',

    // PrescriptionStatus
    'attachedtoorder': 'مرفق بطلب',
    'expired': 'منتهي الصلاحية',

    // Extra fallback/common
    'yes': 'نعم',
    'no': 'لا',
    'true': 'نعم',
    'false': 'لا'
  };

  transform(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    // Normalize string representation to handle cases seamlessly
    const normalizedKey = value.toString().toLowerCase().trim();
    
    // Return translation if exists, otherwise return original string
    return this.dictionary[normalizedKey] || value.toString();
  }
}
