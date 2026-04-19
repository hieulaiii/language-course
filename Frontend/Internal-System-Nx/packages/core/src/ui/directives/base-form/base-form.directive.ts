// libs/core/src/lib/base/base-form.component.ts

import { Directive, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export type FormMode = 'create' | 'edit';

@Directive() // @Directive để không cần selector, dùng để extend
export abstract class BaseFormComponent<TEntity, TDto = Partial<TEntity>>
  implements OnInit
{
  // ─── DI ────────────────────────────────────────────────
  protected readonly fb = inject(FormBuilder);

  // ─── Input từ parent ────────────────────────────────────
  // Edit mode: truyền data vào đây
  initialData = input<TEntity | null>(null);
  mode = input<FormMode>('create');

  // ─── State ─────────────────────────────────────────────
  isLoading = signal(false);
  isSubmitted = signal(false);
  serverError = signal<string | null>(null);

  // Output — parent lắng nghe
  readonly saved = output<TEntity>();
  readonly cancelled = output<void>();

  // ─── Con class BẮT BUỘC implement ─────────────────────
  abstract form: FormGroup;

  /**
   * Con class khai báo cấu trúc form
   * Không patchValue ở đây — base sẽ tự gọi sau
   */
  protected abstract buildForm(): FormGroup;

  /**
   * Map từ initialData → object để patchValue
   * Mặc định: dùng nguyên initialDatas
   * Override nếu cần transform (ví dụ: date string → Date object)
   */
  protected mapToForm(data: TEntity): Partial<TDto> {
    return data as unknown as Partial<TDto>;
  }

  /**
   * Map từ form value → DTO để gửi lên server
   * Mặc định: dùng nguyên form value
   * Override nếu cần transform ngược lại
   */
  protected mapToDto(formValue: unknown): TDto {
    return formValue as TDto;
  }

  // Create và Edit gọi API khác nhau — con class implement
  protected abstract createFn(dto: TDto): Observable<TEntity>;
  protected abstract updateFn(dto: TDto): Observable<TEntity>;

  // ─── Lifecycle ─────────────────────────────────────────
  ngOnInit(): void {
    this.form = this.buildForm();

    // Nếu có initialData → đây là edit mode -> patch value
    const data = this.initialData();
    if (data) {
      this.form.patchValue(this.mapToForm(data));
    }
  }

  // ─── Actions ───────────────────────────────────────────
  onSubmit(): void {
    this.isSubmitted.set(true);
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.mapToDto(this.form.getRawValue());
    const action$ = this.mode() === 'edit'
      ? this.updateFn(dto)
      : this.createFn(dto);

    this.isLoading.set(true);
    action$.pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (entity) => {
        this.onSuccess(entity);
        this.saved.emit(entity);
      },
      error: (err: HttpErrorResponse) => {
        this.serverError.set(err.error?.message ?? 'Có lỗi xảy ra');
      },
    });
  }

  onCancel(): void {
    this.form.reset();
    this.isSubmitted.set(false);
    this.serverError.set(null);
    this.cancelled.emit();
  }

  // Hook - component con override nếu cần làm gì sau khi action thành công
  protected onSuccess(_entity: TEntity): void {}

  // Helpers cho template
  isInvalid(controlName: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.invalid && (ctrl.touched || this.isSubmitted());
  }

  getError(controlName: string, error: string): boolean {
    return !!this.form.get(controlName)?.hasError(error);
  }
}
