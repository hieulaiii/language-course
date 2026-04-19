// packages/core/src/data-access/services/base-crud.service.ts
import { inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CrudOptions {
  /** Base URL, e.g. 'http://localhost:8080/api/courses' */
  baseUrl: string;
}

/**
 * Abstract base CRUD service — Angular 21, signal-based.
 *
 * Usage:
 *   @Injectable({ providedIn: 'root' })
 *   export class CourseService extends AbstractCrudService<Course> {
 *     protected override options = { baseUrl: `${API_URL}/courses` };
 *   }
 */
export abstract class AbstractCrudService<T extends { _id?: string }> {
  protected http = inject(HttpClient);

  /** Subclass must provide options */
  protected abstract options: CrudOptions;

  // ── State signals ─────────────────────────────────────
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = signal(10);

  // ── httpResource — auto-refetch on signal change ──────
  readonly listResource = httpResource<PaginatedResponse<T>>(() => {
    const q = this.searchQuery();
    const page = this.currentPage();
    const limit = this.pageSize();
    const skip = (page - 1) * limit;

    const params = new URLSearchParams({ limit: String(limit), skip: String(skip) });
    if (q) params.set('q', q);

    return `${this.options.baseUrl}?${params}`;
  });

  readonly items = computed(() => this.listResource.value()?.data ?? []);
  readonly total = computed(() => this.listResource.value()?.total ?? 0);
  readonly totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  readonly isLoading = computed(() => this.listResource.isLoading());
  readonly error = computed(() => this.listResource.error());

  // ── Single item resource (lazy, set id to activate) ───
  readonly selectedId = signal<string | null>(null);

  readonly detailResource = httpResource<T>(() => {
    const id = this.selectedId();
    if (!id) return undefined; // skip fetch if no id
    return `${this.options.baseUrl}/${id}`;
  });

  // ── Mutations ─────────────────────────────────────────
  create(payload: Partial<T>): Observable<T> {
    return this.http.post<T>(this.options.baseUrl, payload);
  }

  update(id: string, payload: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.options.baseUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.options.baseUrl}/${id}`);
  }

  getById(id: string): Observable<T> {
    return this.http.get<T>(`${this.options.baseUrl}/${id}`);
  }

  // ── Pagination helpers ────────────────────────────────
  goToPage(page: number): void {
    this.currentPage.set(page);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  search(q: string): void {
    this.searchQuery.set(q);
    this.currentPage.set(1); // reset to page 1 on new search
  }

  reload(): void {
    this.listResource.reload();
  }
}
