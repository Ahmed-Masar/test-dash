import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} from '@/store/slices/companiesSlice';
import { 
  fetchClients as fetchClientsAction,
  createClient,
  updateClient,
  deleteClient 
} from '@/store/slices/clientsSlice';
import { 
  fetchProjects as fetchProjectsAction,
  createProject,
  updateProject,
  deleteProject 
} from '@/store/slices/projectsSlice';
import { 
  fetchFields as fetchFieldsAction,
  createField,
  updateField,
  deleteField,
  toggleFieldStatus,
  reorderFields 
} from '@/store/slices/fieldsSlice';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

// Icons
import { 
  Building2, 
  Users, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Settings,
  Search,
  Filter,
  Upload,
  Eye,
  MoreHorizontal
} from 'lucide-react';

// Types
type ActiveTab = 'companies' | 'clients' | 'projects' | 'fields';

const Management: React.FC = () => {
  const dispatch = useAppDispatch();
  const { companies, loading: companiesLoading, pagination: companiesPagination } = useAppSelector((state) => state.companies);
  const { clients, loading: clientsLoading, pagination: clientsPagination } = useAppSelector((state) => state.clients);
  const { projects, loading: projectsLoading, pagination: projectsPagination } = useAppSelector((state) => state.projects);
  const { fields, loading: fieldsLoading } = useAppSelector((state) => state.fields);
  const { accessToken } = useAppSelector((state) => state.auth);
  const { toast } = useToast();

  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>('companies');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFieldsDialogOpen, setIsFieldsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    name: '',
    logo: null as File | null,
    customFields: {} as Record<string, any>
  });

  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    avatar: null as File | null,
    customFields: {} as Record<string, any>
  });

  const [projectForm, setProjectForm] = useState({
    name: '',
    clientId: '',
    status: 'pending',
    images: [] as File[],
    customFields: {} as Record<string, any>
  });

  const [fieldForm, setFieldForm] = useState({
    entityType: 'company' as 'company' | 'client' | 'project',
    fieldKey: '',
    fieldLabel: '',
    fieldType: 'text' as 'text' | 'number' | 'date' | 'email' | 'select' | 'textarea' | 'boolean' | 'url',
    required: false,
    order: 1,
    options: [] as string[],
    validation: {} as Record<string, any>
  });

  // Load data on component mount
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCompanies({ page: currentPage, limit: 10 }));
      dispatch(fetchClientsAction({ page: currentPage, limit: 10 }));
      dispatch(fetchProjectsAction({ page: currentPage, limit: 10 }));
      dispatch(fetchFieldsAction('company'));
      dispatch(fetchFieldsAction('client'));
      dispatch(fetchFieldsAction('project'));
    }
  }, [dispatch, currentPage, accessToken]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as ActiveTab);
    setSearchTerm('');
    setCurrentPage(1);
    
    // Reload data for the new tab
    if (accessToken) {
      switch (value) {
        case 'companies':
          dispatch(fetchCompanies({ page: 1, limit: 10 }));
          break;
        case 'clients':
          dispatch(fetchClientsAction({ page: 1, limit: 10 }));
          break;
        case 'projects':
          dispatch(fetchProjectsAction({ page: 1, limit: 10 }));
          break;
        case 'fields':
          dispatch(fetchFieldsAction('company'));
          dispatch(fetchFieldsAction('client'));
          dispatch(fetchFieldsAction('project'));
          break;
      }
    }
  };


  // Handle add new item
  const handleAdd = () => {
    setIsAddDialogOpen(true);
    setSelectedItem(null);
    
    // Reset all forms completely
    setCompanyForm({ name: '', logo: null, customFields: {} });
    setClientForm({ name: '', email: '', phone: '', companyId: '', avatar: null, customFields: {} });
    setProjectForm({ name: '', clientId: '', status: 'pending', images: [], customFields: {} });
    setFieldForm({ 
      entityType: 'company', 
      fieldKey: '', 
      fieldLabel: '', 
      fieldType: 'text', 
      required: false, 
      order: 1, 
      options: [], 
      validation: {} 
    });
    
    // Ensure companies are loaded when opening client dialog
    if (activeTab === 'clients' && (!companies || companies.length === 0)) {
      console.log('Loading companies for client dialog...');
      dispatch(fetchCompanies({ page: 1, limit: 100 }));
    }
    console.log('Companies available:', companies?.length || 0);
  };

  // Handle edit item
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
    
    // Populate forms based on active tab
    switch (activeTab) {
      case 'companies':
        setCompanyForm({
          name: item.name,
          logo: null,
          customFields: item.customFields || {}
        });
        break;
      case 'clients':
        setClientForm({
          name: item.name,
          email: item.email,
          phone: item.phone,
          companyId: item.companyId._id,
          avatar: null,
          customFields: item.customFields || {}
        });
        break;
      case 'projects':
        setProjectForm({
          name: item.name,
          clientId: item.clientId._id,
          status: item.status,
          images: [],
          customFields: item.customFields || {}
        });
        break;
    }
  };

  // Handle delete item
  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      switch (activeTab) {
        case 'companies':
          await dispatch(deleteCompany(itemToDelete));
          toast({
            title: "Success",
            description: "Company deleted successfully",
          });
          dispatch(fetchCompanies({ page: currentPage, limit: 10 }));
          break;
        case 'clients':
          await dispatch(deleteClient(itemToDelete));
          toast({
            title: "Success",
            description: "Client deleted successfully",
          });
          dispatch(fetchClientsAction({ page: currentPage, limit: 10 }));
          break;
        case 'projects':
          await dispatch(deleteProject(itemToDelete));
          toast({
            title: "Success",
            description: "Project deleted successfully",
          });
          dispatch(fetchProjectsAction({ page: currentPage, limit: 10 }));
          break;
        case 'fields':
          await dispatch(deleteField(itemToDelete));
          toast({
            title: "Success",
            description: "Field deleted successfully",
          });
          // Reload all fields
          dispatch(fetchFieldsAction('company'));
          dispatch(fetchFieldsAction('client'));
          dispatch(fetchFieldsAction('project'));
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // Handle field operations
  const handleToggleField = async (fieldId: string) => {
    try {
      await dispatch(toggleFieldStatus(fieldId));
      toast({
        title: "Success",
        description: "Field status updated successfully",
      });
      // Reload fields
      dispatch(fetchFieldsAction('company'));
      dispatch(fetchFieldsAction('client'));
      dispatch(fetchFieldsAction('project'));
    } catch (error) {
      console.error('Error toggling field:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update field status. Please try again.",
      });
    }
  };

  const handleEditField = (field: any) => {
    setSelectedItem(field);
    setFieldForm({
      entityType: field.entityType,
      fieldKey: field.fieldKey,
      fieldLabel: field.fieldLabel,
      fieldType: field.fieldType,
      required: field.required,
      order: field.order,
      options: field.options || [],
      validation: field.validation || {}
    });
    setIsFieldsDialogOpen(true);
  };

  const handleDeleteField = (fieldId: string) => {
    setItemToDelete(fieldId);
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      switch (activeTab) {
        case 'companies':
          if (!companyForm.name.trim()) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Company name is required",
            });
            return;
          }
          if (selectedItem) {
            await dispatch(updateCompany({ id: selectedItem._id, data: companyForm }));
            toast({
              title: "Success",
              description: "Company updated successfully",
            });
          } else {
            await dispatch(createCompany(companyForm));
            toast({
              title: "Success",
              description: "Company created successfully",
            });
          }
          dispatch(fetchCompanies({ page: currentPage, limit: 10 }));
          break;
          
        case 'clients':
          if (!clientForm.name.trim() || !clientForm.email.trim() || !clientForm.phone.trim() || !clientForm.companyId) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "All client fields are required. Please select a company.",
            });
            return;
          }
          if (selectedItem) {
            await dispatch(updateClient({ id: selectedItem._id, data: clientForm }));
            toast({
              title: "Success",
              description: "Client updated successfully",
            });
          } else {
            console.log('Creating client with data:', clientForm);
            await dispatch(createClient(clientForm));
            toast({
              title: "Success",
              description: "Client created successfully",
            });
          }
          dispatch(fetchClientsAction({ page: currentPage, limit: 10 }));
          break;
          
        case 'projects':
          if (!projectForm.name.trim() || !projectForm.clientId) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Project name and client are required",
            });
            return;
          }
          if (selectedItem) {
            await dispatch(updateProject({ id: selectedItem._id, data: projectForm }));
            toast({
              title: "Success",
              description: "Project updated successfully",
            });
          } else {
            await dispatch(createProject(projectForm));
            toast({
              title: "Success",
              description: "Project created successfully",
            });
          }
          dispatch(fetchProjectsAction({ page: currentPage, limit: 10 }));
          break;
          
        case 'fields':
          if (!fieldForm.fieldKey.trim() || !fieldForm.fieldLabel.trim()) {
            toast({
              variant: "destructive",
              title: "Validation Error",
              description: "Field key and label are required",
            });
            return;
          }
          if (selectedItem) {
            await dispatch(updateField({ 
              id: selectedItem._id, 
              fieldData: {
                fieldKey: fieldForm.fieldKey,
                fieldLabel: fieldForm.fieldLabel,
                fieldType: fieldForm.fieldType,
                required: fieldForm.required,
                order: fieldForm.order,
                options: fieldForm.options,
                validation: fieldForm.validation
              }
            }));
            toast({
              title: "Success",
              description: "Field updated successfully",
            });
          } else {
            await dispatch(createField({ 
              entityType: fieldForm.entityType,
              fieldData: {
                fieldKey: fieldForm.fieldKey,
                fieldLabel: fieldForm.fieldLabel,
                fieldType: fieldForm.fieldType,
                required: fieldForm.required,
                order: fieldForm.order,
                options: fieldForm.options,
                validation: fieldForm.validation
              }
            }));
            toast({
              title: "Success",
              description: "Field created successfully",
            });
          }
          // Reload all fields
          dispatch(fetchFieldsAction('company'));
          dispatch(fetchFieldsAction('client'));
          dispatch(fetchFieldsAction('project'));
          break;
      }
      
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      setIsFieldsDialogOpen(false);
      setSelectedItem(null);
      
      // Reset forms
      setCompanyForm({ name: '', logo: null, customFields: {} });
      setClientForm({ name: '', email: '', phone: '', companyId: '', avatar: null, customFields: {} });
      setProjectForm({ name: '', clientId: '', status: 'pending', images: [], customFields: {} });
      setFieldForm({ 
        entityType: 'company', 
        fieldKey: '', 
        fieldLabel: '', 
        fieldType: 'text', 
        required: false, 
        order: 1, 
        options: [], 
        validation: {} 
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );

  // Render companies list
  const renderCompanies = () => {
    if (companiesLoading) return renderSkeleton();
    
    if (companies.length === 0) {
      return (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first company</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b">
                <TableHead className="w-[80px] font-semibold">Logo</TableHead>
                <TableHead className="font-semibold">Company Name</TableHead>
                <TableHead className="w-[120px] font-semibold">Created Date</TableHead>
                {fields?.company?.map((field) => (
                  <TableHead key={field._id} className="w-[120px] font-semibold">
                    {field.fieldLabel}
                  </TableHead>
                ))}
                <TableHead className="w-[120px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {companies?.map((company) => (
              <TableRow key={company._id} className="hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm border-b hover:border-primary/20">
                <TableCell>
                  {company.logo ? (
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{company.name}</TableCell>
                <TableCell>
                  {new Date(company.createdAt).toLocaleDateString('en-US')}
                </TableCell>
                {fields?.company?.map((field) => (
                  <TableCell key={field._id}>
                    {company.customFields && company.customFields[field.fieldKey] ? (
                      <span className="text-sm">
                        {company.customFields[field.fieldKey]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(company);
                      }}
                      className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(company._id);
                      }}
                      className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {companiesPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((companiesPagination.currentPage - 1) * companiesPagination.limit) + 1} to {Math.min(companiesPagination.currentPage * companiesPagination.limit, companiesPagination.totalCompanies)} of {companiesPagination.totalCompanies} companies
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(companiesPagination.currentPage - 1);
                  dispatch(fetchCompanies({ page: companiesPagination.currentPage - 1, limit: 10 }));
                }}
                disabled={!companiesPagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {companiesPagination.currentPage} of {companiesPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(companiesPagination.currentPage + 1);
                  dispatch(fetchCompanies({ page: companiesPagination.currentPage + 1, limit: 10 }));
                }}
                disabled={!companiesPagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render clients list
  const renderClients = () => {
    if (clientsLoading) return renderSkeleton();
    
    if (clients.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Clients Found</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first client</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b">
                <TableHead className="w-[80px] font-semibold">Avatar</TableHead>
                <TableHead className="font-semibold">Client Name</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                {fields?.client?.map((field) => (
                  <TableHead key={field._id} className="w-[120px] font-semibold">
                    {field.fieldLabel}
                  </TableHead>
                ))}
                <TableHead className="w-[120px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client._id} className="hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm border-b hover:border-primary/20">
                <TableCell>
                  {client.avatar ? (
                    <img 
                      src={client.avatar} 
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {client.companyId?.name || 'No Company'}
                  </Badge>
                </TableCell>
                {fields?.client?.map((field) => (
                  <TableCell key={field._id}>
                    {client.customFields && client.customFields[field.fieldKey] ? (
                      <span className="text-sm">
                        {client.customFields[field.fieldKey]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(client);
                      }}
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(client._id);
                      }}
                          className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {clientsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((clientsPagination.currentPage - 1) * clientsPagination.limit) + 1} to {Math.min(clientsPagination.currentPage * clientsPagination.limit, clientsPagination.totalClients)} of {clientsPagination.totalClients} clients
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(clientsPagination.currentPage - 1);
                  dispatch(fetchClientsAction({ page: clientsPagination.currentPage - 1, limit: 10 }));
                }}
                disabled={!clientsPagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {clientsPagination.currentPage} of {clientsPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(clientsPagination.currentPage + 1);
                  dispatch(fetchClientsAction({ page: clientsPagination.currentPage + 1, limit: 10 }));
                }}
                disabled={!clientsPagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render projects list
  const renderProjects = () => {
    if (projectsLoading) return renderSkeleton();
    
    if (projects.length === 0) {
      return (
        <div className="text-center py-12">
          <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first project</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-b">
                <TableHead className="w-[80px] font-semibold">Icon</TableHead>
                <TableHead className="font-semibold">Project Name</TableHead>
                <TableHead className="font-semibold">Client</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="w-[100px] font-semibold">Status</TableHead>
                <TableHead className="w-[100px] font-semibold">Images</TableHead>
                {fields?.project?.map((field) => (
                  <TableHead key={field._id} className="w-[120px] font-semibold">
                    {field.fieldLabel}
                  </TableHead>
                ))}
                <TableHead className="w-[120px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {projects?.map((project) => (
              <TableRow key={project._id} className="hover:bg-muted/50 cursor-pointer transition-all duration-200 hover:shadow-sm border-b hover:border-primary/20">
                <TableCell>
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-muted-foreground" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.clientId?.name || 'No Client'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs transition-all duration-200 hover:scale-105 font-medium">
                    {project.clientId?.companyId?.name || 'No Company'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={project.status === 'active' ? 'default' : 'secondary'}
                    className="transition-all duration-200 hover:scale-105 font-medium"
                  >
                    {project.status === 'pending' ? 'Pending' : 
                     project.status === 'active' ? 'Active' :
                     project.status === 'completed' ? 'Completed' :
                     project.status === 'cancelled' ? 'Cancelled' : project.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {project.images && project.images.length > 0 ? (
                    <Badge variant="outline" className="text-xs transition-all duration-200 hover:scale-105 font-medium">
                      {project.images.length} image{project.images.length > 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No images</span>
                  )}
                </TableCell>
                {fields?.project?.map((field) => (
                  <TableCell key={field._id}>
                    {project.customFields && project.customFields[field.fieldKey] ? (
                      <span className="text-sm">
                        {project.customFields[field.fieldKey]}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(project);
                      }}
                          className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project._id);
                      }}
                          className="hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 hover:shadow-md hover:scale-105"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        {projectsPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {((projectsPagination.currentPage - 1) * projectsPagination.limit) + 1} to {Math.min(projectsPagination.currentPage * projectsPagination.limit, projectsPagination.totalProjects)} of {projectsPagination.totalProjects} projects
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(projectsPagination.currentPage - 1);
                  dispatch(fetchProjectsAction({ page: projectsPagination.currentPage - 1, limit: 10 }));
                }}
                disabled={!projectsPagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {projectsPagination.currentPage} of {projectsPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentPage(projectsPagination.currentPage + 1);
                  dispatch(fetchProjectsAction({ page: projectsPagination.currentPage + 1, limit: 10 }));
                }}
                disabled={!projectsPagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render fields management
  const renderFields = () => {
    if (fieldsLoading) return renderSkeleton();
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Dynamic Fields Management</h2>
          <Button 
            onClick={() => setIsFieldsDialogOpen(true)}
            className="transition-all duration-200 hover:shadow-lg hover:scale-105 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            <span className="font-medium">Add New Field</span>
          </Button>
        </div>
        
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-lg shadow-sm">
            <TabsTrigger value="company" className="transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md font-medium">Company Fields</TabsTrigger>
            <TabsTrigger value="client" className="transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md font-medium">Client Fields</TabsTrigger>
            <TabsTrigger value="project" className="transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md font-medium">Project Fields</TabsTrigger>
          </TabsList>
          
          <TabsContent value="company" className="space-y-4">
            {fields?.company?.length > 0 ? (
              fields.company.map((field) => (
                <Card key={field._id} className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{field.fieldLabel}</h4>
                        <p className="text-sm text-muted-foreground">
                          {field.fieldKey} - {field.fieldType}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={field.isActive} 
                          onCheckedChange={() => handleToggleField(field._id)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteField(field._id)}
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No company fields defined yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first company field to get started</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="client" className="space-y-4">
            {fields?.client?.length > 0 ? (
              fields.client.map((field) => (
                <Card key={field._id} className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{field.fieldLabel}</h4>
                        <p className="text-sm text-muted-foreground">
                          {field.fieldKey} - {field.fieldType}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={field.isActive} 
                          onCheckedChange={() => handleToggleField(field._id)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteField(field._id)}
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No client fields defined yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first client field to get started</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="project" className="space-y-4">
            {fields?.project?.length > 0 ? (
              fields.project.map((field) => (
                <Card key={field._id} className="transition-all duration-200 hover:shadow-md hover:border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{field.fieldLabel}</h4>
                        <p className="text-sm text-muted-foreground">
                          {field.fieldKey} - {field.fieldType}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={field.isActive} 
                          onCheckedChange={() => handleToggleField(field._id)}
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditField(field)}
                        >
                          <Edit className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteField(field._id)}
                        >
                          <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No project fields defined yet</p>
                <p className="text-sm text-muted-foreground mt-2">Add your first project field to get started</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>System Management</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Management</h1>
          <p className="text-muted-foreground">Manage companies, clients, and projects</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={handleAdd}
            className="transition-all duration-200 hover:shadow-lg hover:scale-105 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-90" />
            <span className="font-medium">Add New</span>
          </Button>
        </div>
      </div>


      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg shadow-sm">
          <TabsTrigger 
            value="companies" 
            className="flex items-center space-x-2 transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md"
          >
            <Building2 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Companies</span>
          </TabsTrigger>
          <TabsTrigger 
            value="clients" 
            className="flex items-center space-x-2 transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md"
          >
            <Users className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Clients</span>
          </TabsTrigger>
          <TabsTrigger 
            value="projects" 
            className="flex items-center space-x-2 transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md"
          >
            <FolderOpen className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Projects</span>
          </TabsTrigger>
          <TabsTrigger 
            value="fields" 
            className="flex items-center space-x-2 transition-all duration-200 hover:bg-primary/10 hover:shadow-md rounded-md"
          >
            <Settings className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Fields</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="mt-6">
          {renderCompanies()}
          {companies.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {companies.length} of {companies.length} companies
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!companies.length}
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                    dispatch(fetchCompanies({ page: newPage, limit: 10, search: searchTerm }));
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!companies.length}
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    dispatch(fetchCompanies({ page: newPage, limit: 10, search: searchTerm }));
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          {renderClients()}
          {clients.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {clients.length} of {clients.length} clients
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!clients.length}
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                    dispatch(fetchClientsAction({ page: newPage, limit: 10, search: searchTerm }));
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!clients.length}
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    dispatch(fetchClientsAction({ page: newPage, limit: 10, search: searchTerm }));
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          {renderProjects()}
          {projects.length > 0 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {projects.length} of {projects.length} projects
              </p>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!projects.length}
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1);
                    setCurrentPage(newPage);
                    dispatch(fetchProjectsAction({ page: newPage, limit: 10, search: searchTerm }));
                  }}
                >
                  Previous
                </Button>
                <span className="text-sm">Page {currentPage}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!projects.length}
                  onClick={() => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    dispatch(fetchProjectsAction({ page: newPage, limit: 10, search: searchTerm }));
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="fields" className="mt-6">
          {renderFields()}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        setIsEditDialogOpen(open);
        if (!open) {
          // Reset forms when dialog is closed
          setCompanyForm({ name: '', logo: null, customFields: {} });
          setClientForm({ name: '', email: '', phone: '', companyId: '', avatar: null, customFields: {} });
          setProjectForm({ name: '', clientId: '', status: 'pending', images: [], customFields: {} });
          setFieldForm({ 
            entityType: 'company', 
            fieldKey: '', 
            fieldLabel: '', 
            fieldType: 'text', 
            required: false, 
            order: 1, 
            options: [], 
            validation: {} 
          });
          setSelectedItem(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? 'Edit' : 'Add'} {activeTab === 'companies' ? 'Company' : activeTab === 'clients' ? 'Client' : 'Project'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update the information' : 'Enter the required information'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'companies' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyForm.name}
                    onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyLogo">Company Logo</Label>
                  <Input
                    id="companyLogo"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCompanyForm({ ...companyForm, logo: e.target.files?.[0] || null })}
                  />
                </div>
                
                {/* Dynamic Fields for Companies */}
                {fields?.company?.map((field) => (
                  <div key={field._id} className="space-y-2">
                    <Label htmlFor={`company_${field.fieldKey}`}>
                      {field.fieldLabel}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.fieldType === 'text' && (
                      <Input
                        id={`company_${field.fieldKey}`}
                        value={companyForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setCompanyForm({
                          ...companyForm,
                          customFields: {
                            ...companyForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                    {field.fieldType === 'number' && (
                      <Input
                        id={`company_${field.fieldKey}`}
                        type="number"
                        value={companyForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setCompanyForm({
                          ...companyForm,
                          customFields: {
                            ...companyForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                    {field.fieldType === 'select' && (
                      <Select
                        value={companyForm.customFields[field.fieldKey] || ''}
                        onValueChange={(value) => setCompanyForm({
                          ...companyForm,
                          customFields: {
                            ...companyForm.customFields,
                            [field.fieldKey]: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.fieldLabel}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.fieldType === 'textarea' && (
                      <Textarea
                        id={`company_${field.fieldKey}`}
                        value={companyForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setCompanyForm({
                          ...companyForm,
                          customFields: {
                            ...companyForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {activeTab === 'clients' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone Number</Label>
                  <Input
                    id="clientPhone"
                    value={clientForm.phone}
                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCompany">Company</Label>
                  <Select value={clientForm.companyId} onValueChange={(value) => setClientForm({ ...clientForm, companyId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies?.map((company) => (
                        <SelectItem key={company._id} value={company._id}>
                          {company.name}
                        </SelectItem>
                      ))}
                      {(!companies || companies.length === 0) && (
                        <SelectItem value="" disabled>
                          No companies available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientAvatar">Client Avatar</Label>
                  <Input
                    id="clientAvatar"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setClientForm({ ...clientForm, avatar: e.target.files?.[0] || null })}
                  />
                </div>
                
                {/* Dynamic Fields for Clients */}
                {fields?.client?.map((field) => (
                  <div key={field._id} className="space-y-2">
                    <Label htmlFor={`client_${field.fieldKey}`}>
                      {field.fieldLabel}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.fieldType === 'text' && (
                      <Input
                        id={`client_${field.fieldKey}`}
                        value={clientForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setClientForm({
                          ...clientForm,
                          customFields: {
                            ...clientForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                    {field.fieldType === 'number' && (
                      <Input
                        id={`client_${field.fieldKey}`}
                        type="number"
                        value={clientForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setClientForm({
                          ...clientForm,
                          customFields: {
                            ...clientForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                    {field.fieldType === 'select' && (
                      <Select
                        value={clientForm.customFields[field.fieldKey] || ''}
                        onValueChange={(value) => setClientForm({
                          ...clientForm,
                          customFields: {
                            ...clientForm.customFields,
                            [field.fieldKey]: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.fieldLabel}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.fieldType === 'textarea' && (
                      <Textarea
                        id={`client_${field.fieldKey}`}
                        value={clientForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setClientForm({
                          ...clientForm,
                          customFields: {
                            ...clientForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            {activeTab === 'projects' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    value={projectForm.name}
                    onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectClient">Client</Label>
                  <Select value={projectForm.clientId} onValueChange={(value) => setProjectForm({ ...projectForm, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client._id} value={client._id}>
                          {client.name} - {client.companyId?.name || 'No Company'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectStatus">Project Status</Label>
                  <Select value={projectForm.status} onValueChange={(value) => setProjectForm({ ...projectForm, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectImages">Project Images</Label>
                  <Input
                    id="projectImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setProjectForm({ ...projectForm, images: Array.from(e.target.files || []) })}
                  />
                </div>
                
                {/* Dynamic Fields for Projects */}
                {fields?.project?.map((field) => (
                  <div key={field._id} className="space-y-2">
                    <Label htmlFor={`project_${field.fieldKey}`}>
                      {field.fieldLabel}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.fieldType === 'text' && (
                      <Input
                        id={`project_${field.fieldKey}`}
                        value={projectForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setProjectForm({
                          ...projectForm,
                          customFields: {
                            ...projectForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                    {field.fieldType === 'number' && (
                      <Input
                        id={`project_${field.fieldKey}`}
                        type="number"
                        value={projectForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setProjectForm({
                          ...projectForm,
                          customFields: {
                            ...projectForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                    {field.fieldType === 'select' && (
                      <Select
                        value={projectForm.customFields[field.fieldKey] || ''}
                        onValueChange={(value) => setProjectForm({
                          ...projectForm,
                          customFields: {
                            ...projectForm.customFields,
                            [field.fieldKey]: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.fieldLabel}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {field.fieldType === 'textarea' && (
                      <Textarea
                        id={`project_${field.fieldKey}`}
                        value={projectForm.customFields[field.fieldKey] || ''}
                        onChange={(e) => setProjectForm({
                          ...projectForm,
                          customFields: {
                            ...projectForm.customFields,
                            [field.fieldKey]: e.target.value
                          }
                        })}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : (selectedItem ? 'Update' : 'Add')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Fields Management Dialog */}
      <Dialog open={isFieldsDialogOpen} onOpenChange={(open) => {
        setIsFieldsDialogOpen(open);
        if (!open) {
          // Reset field form when dialog is closed
          setFieldForm({ 
            entityType: 'company', 
            fieldKey: '', 
            fieldLabel: '', 
            fieldType: 'text', 
            required: false, 
            order: 1, 
            options: [], 
            validation: {} 
          });
          setSelectedItem(null);
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Field' : 'Add New Field'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Edit the dynamic field properties' : 'Add a new dynamic field to the system'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldEntityType">Entity Type</Label>
              <Select 
                value={fieldForm.entityType} 
                onValueChange={(value: any) => setFieldForm({ ...fieldForm, entityType: value })}
                disabled={!!selectedItem}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldKey">Field Key</Label>
              <Input
                id="fieldKey"
                value={fieldForm.fieldKey}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldKey: e.target.value })}
                placeholder="e.g., phone, address"
                required
                disabled={!!selectedItem}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldLabel">Field Label</Label>
              <Input
                id="fieldLabel"
                value={fieldForm.fieldLabel}
                onChange={(e) => setFieldForm({ ...fieldForm, fieldLabel: e.target.value })}
                placeholder="e.g., Phone Number, Address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fieldType">Field Type</Label>
              <Select value={fieldForm.fieldType} onValueChange={(value: any) => setFieldForm({ ...fieldForm, fieldType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                </SelectContent>
              </Select>
            </div>


            {fieldForm.fieldType === 'select' && (
              <div className="space-y-2">
                <Label htmlFor="fieldOptions">Options (one per line)</Label>
                <Textarea
                  id="fieldOptions"
                  value={fieldForm.options.join('\n')}
                  onChange={(e) => setFieldForm({ 
                    ...fieldForm, 
                    options: e.target.value.split('\n').filter(option => option.trim() !== '')
                  })}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  rows={4}
                />
              </div>
            )}

            {(fieldForm.fieldType === 'number' || fieldForm.fieldType === 'text' || fieldForm.fieldType === 'textarea') && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {fieldForm.fieldType === 'number' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fieldMin">Minimum Value</Label>
                        <Input
                          id="fieldMin"
                          type="number"
                          value={fieldForm.validation?.min || ''}
                          onChange={(e) => setFieldForm({ 
                            ...fieldForm, 
                            validation: { ...fieldForm.validation, min: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          placeholder="Min value"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fieldMax">Maximum Value</Label>
                        <Input
                          id="fieldMax"
                          type="number"
                          value={fieldForm.validation?.max || ''}
                          onChange={(e) => setFieldForm({ 
                            ...fieldForm, 
                            validation: { ...fieldForm.validation, max: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          placeholder="Max value"
                        />
                      </div>
                    </>
                  )}
                  {(fieldForm.fieldType === 'text' || fieldForm.fieldType === 'textarea') && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fieldMinLength">Minimum Length</Label>
                        <Input
                          id="fieldMinLength"
                          type="number"
                          value={fieldForm.validation?.minLength || ''}
                          onChange={(e) => setFieldForm({ 
                            ...fieldForm, 
                            validation: { ...fieldForm.validation, minLength: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          placeholder="Min length"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fieldMaxLength">Maximum Length</Label>
                        <Input
                          id="fieldMaxLength"
                          type="number"
                          value={fieldForm.validation?.maxLength || ''}
                          onChange={(e) => setFieldForm({ 
                            ...fieldForm, 
                            validation: { ...fieldForm.validation, maxLength: e.target.value ? parseInt(e.target.value) : undefined }
                          })}
                          placeholder="Max length"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                checked={fieldForm.required}
                onCheckedChange={(checked) => setFieldForm({ ...fieldForm, required: checked })}
              />
              <Label>Required Field</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsFieldsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Field'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
};

export default Management;
