// apps/www/src/app/routes/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonContent, IonButton, IonSpinner } from '@ionic/angular/standalone';
import { AuthService } from '@internal-system-nx/core';

@Component({
  standalone: true,
  imports: [IonContent, IonButton, IonSpinner, ReactiveFormsModule, RouterLink],
  template: `
    <ion-content>
      <div class="flex items-center justify-center min-h-screen bg-gray-50">
        <div class="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">

          <h1 class="text-2xl font-semibold text-gray-800 mb-2">Đăng nhập</h1>
          <p class="text-sm text-gray-400 mb-6">Language Course Platform</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                formControlName="email"
                placeholder="you@example.com"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
                [class.border-red-400]="f['email'].invalid && f['email'].touched"
              />
              @if (f['email'].invalid && f['email'].touched) {
                <p class="text-red-500 text-xs mt-1">Email không hợp lệ</p>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                formControlName="password"
                placeholder="••••••••"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
                [class.border-red-400]="f['password'].invalid && f['password'].touched"
              />
              @if (f['password'].invalid && f['password'].touched) {
                <p class="text-red-500 text-xs mt-1">Mật khẩu tối thiểu 6 ký tự</p>
              }
            </div>

            <!-- API error message -->
            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-600 text-sm
                          rounded-lg px-4 py-2">
                {{ errorMsg() }}
              </div>
            }

            <ion-button
              expand="block"
              type="submit"
              [disabled]="submitting()"
              class="mt-2"
            >
              @if (submitting()) {
                <ion-spinner name="crescent" />
              } @else {
                Đăng nhập
              }
            </ion-button>
          </form>

          <p class="text-center text-sm text-gray-400 mt-6">
            Chưa có tài khoản?
            <a routerLink="/auth/register" class="text-blue-500 hover:underline">
              Đăng ký
            </a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  submitting = signal(false);
  errorMsg = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() { return this.form.controls; }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMsg.set('');

    const { email, password } = this.form.value;

    // Gọi POST /api/auth/login thực sự
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: () => {
        // Token đã được lưu bởi AuthService.login() tap()
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.submitting.set(false);
        // Go trả về: { message: "invalid email or password" }
        this.errorMsg.set(
          err?.error?.message ?? 'Đăng nhập thất bại, thử lại.'
        );
      },
    });
  }
}
