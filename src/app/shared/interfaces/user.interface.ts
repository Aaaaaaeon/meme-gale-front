export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  status?: string;
}

export interface AuthData {
  access_token: string;
  refresh_token: string;
  expires: number;
}

export interface AuthResponse {
  data: AuthData;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
