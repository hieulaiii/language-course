// packages/core/src/data-access/services/product.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Product, ProductListResponse } from '../models';

const BASE = 'https://dummyjson.com/products';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  // ── Signals điều khiển ──────────────────────────────
  searchQuery = signal('');
  currentPage = signal(1);
  pageSize = signal(10);
  selectedCategory = signal('');

  // ── httpResource — reactive theo signals ────────────
  // Tự refetch khi searchQuery, currentPage, selectedCategory thay đổi
  productsResource = httpResource<ProductListResponse>(() => {
    const q = this.searchQuery();
    const skip = (this.currentPage() - 1) * this.pageSize();
    const limit = this.pageSize();
    const category = this.selectedCategory();

    if (q) {
      return `${BASE}/search?q=${q}&limit=${limit}&skip=${skip}`;
    }
    if (category) {
      return `${BASE}/category/${category}?limit=${limit}&skip=${skip}`;
    }
    return `${BASE}?limit=${limit}&skip=${skip}`;
  });

  // ── GET categories ──────────────────────────────────
  categoriesResource = httpResource<string[]>(
    () => `${BASE}/category-list`
  );

  // ── Mutations — phải subscribe ──────────────────────
  addProduct(payload: Partial<Product>) {
    return this.http.post<Product>(`${BASE}/add`, payload);
  }

  updateProduct(id: number, payload: Partial<Product>) {
    return this.http.put<Product>(`${BASE}/${id}`, payload);
  }

  deleteProduct(id: number) {
    return this.http.delete<Product & { isDeleted: boolean }>(
      `${BASE}/${id}`
    );
  }
}
