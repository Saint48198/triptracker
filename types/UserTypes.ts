export interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface Role {
  id: number;
  name: string;
}
