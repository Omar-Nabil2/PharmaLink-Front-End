export interface RegisterRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  userId: string;
}

export interface ApiValidationErrorResponse {
  type: string;
  title: string;
  status: number;
  errors: {
    [key: string]: string[];
  };
  traceId?: string;
}

export interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}
