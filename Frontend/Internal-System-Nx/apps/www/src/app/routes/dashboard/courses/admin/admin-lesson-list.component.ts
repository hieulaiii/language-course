// apps/www/src/app/routes/dashboard/courses/admin/admin-lesson-list.component.ts
import { Component, inject, input, effect, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LessonService } from '@internal-system-nx/core';
import { Lesson } from '@internal-system-nx/core';
import {
  IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonToggle,
  IonSpinner, IonAlert, IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    IonButton, IonInput, IonTextarea, IonItem, IonLabel, IonToggle,
    IonSpinner, IonAlert, IonModal, IonHeader, IonToolbar, IonTitle, IonContent,
  ],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <a routerLink="../.." class="text-sm text-blue-500 hover:underline">
            ← Danh sách khóa học
          </a>
          <h1 class="text-xl font-bold mt-1">📹 Quản lý bài học</h1>
        </div>
        <ion-button (click)="openModal(null)">+ Thêm bài học</ion-button>
      </div>

      @if (lessonSvc.lessonsResource.isLoading()) {
        <div class="flex justify-center py-20"><ion-spinner /></div>
      } @else {
        <div class="space-y-3">
          @for (lesson of sortedLessons(); track lesson.id; let i = $index) {
            <div class="flex items-center gap-4 bg-white border rounded-xl p-4">
              <span class="text-gray-400 text-sm font-mono w-6 text-center shrink-0">
                {{ lesson.order }}
              </span>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-medium text-gray-800 truncate">{{ lesson.title }}</p>
                  @if (!lesson.isPublished) {
                    <span class="text-xs text-amber-500 shrink-0">Draft</span>
                  }
                </div>
                <p class="text-xs text-gray-400 truncate max-w-sm">{{ lesson.videoUrl }}</p>
              </div>

              <!-- videoDuration — Go json: "videoDuration" -->
              <span class="text-sm text-gray-400 shrink-0">
                {{ formatDuration(lesson.videoDuration) }}
              </span>

              <ion-button size="small" fill="outline" (click)="openModal(lesson.id)">
                ✏️ Sửa
              </ion-button>
              <ion-button size="small" fill="outline" color="danger"
                          (click)="deleteTargetId.set(lesson.id)">
                🗑
              </ion-button>
            </div>
          } @empty {
            <div class="text-center text-gray-400 py-16">Chưa có bài học nào</div>
          }
        </div>
      }
    </div>

    <!-- Add / Edit modal -->
    <ion-modal [isOpen]="showModal()" (willDismiss)="closeModal()">
      <ng-template>
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ editingId() ? 'Sửa bài học' : 'Thêm bài học' }}</ion-title>
            <ion-button slot="end" fill="clear" (click)="closeModal()">✕</ion-button>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <form [formGroup]="form" (ngSubmit)="saveLesson()" class="space-y-4 pt-2">

            <ion-item>
              <ion-label position="stacked">Tiêu đề *</ion-label>
              <ion-input formControlName="title" placeholder="VD: Lesson 1: Greetings" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">URL Video</ion-label>
              <ion-input formControlName="videoUrl" type="url" placeholder="https://..." />
            </ion-item>

            <ion-item>
              <!-- Go json: "videoDuration" (not "duration") -->
              <ion-label position="stacked">Thời lượng (giây)</ion-label>
              <ion-input formControlName="videoDuration" type="number" placeholder="300" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Thứ tự *</ion-label>
              <ion-input formControlName="order" type="number" placeholder="1" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Mô tả</ion-label>
              <ion-textarea formControlName="description" rows="2" />
            </ion-item>

            <ion-item>
              <ion-label position="stacked">Nội dung (markdown)</ion-label>
              <ion-textarea formControlName="content" rows="4"
                            placeholder="Nội dung bài học..." />
            </ion-item>

            <ion-item>
              <ion-label>Công khai</ion-label>
              <ion-toggle formControlName="isPublished" slot="end" />
            </ion-item>

            <ion-button type="submit" expand="block" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Đang lưu...' : 'Lưu' }}
            </ion-button>

            @if (errorMsg()) {
              <p class="text-sm text-red-500 text-center">{{ errorMsg() }}</p>
            }
          </form>
        </ion-content>
      </ng-template>
    </ion-modal>

    <!-- Delete confirm -->
    <ion-alert
      [isOpen]="!!deleteTargetId()"
      header="Xác nhận xóa"
      message="Xóa bài học này?"
      [buttons]="alertButtons"
      (didDismiss)="deleteTargetId.set(null)"
    />
  `,
})
export class AdminLessonListComponent {
  courseId = input.required<string>();

  lessonSvc = inject(LessonService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  deleteTargetId = signal<string | null>(null);
  saving = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    title: ['', Validators.required],
    videoUrl: [''],
    videoDuration: [0],      // Go json: "videoDuration"
    order: [1, [Validators.required, Validators.min(1)]],
    description: [''],
    content: [''],
    isPublished: [false],    // Go json: "isPublished"
  });

  constructor() {
    effect(() => this.lessonSvc.setCourse(this.courseId()));
  }

  sortedLessons = computed<Lesson[]>(() =>
    [...(this.lessonSvc.lessonsResource.value() ?? [])].sort((a, b) => a.order - b.order)
  );

  openModal(id: string | null): void {
    this.editingId.set(id);
    if (id) {
      const lesson = this.lessonSvc.lessonsResource.value()?.find(l => l.id === id);
      if (lesson) this.form.patchValue(lesson);
    } else {
      this.form.reset({
        order: this.sortedLessons().length + 1,
        videoDuration: 0,
        isPublished: false,
      });
    }
    this.showModal.set(true);
    this.errorMsg.set('');
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  saveLesson(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    const payload = this.form.value;
    const id = this.editingId();

    const req$ = id
      ? this.lessonSvc.updateLesson(this.courseId(), id, payload as Partial<Lesson>)
      : this.lessonSvc.createLesson(this.courseId(), payload as Partial<Lesson>);

    req$.subscribe({
      next: () => {
        this.lessonSvc.reload();
        this.closeModal();
        this.saving.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Lỗi không xác định');
      },
    });
  }

  alertButtons = [
    { text: 'Hủy', role: 'cancel' },
    {
      text: 'Xóa',
      role: 'destructive',
      handler: () => {
        const id = this.deleteTargetId();
        if (!id) return;
        this.lessonSvc.deleteLesson(this.courseId(), id)
          .subscribe(() => this.lessonSvc.reload());
      },
    },
  ];

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
