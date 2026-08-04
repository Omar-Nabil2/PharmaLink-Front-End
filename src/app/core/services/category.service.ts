import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '@environments/environment';
import { DrugCategory } from '../interfaces/drug.interface';
import { TreeNode } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/categories`;
  
  private categories$?: Observable<DrugCategory[]>;

  getAllCategories(): Observable<DrugCategory[]> {
    if (!this.categories$) {
      this.categories$ = this.http.get<DrugCategory[]>(this.baseUrl).pipe(
        shareReplay(1)
      );
    }
    return this.categories$;
  }

  getRootCategories(): Observable<DrugCategory[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c => !c.parentId))
    );
  }

  getSubcategories(parentId: number): Observable<DrugCategory[]> {
    return this.getAllCategories().pipe(
      map(categories => categories.filter(c => c.parentId === parentId))
    );
  }

  getCategoryById(id: number): Observable<DrugCategory | undefined> {
    return this.getAllCategories().pipe(
      map(categories => categories.find(c => c.id === id))
    );
  }

  getCategoriesAsTree(): Observable<TreeNode[]> {
    return this.getAllCategories().pipe(
      map(categories => this.buildTree(categories))
    );
  }

  private buildTree(categories: DrugCategory[]): TreeNode[] {
    const map = new Map<number, TreeNode>();
    const roots: TreeNode[] = [];

    // Initialize all nodes
    categories.forEach(cat => {
      map.set(cat.id, {
        key: cat.id.toString(),
        label: cat.nameAr || cat.nameEn,
        data: cat.id,
        children: []
      });
    });

    // Build hierarchy
    categories.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parentId) {
        const parentNode = map.get(cat.parentId);
        if (parentNode) {
          parentNode.children!.push(node);
        } else {
          // If parent is missing for some reason, treat as root
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  }
}
