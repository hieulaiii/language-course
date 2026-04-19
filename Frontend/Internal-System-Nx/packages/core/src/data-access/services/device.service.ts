
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { Device } from '../models/device.model';

const BASE_URL = 'https://api.restful-api.dev/objects';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private http = inject(HttpClient);

  // ── Signal điều khiển ──────────────────────────────
  searchId = signal<string>('');         // filter theo ID
  selectedDevice = signal<Device | null>(null);

  // ── httpResource — GET list, tự fetch, không subscribe ──
  // Reactive: khi searchId thay đổi, tự refetch
  devicesResource = httpResource<Device[]>(() => {
    const id = this.searchId();
    return id ? `${BASE_URL}/${id}` : BASE_URL;
  });

  // ── GET single — dùng httpResource reactive theo ID ──
  detailResource = httpResource<Device>(() => {
    const id = this.selectedDevice()?.id;
    return id ? `${BASE_URL}/${id}` : undefined; // undefined = không fetch
  });

  // ── POST — dùng HttpClient + subscribe (mutation) ──
  addDevice(payload: Omit<Device, 'id'>) {
    return this.http.post<Device>(BASE_URL, payload);
    // Caller phải subscribe để biết kết quả
  }

  // ── PUT -- Update toàn bộ
  updateDevice(id: string, payload: Partial<Device>) {
    return this.http.put<Device>(`${BASE_URL}/${id}`, payload);
  }

  // ── DELETE ──
  deleteDevice(id: string) {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
