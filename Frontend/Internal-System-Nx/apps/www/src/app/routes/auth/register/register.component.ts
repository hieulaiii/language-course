// apps/www/src/app/routes/auth/register/register.component.ts
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

          <h1 class="text-2xl font-semibold text-gray-800 mb-2">Đăng ký</h1>
          <p class="text-sm text-gray-400 mb-6">Language Course Platform</p>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
              <input
                type="text"
                formControlName="fullName"
                placeholder="Nguyễn Văn A"
                class="w-full px-4 py-2 border rounded-lg focus:outline-none
                       focus:ring-2 focus:ring-blue-500"
                [class.border-red-400]="f['fullName'].invalid && f['fullName'].touched"
              />
              @if (f['fullName'].invalid && f['fullName'].touched) {
                <p class="text-red-500 text-xs mt-1">Họ tên không được để trống</p>
              }
            </div>

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

            @if (errorMsg()) {
              <div class="bg-red-50 border border-red-200 text-red-600 text-sm
                          rounded-lg px-4 py-2">
                {{ errorMsg() }}
              </div>
            }

            @if (successMsg()) {
              <div class="bg-green-50 border border-green-200 text-green-600 text-sm
                          rounded-lg px-4 py-2">
                {{ successMsg() }}
              </div>
            }

            <ion-button expand="block" type="submit" [disabled]="submitting()">
              @if (submitting()) {
                <ion-spinner name="crescent" />
              } @else {
                Đăng ký
              }
            </ion-button>
          </form>

          <p class="text-center text-sm text-gray-400 mt-6">
            Đã có tài khoản?
            <a routerLink="/auth/login" class="text-blue-500 hover:underline">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
    </ion-content>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  submitting = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  form = this.fb.group({
    fullName: ['', Validators.required],
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
    this.successMsg.set('');

    const { email, password, fullName } = this.form.value;

    this.auth.register({ email: email!, password: password!, fullName: fullName! }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.successMsg.set('Đăng ký thành công! Đang chuyển đến đăng nhập...');
        setTimeout(() => this.router.navigate(['/auth/login']), 1500);
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMsg.set(err?.error?.message ?? 'Đăng ký thất bại, thử lại.');
      },
    });
  }
}
