/**
 * Mock data for offline/demo mode - no server connection
 */

// Mock User
export const MOCK_USER = {
  _id: 'mock-user-1',
  email: 'demo@vodex.com',
  name: 'مستخدم تجريبي',
  role: 'admin',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const MOCK_ACCESS_TOKEN = 'mock-token-no-server';

// Mock Companies
export const MOCK_COMPANIES = [
  {
    _id: 'mock-company-1',
    name: 'TechCorp Solutions',
    logo: undefined,
    customFields: { industry: 'Technology' },
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    _id: 'mock-company-2',
    name: 'GreenLeaf Organic',
    logo: undefined,
    customFields: { industry: 'Agriculture' },
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
  },
];

// Mock Clients
export const MOCK_CLIENTS = [
  {
    _id: 'mock-client-1',
    name: 'John Smith',
    email: 'john@techcorp.com',
    phone: '+1 (555) 123-4567',
    avatar: undefined,
    companyId: { _id: 'mock-company-1', name: 'TechCorp Solutions' },
    customFields: {},
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    _id: 'mock-client-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 987-6543',
    avatar: undefined,
    companyId: { _id: 'mock-company-1', name: 'TechCorp Solutions' },
    customFields: {},
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
  },
  {
    _id: 'mock-client-3',
    name: 'Mike Davis',
    email: 'mike@greenleaf.com',
    phone: '+1 (555) 456-7890',
    avatar: undefined,
    companyId: { _id: 'mock-company-2', name: 'GreenLeaf Organic' },
    customFields: {},
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-01-20T10:00:00.000Z',
    updatedAt: '2024-01-20T10:00:00.000Z',
  },
];

// Mock Projects
export const MOCK_PROJECTS = [
  {
    _id: 'mock-project-1',
    name: 'E-commerce Platform',
    status: 'active',
    images: [],
    clientId: {
      _id: 'mock-client-1',
      name: 'John Smith',
      companyId: { _id: 'mock-company-1', name: 'TechCorp Solutions' },
    },
    customFields: {},
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    _id: 'mock-project-2',
    name: 'Mobile App Development',
    status: 'pending',
    images: [],
    clientId: {
      _id: 'mock-client-2',
      name: 'Sarah Johnson',
      companyId: { _id: 'mock-company-1', name: 'TechCorp Solutions' },
    },
    customFields: {},
    createdBy: { _id: '1', name: 'Admin', email: 'admin@vodex.com' },
    createdAt: '2024-02-01T10:00:00.000Z',
    updatedAt: '2024-02-01T10:00:00.000Z',
  },
];

// Mock Fields
export const MOCK_FIELDS = {
  company: [
    {
      _id: 'mock-field-company-1',
      entityType: 'company' as const,
      fieldKey: 'industry',
      fieldLabel: 'Industry',
      fieldType: 'text' as const,
      required: false,
      order: 1,
      isActive: true,
      options: undefined,
      validation: undefined,
    },
  ],
  client: [],
  project: [],
};
