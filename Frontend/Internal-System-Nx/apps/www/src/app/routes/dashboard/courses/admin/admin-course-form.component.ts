// apps/www/src/app/routes/dashboard/courses/admin/admin-course-form.component.ts
import { Component, inject, input, effect, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {Course, CourseService} from '@internal-system-nx/core';
import {
  IonButton, IonInput, IonSelect, IonSelectOption,
  IonTextarea, IonItem, IonLabel, IonToggle,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    IonButton, IonInput, IonSelect, IonSelectOption,
    IonTextarea, IonItem, IonLabel, IonToggle,
  ],
  template: `
    <div class="p-6 max-w-2xl mx-auto">
      <a routerLink=".." class="text-sm text-blue-500 hover:underline mb-4 inline-block">
        ← Danh sách khóa học
      </a>

      <h1 class="text-xl font-bold mb-6">
        {{ id() ? '✏️ Chỉnh sửa khóa học' : '+ Thêm khóa học mới' }}
      </h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4">
        <ion-item>
          <ion-label position="stacked">Tên khóa học *</ion-label>
          <ion-input formControlName="title" placeholder="VD: Tiếng Anh cơ bản" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Mô tả</ion-label>
          <ion-textarea formControlName="description" rows="3" />
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Cấp độ *</ion-label>
          <ion-select formControlName="level" interface="popover">
            <ion-select-option value="beginner">Beginner</ion-select-option>
            <ion-select-option value="intermediate">Intermediate</ion-select-option>
            <ion-select-option value="advanced">Advanced</ion-select-option>
          </ion-select>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Ngôn ngữ *</ion-label>
          <ion-input formControlName="language" placeholder="VD: English, French..." />
        </ion-item>

        <!-- Go model: "thumbnail" (not thumbnailUrl) -->
        <ion-item>
          <ion-label position="stacked">URL ảnh thumbnail</ion-label>
          <ion-input formControlName="thumbnail" type="url" placeholder="https://..." />
        </ion-item>

        <ion-item>
          <ion-label>Công khai</ion-label>
          <!-- Go model: "isPublished" -->
          <ion-toggle formControlName="isPublished" slot="end" />
        </ion-item>

        <div class="flex gap-3 pt-4">
          <ion-button type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Đang lưu...' : (id() ? 'Cập nhật' : 'Thêm mới') }}
          </ion-button>
          <a routerLink="..">
            <ion-button fill="outline" color="medium">Hủy</ion-button>
          </a>
        </div>

        @if (errorMsg()) {
          <p class="text-sm text-red-500">{{ errorMsg() }}</p>
        }
      </form>
    </div>
  `,
})
export class AdminCourseFormComponent {
  id = input<string | null>(null);

  private courseSvc = inject(CourseService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  saving = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    level: [ 'beginner' as const, Validators.required ],
    language: ['', Validators.required],
    thumbnail: [''],         // Go json: "thumbnail"
    isPublished: [false],    // Go json: "isPublished"
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      this.courseSvc.selectedId.set(id);
      const course: any = this.courseSvc.detailResource.value();
      if (course) this.form.patchValue(course);
    });
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.errorMsg.set('');

    const payload: Partial<Course> = {
      title: this.form.value.title ?? undefined,
      description: this.form.value.description ?? undefined,
      level: this.form.value.level ?? undefined,
      language: this.form.value.language ?? undefined,
      thumbnail: this.form.value.thumbnail ?? undefined,
      isPublished: this.form.value.isPublished ?? undefined,
    };
    const id = this.id();
    const req$ = id
      ? this.courseSvc.update(id, payload)
      : this.courseSvc.create(payload);

    req$.subscribe({
      next: () => {
        this.courseSvc.reload();
        this.router.navigate(['/dashboard/admin/courses']);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Lỗi không xác định');
      },
    });
  }
}
