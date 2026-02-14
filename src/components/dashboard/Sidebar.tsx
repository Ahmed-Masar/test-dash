import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  BarChart3,
  Menu,
  X,
  Building2,
  FolderOpen,
  Settings
} from 'lucide-react';
import logo from '@/assets/logo.png';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [clientsExpanded, setClientsExpanded] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    {
      label: 'System Management',
      icon: Settings,
      path: '/dashboard/management',
      isMain: true
    },
    // {
    //   label: 'Clients',
    //   icon: Users,
    //   expanded: clientsExpanded,
    //   onToggle: () => setClientsExpanded(!clientsExpanded),
    //   items: [
    //     { label: 'Overview', path: '/dashboard/clients', icon: BarChart3 },
    //     { label: 'Add New Client', path: '/dashboard/clients/add', icon: Plus },
    //   ]
    // }
  ];

  return (
    <div className={cn(
      "h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 p-1 bg-sidebar-accent rounded-lg">
 
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">Vodex</h2>
                <p className="text-xs text-sidebar-foreground/60">Management</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 p-1 bg-sidebar-accent rounded-lg mx-auto">
              <img 
                src={logo} 
                alt="DevCorp Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((section) => (
          <div key={section.label}>
            {section.isMain ? (
              <Link to={section.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2",
                    isActive(section.path) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  )}
                >
                  <section.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && (
                    <span className="flex-1 text-left">{section.label}</span>
                  )}
                </Button>
              </Link>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  onClick={section.onToggle}
                >
                  <section.icon className={cn("h-4 w-4", !collapsed && "mr-2")} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{section.label}</span>
                      {section.expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </>
                  )}
                </Button>

                {/* Submenu */}
                {section.expanded && !collapsed && (
                  <div className="ml-4 mt-2 space-y-1">
                    {section.items.map((item) => (
                      <Link key={item.path} to={item.path}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isActive(item.path) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          )}
                        >
                          <item.icon className="h-3 w-3 mr-2" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/60 text-center">
    Vodex Management 
          </div>
        </div>
      )}
    </div>
  );
}