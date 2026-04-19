// packages/core/src/logics/constants/api.constant.ts
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  USER: {
    LIST: '/users',
    DETAIL: (id: string) => `/users/${id}`,
  },
} as const;

export const REFRESH_TOKEN_KEY = 'refresh_token';
