// apps/www/src/app/routes/dashboard/dashboard.component.ts
import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
} from '@ionic/angular/standalone';
import {AuthService} from "@internal-system-nx/core";

@Component({
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    IonHeader, IonToolbar, IonTitle, IonButton, IonButtons,
  ],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-100">
      <aside
        class="flex-shrink-0 bg-gray-900 text-white flex flex-col
               transition-all duration-300 overflow-hidden"
        [class.w-64]="sidebarOpen()"
        [class.w-0]="!sidebarOpen()"
      >
        <div class="p-4 border-b border-gray-700">
          <h1 class="text-lg font-bold whitespace-nowrap">🎓 Language Course</h1>
        </div>

        <nav class="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          @for (item of menuItems; track item.path) {
            <a [routerLink]="item.path"
               routerLinkActive="bg-blue-600 text-white"
               [routerLinkActiveOptions]="{ exact: false }"
               class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300
                      hover:bg-gray-800 hover:text-white transition-colors
                      whitespace-nowrap text-sm">
              <span class="text-lg">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          }

          @if (auth.isAdmin()) {
            <div class="pt-4 pb-2 px-3">
              <p class="text-xs uppercase text-gray-500 tracking-wider">Admin</p>
            </div>
            @for (item of adminMenuItems; track item.path) {
              <a [routerLink]="item.path"
                 routerLinkActive="bg-purple-600 text-white"
                 [routerLinkActiveOptions]="{ exact: false }"
                 class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400
                        hover:bg-gray-800 hover:text-white transition-colors
                        whitespace-nowrap text-sm">
                <span class="text-lg">{{ item.icon }}</span>
                <span>{{ item.label }}</span>
              </a>
            }
          }
        </nav>

        <div class="p-4 border-t border-gray-700">
          <p class="text-xs text-gray-400 whitespace-nowrap truncate">
            👤 {{ auth.currentUser()?.email ?? 'User' }}
          </p>
          <button (click)="auth.logout()"
                  class="mt-2 text-xs text-red-400 hover:text-red-300 whitespace-nowrap">
            Đăng xuất
          </button>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ion-header>
          <ion-toolbar color="primary">
            <ion-buttons slot="start">
              <ion-button (click)="sidebarOpen.update(v => !v)">
                {{ sidebarOpen() ? '✕' : '☰' }}
              </ion-button>
            </ion-buttons>
            <ion-title>{{ currentPageTitle() }}</ion-title>
          </ion-toolbar>
        </ion-header>
        <main class="flex-1 overflow-auto"><router-outlet /></main>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  sidebarOpen = signal(true);

  menuItems = [{ path: '/dashboard/courses', label: 'Khóa học', icon: '📚' }];
  adminMenuItems = [
    { path: '/dashboard/admin/courses', label: 'Quản lý khóa học', icon: '🎓' },
    { path: '/dashboard/users', label: 'Người dùng', icon: '👥' },
  ];

  private navEnd$ = toSignal(
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
  );

  currentPageTitle = computed(() => {
    const url = (this.navEnd$() as NavigationEnd | undefined)?.urlAfterRedirects ?? '';
    if (url.includes('admin/courses')) return 'Quản lý khóa học';
    if (url.includes('lessons'))       return 'Bài học';
    if (url.includes('courses'))       return 'Khóa học';
    if (url.includes('users'))         return 'Người dùng';
    return 'Dashboard';
  });
}
