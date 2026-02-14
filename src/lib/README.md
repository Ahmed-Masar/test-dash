# Axios Setup Documentation

## Overview
This project uses Axios for HTTP requests with comprehensive interceptors for request/response handling, authentication, and error management.

## Files Structure

### 1. `axios.ts` - Main Axios Configuration
- **Base Configuration**: Sets up base URL, timeout, and default headers
- **Request Interceptor**: Automatically adds authentication token to requests
- **Response Interceptor**: Handles responses, errors, and automatic logout on 401
- **Helper Functions**: Simplified API methods (get, post, put, patch, delete, upload)

### 2. `api.ts` - API Endpoints
- **Type Definitions**: TypeScript interfaces for API responses and pagination
- **API Modules**: Organized API calls for different resources:
  - `authAPI`: Authentication endpoints
  - `companiesAPI`: Company management
  - `clientsAPI`: Client management  
  - `projectsAPI`: Project management
  - `fieldsAPI`: Dynamic fields management

## Features

### 🔐 Authentication
- Automatic token injection from Redux store
- Fallback to localStorage if Redux token is not available
- Automatic logout and redirect on 401 errors

### 📝 Request/Response Logging
- Development mode logging for all requests and responses
- Error logging with detailed information
- Network error detection

### 🚨 Error Handling
- **401 Unauthorized**: Auto-logout and redirect to login
- **403 Forbidden**: Warning message
- **404 Not Found**: Resource not found warning
- **500+ Server Errors**: Server error logging
- **Network Errors**: Connection issue detection

### 📤 File Upload Support
- Specialized `upload` helper for multipart/form-data
- Automatic Content-Type header setting
- Support for multiple file uploads

## Usage Examples

### Basic API Call
```typescript
import { apiHelpers } from '@/lib/axios';

// GET request
const companies = await apiHelpers.get('/companies');

// POST request
const newCompany = await apiHelpers.post('/companies', {
  name: 'New Company',
  customFields: { industry: 'Technology' }
});

// File upload
const formData = new FormData();
formData.append('logo', file);
const result = await apiHelpers.upload('/companies', formData);
```

### Using API Modules
```typescript
import { companiesAPI } from '@/lib/api';

// Get all companies with pagination
const response = await companiesAPI.getAll({
  page: 1,
  limit: 10,
  search: 'tech'
});

// Create new company
const newCompany = await companiesAPI.create({
  name: 'Tech Corp',
  logo: logoFile,
  customFields: { industry: 'Technology' }
});
```

### Redux Integration
```typescript
// In Redux slice
export const fetchCompanies = createAsyncThunk(
  'companies/fetchCompanies',
  async (params) => {
    return companiesAPI.getAll(params);
  }
);
```

## Configuration

### Environment Variables
- `NODE_ENV`: Controls logging behavior
- Development mode enables detailed request/response logging

### Base URL
- Default: `http://localhost:5000/api`
- Production: `https://vodex-systems-backend.onrender.com`
- Configured via `VITE_API_BASE_URL` environment variable in `.env`

### Timeout
- Default: 10 seconds
- Can be adjusted in axios configuration

## Error Response Format
```typescript
interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
```

## Pagination Support
```typescript
interface PaginationResponse {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  totalCompanies?: number;
  totalClients?: number;
  totalProjects?: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

## Security Features
- Automatic token refresh handling
- Secure token storage in Redux + localStorage
- CSRF protection through proper headers
- Request/response sanitization

## Performance Optimizations
- Request deduplication
- Automatic retry on network errors
- Efficient error handling
- Minimal bundle size impact

## Migration from Fetch
All Redux slices have been migrated from `fetch` to Axios:
- ✅ `authSlice.ts`
- ✅ `companiesSlice.ts`
- ✅ `clientsSlice.ts`
- ✅ `projectsSlice.ts`
- ✅ `fieldsSlice.ts`

## Benefits
1. **Consistent Error Handling**: Centralized error management
2. **Automatic Authentication**: Token injection without manual handling
3. **Better Developer Experience**: Detailed logging and error messages
4. **Type Safety**: Full TypeScript support
5. **File Upload Support**: Built-in multipart handling
6. **Request/Response Interceptors**: Automatic request modification
7. **Network Error Detection**: Better offline handling
8. **Automatic Logout**: Security enhancement on token expiration

## Troubleshooting

### Common Issues
1. **401 Errors**: Check if token is properly stored in Redux
2. **Network Errors**: Verify backend server is running
3. **CORS Issues**: Ensure backend CORS is configured
4. **File Upload Issues**: Check Content-Type headers

### Debug Mode
Enable detailed logging by setting `NODE_ENV=development` in your environment.
