// Модели для аутентификации

export interface RequestUserDto {
  login: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  login: string;
  token: AuthToken | null;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expires: string; // TimeSpan в формате "HH:mm:ss"
}

export interface ErrorResponse {
  message: string;
  traceId?: string;
}
