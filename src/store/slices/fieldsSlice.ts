import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fieldsAPI } from '@/lib/api';
import { MOCK_FIELDS } from '@/lib/mockData';

const USE_MOCK_DATA = true;

// Types
export interface FieldDefinition {
  _id: string;
  entityType: 'company' | 'client' | 'project';
  fieldKey: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'email' | 'select' | 'textarea' | 'boolean' | 'url';
  required: boolean;
  order: number;
  isActive: boolean;
  options?: string[]; // For select fields
  validation?: {
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FieldsState {
  fields: {
    company: FieldDefinition[];
    client: FieldDefinition[];
    project: FieldDefinition[];
  };
  loading: boolean;
  error: string | null;
}

const initialState: FieldsState = {
  fields: {
    company: [],
    client: [],
    project: [],
  },
  loading: false,
  error: null,
};

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Async Thunks
export const fetchFields = createAsyncThunk(
  'fields/fetchFields',
  async (entityType: 'company' | 'client' | 'project') => {
    if (USE_MOCK_DATA) {
      return {
        entityType,
        data: { data: { fields: MOCK_FIELDS[entityType] || [] } },
      } as any;
    }
    const data = await fieldsAPI.getAll(entityType);
    return { entityType, data };
  }
);

export const createField = createAsyncThunk(
  'fields/createField',
  async ({ entityType, fieldData }: { 
    entityType: 'company' | 'client' | 'project'; 
    fieldData: Omit<FieldDefinition, '_id' | 'entityType' | 'isActive'> 
  }) => {
    if (USE_MOCK_DATA) {
      const newField = {
        ...fieldData,
        _id: `mock-field-${Date.now()}`,
        entityType,
        isActive: true,
      };
      return { entityType, data: { data: { field: newField } } } as any;
    }
    const data = await fieldsAPI.create(entityType, fieldData);
    return { entityType, data };
  }
);

export const updateField = createAsyncThunk(
  'fields/updateField',
  async ({ id, fieldData }: { 
    id: string; 
    fieldData: Partial<Omit<FieldDefinition, '_id' | 'entityType'>> 
  }) => {
    if (USE_MOCK_DATA) {
      const allFields = [...MOCK_FIELDS.company, ...MOCK_FIELDS.client, ...MOCK_FIELDS.project];
      const field = allFields.find(f => f._id === id) || MOCK_FIELDS.company[0];
      const updated = { ...field, ...fieldData };
      return { data: { field: updated } } as any;
    }
    return fieldsAPI.update(id, fieldData);
  }
);

export const deleteField = createAsyncThunk(
  'fields/deleteField',
  async (id: string) => {
    if (USE_MOCK_DATA) return id;
    await fieldsAPI.delete(id);
    return id;
  }
);

export const toggleFieldStatus = createAsyncThunk(
  'fields/toggleFieldStatus',
  async (id: string) => {
    if (USE_MOCK_DATA) {
      const allFields = [...MOCK_FIELDS.company, ...MOCK_FIELDS.client, ...MOCK_FIELDS.project];
      const field = allFields.find(f => f._id === id) || MOCK_FIELDS.company[0];
      const updated = { ...field, isActive: !field.isActive };
      return { data: { field: updated } } as any;
    }
    return fieldsAPI.toggleStatus(id);
  }
);

export const reorderFields = createAsyncThunk(
  'fields/reorderFields',
  async ({ entityType, fields }: { 
    entityType: 'company' | 'client' | 'project'; 
    fields: { id: string; order: number }[] 
  }) => {
    if (USE_MOCK_DATA) {
      return { entityType, data: { data: {} } } as any;
    }
    const fieldOrders = fields.map(field => ({
      fieldId: field.id,
      order: field.order
    }));
    const data = await fieldsAPI.reorder(entityType, fieldOrders);
    return { entityType, data };
  }
);

// Slice
const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Fields
      .addCase(fetchFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFields.fulfilled, (state, action) => {
        state.loading = false;
        state.fields[action.payload.entityType] = action.payload.data.data.fields;
      })
      .addCase(fetchFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch fields';
      })
      
      // Create Field
      .addCase(createField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createField.fulfilled, (state, action) => {
        state.loading = false;
        state.fields[action.payload.entityType].push(action.payload.data.data.field);
      })
      .addCase(createField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create field';
      })
      
      // Update Field
      .addCase(updateField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateField.fulfilled, (state, action) => {
        state.loading = false;
        const updatedField = action.payload.data.field;
        const entityType = updatedField.entityType;
        const index = state.fields[entityType].findIndex(field => field._id === updatedField._id);
        if (index !== -1) {
          state.fields[entityType][index] = updatedField;
        }
      })
      .addCase(updateField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update field';
      })
      
      // Delete Field
      .addCase(deleteField.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteField.fulfilled, (state, action) => {
        state.loading = false;
        // Remove field from all entity types
        Object.keys(state.fields).forEach(entityType => {
          state.fields[entityType as keyof typeof state.fields] = 
            state.fields[entityType as keyof typeof state.fields].filter(
              field => field._id !== action.payload
            );
        });
      })
      .addCase(deleteField.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete field';
      })
      
      // Toggle Field Status
      .addCase(toggleFieldStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleFieldStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedField = action.payload.data.field;
        const entityType = updatedField.entityType;
        const index = state.fields[entityType].findIndex(field => field._id === updatedField._id);
        if (index !== -1) {
          state.fields[entityType][index] = updatedField;
        }
      })
      .addCase(toggleFieldStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to toggle field status';
      })
      
      // Reorder Fields
      .addCase(reorderFields.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reorderFields.fulfilled, (state, action) => {
        state.loading = false;
        // Fields are already updated in the state, no need to update here
      })
      .addCase(reorderFields.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to reorder fields';
      });
  },
});

export const { clearError } = fieldsSlice.actions;
export default fieldsSlice.reducer;
