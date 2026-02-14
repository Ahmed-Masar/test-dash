import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { companiesAPI } from '@/lib/api';
import { MOCK_COMPANIES } from '@/lib/mockData';

const USE_MOCK_DATA = true;

// Types
export interface Company {
  _id: string;
  name: string;
  logo?: string;
  customFields: Record<string, any>;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CompaniesState {
  companies: Company[];
  currentCompany: Company | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCompanies: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const initialState: CompaniesState = {
  companies: [],
  currentCompany: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalCompanies: 0,
    limit: 10,
    hasNext: false,
    hasPrev: false,
  },
};

// Async Thunks
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params: { page?: number; limit?: number; search?: string } = {}) => {
    if (USE_MOCK_DATA) {
      return {
        data: {
          companies: MOCK_COMPANIES,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: MOCK_COMPANIES.length,
            totalCompanies: MOCK_COMPANIES.length,
            limit: 10,
            hasNext: false,
            hasPrev: false,
          },
        },
      } as any;
    }
    return companiesAPI.getAll(params);
  }
);

export const fetchCompanyById = createAsyncThunk(
  'companies/fetchCompanyById',
  async (id: string) => {
    if (USE_MOCK_DATA) {
      const company = MOCK_COMPANIES.find(c => c._id === id);
      return { data: { company: company || MOCK_COMPANIES[0] } } as any;
    }
    return companiesAPI.getById(id);
  }
);

export const createCompany = createAsyncThunk(
  'companies/createCompany',
  async (companyData: { name: string; logo?: File; customFields?: Record<string, any> }) => {
    if (USE_MOCK_DATA) {
      const newCompany = {
        _id: `mock-company-${Date.now()}`,
        name: companyData.name,
        logo: undefined,
        customFields: companyData.customFields || {},
        createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { data: { company: newCompany } } as any;
    }
    return companiesAPI.create(companyData);
  }
);

export const updateCompany = createAsyncThunk(
  'companies/updateCompany',
  async ({ id, data }: { id: string; data: { name?: string; logo?: File; customFields?: Record<string, any> } }) => {
    if (USE_MOCK_DATA) {
      const company = MOCK_COMPANIES.find(c => c._id === id) || MOCK_COMPANIES[0];
      const updated = { ...company, ...data, name: data.name || company.name };
      return { data: { company: updated } } as any;
    }
    return companiesAPI.update(id, data);
  }
);

export const deleteCompany = createAsyncThunk(
  'companies/deleteCompany',
  async (id: string) => {
    if (USE_MOCK_DATA) return id;
    await companiesAPI.delete(id);
    return id;
  }
);

// Slice
const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCompany: (state, action: PayloadAction<Company | null>) => {
      state.currentCompany = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.data.companies;
        state.pagination = {
          ...action.payload.data.pagination,
          totalCompanies: action.payload.data.pagination.totalCompanies || action.payload.data.pagination.totalItems,
        };
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      
      // Fetch Company by ID
      .addCase(fetchCompanyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCompany = action.payload.data.company;
      })
      .addCase(fetchCompanyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch company';
      })
      
      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies.unshift(action.payload.data.company);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create company';
      })
      
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.companies.findIndex(company => company._id === action.payload.data.company._id);
        if (index !== -1) {
          state.companies[index] = action.payload.data.company;
        }
        if (state.currentCompany?._id === action.payload.data.company._id) {
          state.currentCompany = action.payload.data.company;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update company';
      })
      
      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(company => company._id !== action.payload);
        if (state.currentCompany?._id === action.payload) {
          state.currentCompany = null;
        }
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete company';
      });
  },
});

export const { clearError, setCurrentCompany } = companiesSlice.actions;
export default companiesSlice.reducer;
