// apps/www/src/app/routes/dashboard/dashboard.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from '../../shared/guards/role.guard';

export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard.component').then((m) => m.DashboardComponent),
    children: [
      {
        path: '',
        redirectTo: 'courses',
        pathMatch: 'full',
      },

      // ── Courses (user view) ───────────────────────────
      {
        path: 'courses',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./courses/list/course-list.component').then(
                (m) => m.CourseListComponent
              ),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./courses/detail/course-detail.component').then(
                (m) => m.CourseDetailComponent
              ),
          },
          {
            path: ':courseId/lessons/:lessonId',
            loadComponent: () =>
              import('./courses/lesson/lesson-player.component').then(
                (m) => m.LessonPlayerComponent
              ),
          },
        ],
      },

      // ── Admin: manage courses ─────────────────────────
      {
        path: 'admin/courses',
        canActivate: [roleGuard('admin')],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./courses/admin/admin-course-list.component').then(
                (m) => m.AdminCourseListComponent
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./courses/admin/admin-course-form.component').then(
                (m) => m.AdminCourseFormComponent
              ),
          },
          {
            path: ':id/edit',
            loadComponent: () =>
              import('./courses/admin/admin-course-form.component').then(
                (m) => m.AdminCourseFormComponent
              ),
          },
          {
            path: ':courseId/lessons',
            loadComponent: () =>
              import('./courses/admin/admin-lesson-list.component').then(
                (m) => m.AdminLessonListComponent
              ),
          },

        ],
      },

      // ── Users (admin) ─────────────────────────────────
      // {
      //   path: 'users',
      //   canActivate: [roleGuard('admin')],
      //   loadComponent: () =>
      //     import('./users/user-list.component').then((m) => m.UserListComponent),
      // },
    ],
  },
];
