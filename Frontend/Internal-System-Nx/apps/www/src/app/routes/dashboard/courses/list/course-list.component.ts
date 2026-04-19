// apps/www/src/app/routes/dashboard/courses/list/course-list.component.ts
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '@internal-system-nx/core';
import { IonSearchbar, IonSpinner, IonBadge } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [RouterLink, IonSearchbar, IonSpinner, IonBadge],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-800">📚 Khóa học</h1>
      </div>

      <ion-searchbar
        placeholder="Tìm khóa học..."
        debounce="400"
        (ionInput)="onSearch($event)"
        class="mb-6"
      />

      @if (courses.isLoading()) {
        <div class="flex justify-center py-20">
          <ion-spinner name="crescent" />
        </div>
      } @else if (courses.error()) {
        <p class="text-center text-red-500 py-10">Lỗi tải dữ liệu</p>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          @for (course of courses.items(); track course._id) {
            <a
              [routerLink]="['/dashboard/courses', course._id]"
              class="block bg-white rounded-2xl shadow-sm border border-gray-100
                     hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              <!-- Go model uses "thumbnail" not "thumbnailUrl" -->
              @if (course.thumbnail) {
                <img [src]="course.thumbnail" [alt]="course.title"
                     class="w-full h-40 object-cover" />
              } @else {
                <div class="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600
                            flex items-center justify-center text-4xl">
                  🎓
                </div>
              }

              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <ion-badge [color]="levelColor(course.level)">{{ course.level }}</ion-badge>
                  <span class="text-xs text-gray-400">{{ course.language }}</span>
                  @if (!course.isPublished) {
                    <span class="text-xs text-amber-500 font-medium">Draft</span>
                  }
                </div>
                <h2 class="font-semibold text-gray-800 line-clamp-2">{{ course.title }}</h2>
                <p class="text-sm text-gray-500 mt-1 line-clamp-2">{{ course.description }}</p>
                <p class="text-xs text-gray-400 mt-2">{{ course.totalLessons }} bài học</p>
              </div>
            </a>
          } @empty {
            <p class="col-span-3 text-center text-gray-400 py-20">Không có khóa học nào</p>
          }
        </div>

        @if (courses.totalPages() > 1) {
          <div class="flex justify-center gap-2 mt-8">
            <button (click)="courses.prevPage()"
                    [disabled]="courses.currentPage() === 1"
                    class="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50">
              ← Trước
            </button>
            <span class="px-4 py-2 text-sm text-gray-600">
              {{ courses.currentPage() }} / {{ courses.totalPages() }}
            </span>
            <button (click)="courses.nextPage()"
                    [disabled]="courses.currentPage() === courses.totalPages()"
                    class="px-4 py-2 rounded-lg border disabled:opacity-40 hover:bg-gray-50">
              Sau →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class CourseListComponent {
  courses = inject(CourseService);

  levelColor(level: string): string {
    return { beginner: 'success', intermediate: 'warning', advanced: 'danger' }[level] ?? 'medium';
  }

  onSearch(event: CustomEvent): void {
    this.courses.search((event.detail.value as string) ?? '');
  }
}
