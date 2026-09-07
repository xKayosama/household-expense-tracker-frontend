import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from './authApi';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

const token = localStorage.getItem('token');

const initialState: AuthState = {
  token,
  user: null,
  isAuthenticated: !!token,
};

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;

      localStorage.setItem('token', action.payload.token);
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
    },
  },
});

export const {
  setCredentials,
  setUser,
  logout,
} = authSlice.actions;

export default authSlice.reducer;