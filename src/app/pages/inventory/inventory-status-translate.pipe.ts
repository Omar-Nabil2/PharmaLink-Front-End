import { Pipe, PipeTransform } from '@angular/core';
import { InventoryStockStatus } from './inventory.model';

@Pipe({ name: 'inventoryStatusTranslate', standalone: true, pure: true })
export class InventoryStatusTranslatePipe implements PipeTransform {
  transform(value: InventoryStockStatus | string | number | null | undefined): string {
    switch (value) {
      case InventoryStockStatus.Available:
      case 'Available':
        return 'متوفر';
      case InventoryStockStatus.LowStock:
      case 'LowStock':
      case 'Low Stock':
        return 'كمية محدودة';
      case InventoryStockStatus.OutOfStock:
      case 'OutOfStock':
      case 'Out of Stock':
        return 'نفد';
      default:
        return String(value ?? '—');
    }
  }
}
