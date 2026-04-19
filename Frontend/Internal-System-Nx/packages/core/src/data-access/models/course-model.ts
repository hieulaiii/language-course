// packages/core/src/data-access/models/course.model.ts

// ── Course ────────────────────────────────────────────────
export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  totalLessons: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ── Lesson ────────────────────────────────────────────────
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  videoUrl?: string;
  videoDuration: number;   // seconds — Go json: "videoDuration"
  content?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Progress ──────────────────────────────────────────────
export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  watchedSeconds: number;
  totalSeconds: number;
  isCompleted: boolean;    // Go json: "isCompleted"
  completedAt?: string;
  lastWatchedAt: string;
}

// ── Score ─────────────────────────────────────────────────
export interface Score {
  id: string;
  userId: string;
  courseId: string;
  lessonId?: string;
  score: number;
  maxScore: number;
  answers: Answer[];
  attemptNumber: number;
  createdAt: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
}

// ── DTOs ──────────────────────────────────────────────────
export interface UpdateProgressRequest {
  watchedSeconds: number;
  totalSeconds: number;    // required — backend uses this to calculate 90% threshold
}

export interface CheckUnlockResponse {
  unlocked: boolean;
}

export interface CourseListResponse {
  data: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface LessonListResponse {
  data: Lesson[];
}
