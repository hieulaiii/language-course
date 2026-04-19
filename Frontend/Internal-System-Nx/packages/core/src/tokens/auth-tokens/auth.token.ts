// packages/core/src/tokens.ts
import { InjectionToken } from '@angular/core';

/** Provided by each app via environment.ts */
export const API_URL = new InjectionToken<string>('API_URL');

/** localStorage key for JWT token */
export const TOKEN_KEY = 'lc_token';
