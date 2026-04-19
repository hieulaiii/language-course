// apps/www/src/app/routes/dashboard/courses/admin/admin-course-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '@internal-system-nx/core';
import { IonSpinner, IonButton, IonAlert } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [RouterLink, IonSpinner, IonButton, IonAlert],
  template: `
    <div class="p-6 max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">🎓 Quản lý khóa học</h1>
        <a routerLink="new">
          <ion-button size="default" color="primary">+ Thêm khóa học</ion-button>
        </a>
      </div>

      @if (courses.isLoading()) {
        <div class="flex justify-center py-20"><ion-spinner /></div>
      } @else {
        <div class="bg-white rounded-xl border overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th class="px-4 py-3 text-left">Tên khóa học</th>
                <th class="px-4 py-3 text-left">Cấp độ</th>
                <th class="px-4 py-3 text-left">Ngôn ngữ</th>
                <th class="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @for (course of courses.items(); track course._id) {
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="px-4 py-3 font-medium text-gray-800">{{ course.title }}</td>
                  <td class="px-4 py-3">
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                          [class]="levelClass(course.level)">
                      {{ course.level }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ course.language }}</td>
                  <td class="px-4 py-3 text-right flex gap-2 justify-end">
                    <a [routerLink]="['..', course._id, 'lessons']">
                      <ion-button size="small" fill="outline" color="secondary">
                        📹 Bài học
                      </ion-button>
                    </a>
                    <a [routerLink]="[course._id, 'edit']">
                      <ion-button size="small" fill="outline">✏️ Sửa</ion-button>
                    </a>
                    <ion-button
                      size="small" fill="outline" color="danger"
                      (click)="confirmDelete(course._id)"
                    >🗑 Xóa</ion-button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="px-4 py-10 text-center text-gray-400">
                    Chưa có khóa học nào
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Delete confirm -->
      <ion-alert
        [isOpen]="!!deleteTargetId()"
        header="Xác nhận xóa"
        message="Bạn có chắc muốn xóa khóa học này?"
        [buttons]="alertButtons"
        (didDismiss)="deleteTargetId.set(null)"
      />
    </div>
  `,
})
export class AdminCourseListComponent {
  courses = inject(CourseService);
  deleteTargetId = signal<string | null>(null);

  confirmDelete(id: string): void {
    this.deleteTargetId.set(id);
  }

  alertButtons = [
    { text: 'Hủy', role: 'cancel' },
    {
      text: 'Xóa',
      role: 'destructive',
      handler: () => {
        const id = this.deleteTargetId();
        if (!id) return;
        this.courses.delete(id).subscribe(() => this.courses.reload());
      },
    },
  ];

  levelClass(level: string): string {
    return {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    }[level] ?? 'bg-gray-100 text-gray-600';
  }
}
