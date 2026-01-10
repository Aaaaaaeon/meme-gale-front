export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  meta?: {
    total_count?: number;
    filter_count?: number;
  };
}

export interface ApiError {
  message: string;
  extensions?: {
    code: string;
  };
}
