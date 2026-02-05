export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    id?: string;
    profilePicture?: string;
    role?: string;
  };
  collection: 'register' | 'admin' | 'user' | 'faculty';
}
export interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

export interface UserApiResponse {
  users: User[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export interface ApiResponseWrapper<T> {
  data: T;
}
