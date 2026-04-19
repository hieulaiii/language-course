// apps/www/src/app/routes/dashboard/courses/lesson/lesson-player.component.ts
import {
  Component, inject, input, effect, signal, computed,
  ElementRef, viewChild, OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LessonService } from '@internal-system-nx/core';
import { IonButton, IonSelect, IonSelectOption, IonToast } from '@ionic/angular/standalone';

@Component({
  standalone: true,
  imports: [RouterLink, IonButton, IonSelect, IonSelectOption, IonToast],
  template: `
    <div class="p-4 max-w-4xl mx-auto">
      <a [routerLink]="['/dashboard/courses', courseId()]"
         class="text-sm text-blue-500 hover:underline mb-4 inline-block">
        ← Quay lại khóa học
      </a>

      <!-- Video -->
      <div class="bg-black rounded-2xl overflow-hidden aspect-video mb-4 relative">
        @if (videoUrl()) {
          <video
            #videoEl
            [src]="videoUrl()"
            class="w-full h-full"
            controls
            controlsList="nodownload"
            (timeupdate)="onTimeUpdate()"
            (ended)="onEnded()"
            (seeked)="onSeeked()"
          ></video>

          @if (seekBlocked()) {
            <div class="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
              <p class="text-white text-base font-medium bg-black/50 px-4 py-2 rounded-xl">
                ⏩ Hãy xem đến <strong>{{ formatTime(maxWatchedSecs()) }}</strong> trước khi tua
              </p>
            </div>
          }
        } @else {
          <div class="flex items-center justify-center h-full text-gray-400">
            Đang tải video...
          </div>
        }
      </div>

      <!-- Controls -->
      <div class="flex items-center justify-between mb-4 gap-4">
        <h2 class="text-lg font-semibold text-gray-800 flex-1 truncate">{{ lessonTitle() }}</h2>

        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-sm text-gray-500">Tốc độ:</span>
          <ion-select
            [value]="playbackSpeed()"
            (ionChange)="setSpeed($event)"
            interface="popover"
          >
            @for (s of speeds; track s) {
              <ion-select-option [value]="s">{{ s }}x</ion-select-option>
            }
          </ion-select>
        </div>
      </div>

      <!-- Progress info -->
      <div class="bg-gray-50 rounded-xl p-3 text-sm text-gray-500 flex flex-wrap gap-4">
        <span>📍 Đã xem: {{ formatTime(watchedSecs()) }}</span>
        <!-- videoDuration from Go model -->
        <span>⏱ Tổng: {{ formatTime(videoDuration()) }}</span>
        @if (isCompleted()) {
          <span class="text-green-600 font-medium">✅ Đã hoàn thành</span>
        } @else {
          <span class="text-blue-500">
            {{ completionPercent() }}% (hoàn thành khi ≥ 90%)
          </span>
        }
      </div>

      <ion-toast
        [isOpen]="showToast()"
        message="🎉 Bài học hoàn thành!"
        duration="2500"
        color="success"
        (didDismiss)="showToast.set(false)"
      />
    </div>
  `,
})
export class LessonPlayerComponent implements OnDestroy {
  courseId = input.required<string>();
  lessonId = input.required<string>();

  private lessonSvc = inject(LessonService);

  videoEl = viewChild<ElementRef<HTMLVideoElement>>('videoEl');

  readonly watchedSecs = signal(0);
  readonly maxWatchedSecs = signal(0);
  readonly playbackSpeed = signal(1);
  readonly seekBlocked = signal(false);
  readonly isCompleted = signal(false);
  readonly showToast = signal(false);

  readonly speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  private saveTimer: ReturnType<typeof setInterval> | null = null;
  private seekBlockTimer: ReturnType<typeof setTimeout> | null = null;

  // Derived from lessons list
  readonly currentLesson = computed(() =>
    (this.lessonSvc.lessonsResource.value() ?? []).find(l => l.id === this.lessonId())
  );

  readonly videoUrl = computed(() => this.currentLesson()?.videoUrl ?? '');
  readonly lessonTitle = computed(() => this.currentLesson()?.title ?? '');

  // videoDuration — Go json tag: "videoDuration"
  readonly videoDuration = computed(() => this.currentLesson()?.videoDuration ?? 0);

  readonly completionPercent = computed(() => {
    const total = this.videoDuration();
    return total > 0 ? Math.round((this.watchedSecs() / total) * 100) : 0;
  });

  constructor() {
    // Restore progress on load
    effect(() => {
      const prog = (this.lessonSvc.progressResource.value() ?? [])
        .find(p => p.lessonId === this.lessonId());
      if (prog) {
        this.watchedSecs.set(prog.watchedSeconds);
        this.maxWatchedSecs.set(prog.watchedSeconds);
        this.isCompleted.set(prog.isCompleted); // Go: isCompleted
      }
    });

    // Seek video to saved position after metadata loads
    effect(() => {
      const el = this.videoEl()?.nativeElement;
      const saved = this.watchedSecs();
      if (el && saved > 0) {
        el.addEventListener('loadedmetadata', () => {
          el.currentTime = saved;
        }, { once: true });
      }
    });

    // Auto-save every 10s
    this.saveTimer = setInterval(() => this.saveProgress(), 10_000);
  }

  ngOnDestroy(): void {
    this.saveProgress();
    if (this.saveTimer) clearInterval(this.saveTimer);
    if (this.seekBlockTimer) clearTimeout(this.seekBlockTimer);
  }

  onTimeUpdate(): void {
    const video = this.videoEl()?.nativeElement;
    if (!video) return;

    const current = Math.floor(video.currentTime);
    this.watchedSecs.set(current);

    if (current > this.maxWatchedSecs()) {
      this.maxWatchedSecs.set(current);
    }
  }

  onSeeked(): void {
    const video = this.videoEl()?.nativeElement;
    if (!video) return;

    const current = Math.floor(video.currentTime);
    const max = this.maxWatchedSecs();

    // Block seeking more than 5s ahead of furthest watched point
    if (current > max + 5) {
      video.currentTime = max;
      this.seekBlocked.set(true);

      if (this.seekBlockTimer) clearTimeout(this.seekBlockTimer);
      this.seekBlockTimer = setTimeout(() => this.seekBlocked.set(false), 2500);
    }
  }

  onEnded(): void {
    // Mark as watched until end → backend will set isCompleted (90% rule)
    const total = this.videoDuration();
    this.watchedSecs.set(total);
    this.isCompleted.set(true);
    this.showToast.set(true);
    this.saveProgress();
  }

  setSpeed(event: CustomEvent): void {
    const speed = Number(event.detail.value);
    this.playbackSpeed.set(speed);
    const video = this.videoEl()?.nativeElement;
    if (video) video.playbackRate = speed;
  }

  private saveProgress(): void {
    const lessonId = this.lessonId();
    const watchedSeconds = this.watchedSecs();
    // totalSeconds is required by Go ProgressService.UpdateProgress for 90% threshold
    const totalSeconds = this.videoDuration();

    this.lessonSvc.updateProgress(lessonId, { watchedSeconds, totalSeconds }).subscribe();
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
}
