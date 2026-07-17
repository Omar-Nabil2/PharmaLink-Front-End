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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken?: string;
  userId: string;
  fullName?: string;
  email?: string;
  expiresAtUtc?: string;
  roleName?: string;
  requiresPhoneVerification: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
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


export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
export enum ErrorType {
  ValidationError = 'ValidationError',
  UserError = 'UserError',
  ServerOrAccessError = 'ServerOrAccessError',
  ConnectionError = 'ConnectionError',
  UnknownError = 'UnknownError'
}

export interface ParsedError {
  type: ErrorType;
  title: string;
  message: string;
  errors?: any;
  raw?: any;
}
