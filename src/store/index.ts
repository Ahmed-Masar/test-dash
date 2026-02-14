import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import companiesReducer from './slices/companiesSlice';
import clientsReducer from './slices/clientsSlice';
import projectsReducer from './slices/projectsSlice';
import fieldsReducer from './slices/fieldsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    companies: companiesReducer,
    clients: clientsReducer,
    projects: projectsReducer,
    fields: fieldsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
