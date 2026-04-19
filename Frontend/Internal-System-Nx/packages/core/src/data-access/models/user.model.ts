// packages/core/src/data-access/models/user.model.ts
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
