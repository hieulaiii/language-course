// packages/core/src/data-access/services/course.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { AbstractCrudService } from './base-crud.service';
import { API_URL } from '../../tokens';
import { CheckUnlockResponse, Course, Lesson, Progress, UpdateProgressRequest } from "../models";


// ── CourseService ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class CourseService extends AbstractCrudService<Course> {
  protected override options = { baseUrl: `${inject(API_URL)}/courses` };
}

// ── LessonService ─────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class LessonService {
  private http = inject(HttpClient);
  private apiUrl = inject(API_URL);

  readonly courseId = signal<string | null>(null);

  readonly lessonsResource = httpResource<Lesson[]>(() => {
    const id = this.courseId();
    if (!id) return undefined;
    return `${this.apiUrl}/courses/${id}/lessons`;
  });

  readonly progressResource = httpResource<Progress[]>(() => {
    const id = this.courseId();
    if (!id) return undefined;
    return `${this.apiUrl}/progress/courses/${id}`;
  });

  setCourse(courseId: string): void {
    this.courseId.set(courseId);
  }

  updateProgress(lessonId: string, payload: UpdateProgressRequest) {
    return this.http.put<void>(`${this.apiUrl}/progress/lessons/${lessonId}`, payload);
  }

  checkUnlock(lessonId: string) {
    return this.http.get<CheckUnlockResponse>(`${this.apiUrl}/progress/check-unlock/${lessonId}`);
  }

  createLesson(courseId: string, payload: Partial<Lesson>) {
    return this.http.post<Lesson>(`${this.apiUrl}/courses/${courseId}/lessons`, payload);
  }

  updateLesson(courseId: string, lessonId: string, payload: Partial<Lesson>) {
    return this.http.put<Lesson>(`${this.apiUrl}/courses/${courseId}/lessons/${lessonId}`, payload);
  }

  deleteLesson(courseId: string, lessonId: string) {
    return this.http.delete<void>(`${this.apiUrl}/courses/${courseId}/lessons/${lessonId}`);
  }

  reload(): void {
    this.lessonsResource.reload();
    this.progressResource.reload();
  }
}
