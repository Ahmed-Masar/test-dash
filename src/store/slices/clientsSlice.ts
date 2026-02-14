import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { clientsAPI } from '@/lib/api';
import { MOCK_CLIENTS } from '@/lib/mockData';

const USE_MOCK_DATA = true;

// Types
export interface Client {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  companyId: {
    _id: string;
    name: string;
  };
  customFields: Record<string, any>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClientsState {
  clients: Client[];
  currentClient: Client | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalClients: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const initialState: ClientsState = {
  clients: [],
  currentClient: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalClients: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  },
};

// Async Thunks
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (params: { page?: number; limit?: number; search?: string; companyId?: string } = {}) => {
    if (USE_MOCK_DATA) {
      return {
        data: {
          clients: MOCK_CLIENTS,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: MOCK_CLIENTS.length,
            totalClients: MOCK_CLIENTS.length,
            limit: 10,
            hasNext: false,
            hasPrev: false,
          },
        },
      } as any;
    }
    return clientsAPI.getAll(params);
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (id: string) => {
    if (USE_MOCK_DATA) {
      const client = MOCK_CLIENTS.find(c => c._id === id);
      return { data: { client: client || MOCK_CLIENTS[0] } } as any;
    }
    return clientsAPI.getById(id);
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData: { 
    name: string; 
    email: string; 
    phone: string; 
    companyId: string; 
    avatar?: File; 
    customFields?: Record<string, any> 
  }) => {
    if (USE_MOCK_DATA) {
      const company = MOCK_CLIENTS.find(c => c.companyId._id === clientData.companyId)?.companyId || { _id: clientData.companyId, name: 'Company' };
      const newClient = {
        _id: `mock-client-${Date.now()}`,
        ...clientData,
        companyId: company,
        customFields: clientData.customFields || {},
        createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { data: { client: newClient } } as any;
    }
    return clientsAPI.create(clientData);
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ id, data }: { 
    id: string; 
    data: { 
      name?: string; 
      email?: string; 
      phone?: string; 
      companyId?: string;
      avatar?: File; 
      customFields?: Record<string, any> 
    } 
  }) => {
    if (USE_MOCK_DATA) {
      const client = MOCK_CLIENTS.find(c => c._id === id) || MOCK_CLIENTS[0];
      const updated = { ...client, ...data };
      return { data: { client: updated } } as any;
    }
    return clientsAPI.update(id, data);
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (id: string) => {
    if (USE_MOCK_DATA) return id;
    await clientsAPI.delete(id);
    return id;
  }
);

// Slice
const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentClient: (state, action: PayloadAction<Client | null>) => {
      state.currentClient = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Clients
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload.data.clients;
        state.pagination = {
          ...action.payload.data.pagination,
          totalClients: action.payload.data.pagination.totalClients || action.payload.data.pagination.totalItems,
        };
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch clients';
      })
      
      // Fetch Client by ID
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentClient = action.payload.data.client;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch client';
      })
      
      // Create Client
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.unshift(action.payload.data.client);
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create client';
      })
      
      // Update Client
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client._id === action.payload.data.client._id);
        if (index !== -1) {
          state.clients[index] = action.payload.data.client;
        }
        if (state.currentClient?._id === action.payload.data.client._id) {
          state.currentClient = action.payload.data.client;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update client';
      })
      
      // Delete Client
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client._id !== action.payload);
        if (state.currentClient?._id === action.payload) {
          state.currentClient = null;
        }
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete client';
      });
  },
});

export const { clearError, setCurrentClient } = clientsSlice.actions;
export default clientsSlice.reducer;
