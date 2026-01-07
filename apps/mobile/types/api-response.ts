// Generic API Response Types

// Base API Response wrapper (used by GET endpoints with data wrapper)
export interface ApiResponse<T> {
  status_code: number;
  message: string;
  payload: {
    data: T;
  };
}

// Direct API Response (used by CREATE endpoints without data wrapper)
export interface DirectApiResponse<T> {
  status_code: number;
  message: string;
  payload: T;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Error response
export interface ApiError {
  status_code: number;
  message: string;
  errors?: string[];
}

// Success response without data
export interface ApiSuccess {
  status_code: number;
  message: string;
}