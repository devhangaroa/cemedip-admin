export interface LoginRequest {
  username: string;
  password: string;
}

export interface User {
  username: string;
  tipo_usuario: string;
  es_administrador: boolean;
  nombre: string | null;
}

export interface LoginData {
  token: string;
  usuario: User;
}
