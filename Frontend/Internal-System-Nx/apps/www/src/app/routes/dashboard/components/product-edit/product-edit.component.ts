// apps/www/src/app/routes/dashboard/components/product-edit/product-edit.component.ts
import {
  Component, input, output,
  linkedSignal, computed, signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonButton, IonBadge, IonSpinner,
} from '@ionic/angular/standalone';
import { Product } from '@internal-system-nx/core';

export interface ProductUpdatePayload {
  id: number;
  title: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CurrencyPipe,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonButton, IonBadge, IonSpinner,
  ],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title class="text-base">
          {{ product() ? 'Chỉnh sửa' : 'Chưa chọn sản phẩm' }}
        </ion-card-title>
      </ion-card-header>

      <ion-card-content>
        @if (!product()) {
          <p class="text-gray-400 text-sm text-center py-4">
            👆 Chọn một sản phẩm để chỉnh sửa
          </p>
        } @else {
          <div class="space-y-3">

            <!-- linkedSignal: tự reset khi product() thay đổi
                 nhưng user vẫn edit được trong lúc đó -->
            <div>
              <label class="text-xs text-gray-500 mb-1 block">Tên sản phẩm</label>
              <input
                [value]="editTitle()"
                (input)="editTitle.set($any($event.target).value)"
                class="w-full px-3 py-2 border rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Giá ($)</label>
                <input
                  type="number"
                  [value]="editPrice()"
                  (input)="editPrice.set(+$any($event.target).value)"
                  class="w-full px-3 py-2 border rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label class="text-xs text-gray-500 mb-1 block">Tồn kho</label>
                <input
                  type="number"
                  [value]="editStock()"
                  (input)="editStock.set(+$any($event.target).value)"
                  class="w-full px-3 py-2 border rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <!-- computed: preview thay đổi, read-only -->
            <div class="bg-gray-50 rounded-lg p-3 space-y-1">
              <p class="text-xs text-gray-500">Preview thay đổi</p>
              <p class="text-sm font-medium line-clamp-1">{{ editTitle() }}</p>
              <div class="flex gap-2">
                <ion-badge color="primary">
                  {{ editPrice() | currency: 'USD' }}
                </ion-badge>
                <ion-badge [color]="editStock() < 10 ? 'danger' : 'success'">
                  Kho: {{ editStock() }}
                </ion-badge>
                @if (isDirty()) {
                  <ion-badge color="warning">● Chưa lưu</ion-badge>
                }
              </div>
            </div>

            <div class="flex gap-2">
              <ion-button
                expand="block"
                size="small"
                [disabled]="!isDirty() || saving()"
                (click)="onSave()"
                class="flex-1"
              >
                @if (saving()) {
                  <ion-spinner name="dots" />
                } @else {
                  Lưu
                }
              </ion-button>

              <ion-button
                expand="block"
                size="small"
                fill="outline"
                [disabled]="!isDirty()"
                (click)="onReset()"
                class="flex-1"
              >
                Hoàn tác
              </ion-button>
            </div>

          </div>
        }
      </ion-card-content>
    </ion-card>
  `,
})
export class ProductEditComponent {
  // ── input() từ cha ─────────────────────────────────────
  product = input<Product | null>(null);
  saving = input(false);

  // ── output() lên cha ───────────────────────────────────
  updated = output<ProductUpdatePayload>();

  // ── linkedSignal — KEY POINT ───────────────────────────
  // Khi cha truyền product mới → 3 field này tự reset về giá trị mới
  // Nhưng user vẫn edit được bình thường
  editTitle = linkedSignal(() => this.product()?.title ?? '');
  editPrice = linkedSignal(() => this.product()?.price ?? 0);
  editStock = linkedSignal(() => this.product()?.stock ?? 0);

  // ── computed — so sánh với giá trị gốc, READ-ONLY ─────
  isDirty = computed(() => {
    const p = this.product();
    if (!p) return false;
    return (
      this.editTitle() !== p.title ||
      this.editPrice() !== p.price ||
      this.editStock() !== p.stock
    );
  });

  onSave() {
    const id = this.product()?.id;
    if (!id) return;
    this.updated.emit({
      id,
      title: this.editTitle(),
      price: this.editPrice(),
      stock: this.editStock(),
    });
  }

  onReset() {
    // Tay reset về giá trị gốc
    const p = this.product();
    if (!p) return;
    this.editTitle.set(p.title);
    this.editPrice.set(p.price);
    this.editStock.set(p.stock);
  }
}
