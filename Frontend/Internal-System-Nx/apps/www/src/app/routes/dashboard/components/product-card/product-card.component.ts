// apps/www/src/app/routes/dashboard/components/product-card/product-card.component.ts
import { Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  IonCard, IonCardContent, IonBadge, IonButton, IonImg,
} from '@ionic/angular/standalone';
import { Product } from '@internal-system-nx/core';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CurrencyPipe, IonCard, IonCardContent, IonBadge, IonButton, IonImg],
  template: `
    <ion-card
      class="m-0 cursor-pointer transition-all"
      [class.ring-2]="selected()"
      [class.ring-blue-500]="selected()"
      (click)="select.emit(product())"
    >
      <ion-img
        [src]="product().thumbnail"
        [alt]="product().title"
        class="h-40 object-cover"
      />
      <ion-card-content class="p-3">
        <p class="font-semibold text-sm line-clamp-1">{{ product().title }}</p>
        <p class="text-xs text-gray-400 mb-2">{{ product().brand }}</p>

        <div class="flex items-center justify-between">
          <span class="font-bold text-blue-600">
            {{ product().price | currency: 'USD' }}
          </span>
          <ion-badge [color]="product().stock < 10 ? 'danger' : 'success'">
            Kho: {{ product().stock }}
          </ion-badge>
        </div>

        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-yellow-500">★ {{ product().rating }}</span>
          <ion-button
            fill="clear" color="danger" size="small"
            (click)="$event.stopPropagation(); remove.emit(product().id)"
          >✕</ion-button>
        </div>
      </ion-card-content>
    </ion-card>
  `,
})
export class ProductCardComponent {
  // input() signal — Angular 17+ thay @Input()
  product = input.required<Product>();
  selected = input(false);

  // output() — Angular 17+ thay @Output() EventEmitter
  // eslint-disable-next-line @angular-eslint/no-output-native
  select = output<Product>();
  remove = output<number>();
}
