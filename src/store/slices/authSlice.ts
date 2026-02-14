import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/lib/api';
import { MOCK_USER, MOCK_ACCESS_TOKEN } from '@/lib/mockData';

// Mock mode - no server connection, use fake data
const USE_MOCK_DATA = true;

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    // Mock mode: accept any credentials and return mock user
    if (USE_MOCK_DATA) {
      return { user: MOCK_USER, accessToken: MOCK_ACCESS_TOKEN };
    }

    try {
      const data = await authAPI.login(credentials);
      
      if (data.success && data.data) {
        const { user, accessToken } = data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        return { user, accessToken };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

// Async thunk for checking existing session
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    // Mock mode: use fake user without server call
    if (USE_MOCK_DATA) {
      return { user: MOCK_USER, accessToken: MOCK_ACCESS_TOKEN };
    }

    try {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        const data = await authAPI.me();
        
        if (data.success && data.data) {
          return { user: data.data.user, accessToken: token };
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        return null;
      }
      
      return null;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      return null;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      // Don't remove remembered credentials on logout
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRememberedCredentials: () => {
      localStorage.removeItem('rememberedEmail');
      localStorage.removeItem('rememberedPassword');
      localStorage.removeItem('rememberMe');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Check auth cases
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string } | null>) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.accessToken = action.payload.accessToken;
        } else {
          state.user = null;
          state.accessToken = null;
        }
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Helper function to check if token is expired
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Helper function to get token from localStorage
export const getStoredToken = (): string | null => {
  const token = localStorage.getItem('accessToken');
  if (token && !isTokenExpired(token)) {
    return token;
  }
  // Clear expired token
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  return null;
};

// Helper function to check if credentials are remembered
export const hasRememberedCredentials = (): boolean => {
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  const rememberedPassword = localStorage.getItem('rememberedPassword');
  const rememberMe = localStorage.getItem('rememberMe') === 'true';
  
  return rememberMe && !!rememberedEmail && !!rememberedPassword;
};

export const { logout, clearError, clearRememberedCredentials } = authSlice.actions;
export default authSlice.reducer;
