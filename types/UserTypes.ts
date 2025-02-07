export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface Role {
  id: number;
  name: string;
}
