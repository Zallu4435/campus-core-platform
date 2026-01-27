import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../domain/types/auth/Login';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  collection: 'register' | 'admin' | 'user' | 'faculty' | null;
  error?: string | null;
  loading?: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  collection: null,
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        user: { firstName: string; lastName: string; email: string; id?: string; profilePicture?: string; role: string };
        collection: 'register' | 'admin' | 'user' | 'faculty';
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user as User;
      state.collection = action.payload.collection;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.collection = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setAuth, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;