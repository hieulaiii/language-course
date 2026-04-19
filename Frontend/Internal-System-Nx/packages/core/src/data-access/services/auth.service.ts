// packages/core/src/data-access/services/auth.service.ts
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {map, tap} from 'rxjs';
import {API_URL, TOKEN_KEY} from "../../tokens";
import {ApiResponse} from "../models";

// ── DTOs matching Go backend ───────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'user';
    avatar?: string;
  };
}

export interface RegisterResponse {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

// ── JWT payload (Go claims: userId, email, role, exp, iat) ─
interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  exp: number;
  iat: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = inject(API_URL);

  // ── Token state ───────────────────────────────────────────
  private readonly _token = signal<string | null>(
    localStorage.getItem(TOKEN_KEY)
  );

  readonly token = this._token.asReadonly();

  readonly isLoggedIn = computed(() => {
    const t = this._token();
    if (!t) return false;
    // Check expiry
    try {
      const { exp } = this.decodeToken(t);
      return Date.now() / 1000 < exp;
    } catch {
      return false;
    }
  });

  readonly currentUser = computed(() => {
    const t = this._token();
    if (!t) return null;
    try {
      return this.decodeToken(t);
    } catch {
      return null;
    }
  });

  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');

  // ── Auth calls ────────────────────────────────────────────

  /**
   * POST /api/auth/login
   * Go response shape: { token, user }
   */


  login(req: LoginRequest) {
    return this.http
      .post<ApiResponse<LoginResponse>>(`${this.apiUrl}/auth/login`, req)
      .pipe(
        tap(res => {
          const token = res.data.token;
          localStorage.setItem(TOKEN_KEY, token);
          this._token.set(token);
        }),
        // map ra login response
        map(res => res.data)
      );
  }

  /**
   * POST /api/auth/register
   */
  register(req: RegisterRequest) {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/auth/register`, req);
  }

  /**
   * GET /api/auth/me  (requires Bearer token — handled by interceptor)
   */
  me() {
    return this.http.get<LoginResponse['user']>(`${this.apiUrl}/auth/me`);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this._token.set(null);
    this.router.navigate(['/auth/login']);
  }

  // ── Helpers ───────────────────────────────────────────────
  private decodeToken(token: string): JwtPayload {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
