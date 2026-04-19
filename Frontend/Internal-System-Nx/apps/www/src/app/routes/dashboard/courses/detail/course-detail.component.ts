// apps/www/src/app/routes/dashboard/courses/detail/course-detail.component.ts
import { Component, inject, input, effect, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService, LessonService } from '@internal-system-nx/core';
import { Progress, Lesson } from '@internal-system-nx/core';
import { IonSpinner, IonProgressBar, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, lockClosed, playCircle } from 'ionicons/icons';

addIcons({ checkmarkCircle, lockClosed, playCircle });

@Component({
  standalone: true,
  imports: [RouterLink, IonSpinner, IonProgressBar, IonIcon],
  template: `
    <div class="p-6 max-w-3xl mx-auto">
      <a routerLink="/dashboard/courses"
         class="text-sm text-blue-500 hover:underline mb-4 inline-block">
        ← Tất cả khóa học
      </a>

      @if (lessonSvc.lessonsResource.isLoading()) {
        <div class="flex justify-center py-20"><ion-spinner name="crescent" /></div>
      } @else {
        <!-- Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-800">
            {{ courseSvc.detailResource.value()?.title ?? '' }}
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ courseSvc.detailResource.value()?.language }} ·
            {{ courseSvc.detailResource.value()?.totalLessons }} bài học
          </p>

          <div class="mt-3">
            <div class="flex justify-between text-sm text-gray-500 mb-1">
              <span>Tiến trình</span>
              <span>{{ completedCount() }}/{{ sortedLessons().length }} bài</span>
            </div>
            <ion-progress-bar [value]="progressRatio()" color="success" />
          </div>
        </div>

        <!-- Lessons -->
        <div class="space-y-3">
          @for (lesson of sortedLessons(); track lesson.id; let i = $index) {
            @let prog = progressMap()[lesson.id];
            @let done = prog?.isCompleted ?? false;
            <!-- Lesson 1 always unlocked; otherwise prev lesson must be isCompleted -->
            @let prevDone = i === 0 || (progressMap()[sortedLessons()[i-1].id]?.isCompleted ?? false);

            <div class="flex items-center gap-4 p-4 bg-white rounded-xl border transition-all"
                 [class.opacity-50]="!prevDone"
                 [class.cursor-not-allowed]="!prevDone">

              <div class="text-2xl flex-shrink-0">
                @if (done) {
                  <ion-icon name="checkmark-circle" class="text-green-500" />
                } @else if (!prevDone) {
                  <ion-icon name="lock-closed" class="text-gray-400" />
                } @else {
                  <ion-icon name="play-circle" class="text-blue-500" />
                }
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-medium text-gray-800 truncate">
                  {{ i + 1 }}. {{ lesson.title }}
                </p>
                <p class="text-xs text-gray-400">
                  <!-- videoDuration matches Go json tag -->
                  {{ formatDuration(lesson.videoDuration) }}
                  @if (prog && !done) {
                    · Đã xem {{ formatDuration(prog.watchedSeconds) }}
                  }
                </p>
              </div>

              @if (prevDone) {
                <a [routerLink]="['/dashboard/courses', id(), 'lessons', lesson.id]"
                   class="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm
                          rounded-lg transition-colors flex-shrink-0">
                  {{ done ? 'Xem lại' : 'Học' }}
                </a>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CourseDetailComponent {
  id = input.required<string>();

  courseSvc = inject(CourseService);
  lessonSvc = inject(LessonService);

  constructor() {
    effect(() => {
      this.lessonSvc.setCourse(this.id());
      this.courseSvc.selectedId.set(this.id());
    });
  }

  sortedLessons = computed<Lesson[]>(() =>
    [...(this.lessonSvc.lessonsResource.value() ?? [])].sort((a, b) => a.order - b.order)
  );

  // Key by lessonId — Progress.lessonId matches Go json: "lessonId"
  progressMap = computed<Record<string, Progress>>(() => {
    const list = this.lessonSvc.progressResource.value() ?? [];
    return Object.fromEntries(list.map(p => [p.lessonId, p]));
  });

  completedCount = computed(() =>
    Object.values(this.progressMap()).filter(p => p.isCompleted).length
  );

  progressRatio = computed(() => {
    const total = this.sortedLessons().length;
    return total > 0 ? this.completedCount() / total : 0;
  });

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
