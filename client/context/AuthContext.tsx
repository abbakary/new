import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '@shared/types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (role: UserRole) => void; // For demo purposes
  hasPermission: (module: string, action: string) => boolean;
  canAccess: (requiredRole: UserRole | UserRole[]) => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for different roles
const demoUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin User',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    phone: '+1234567890',
    isActive: true,
    createdAt: new Date(),
    permissions: [
      { module: '*', actions: ['*'] }, // Admin has all permissions
    ]
  },
  {
    id: 'manager-1',
    name: 'Office Manager',
    email: 'manager@company.com',
    role: UserRole.OFFICE_MANAGER,
    phone: '+1234567891',
    isActive: true,
    createdAt: new Date(),
    permissions: [
      { module: 'customers', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'orders', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'job_cards', actions: ['create', 'read', 'update', 'assign'] },
      { module: 'services', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'reports', actions: ['read'] },
      { module: 'invoices', actions: ['create', 'read', 'update'] },
      { module: 'inventory', actions: ['read', 'update'] },
    ]
  },
  {
    id: 'tech-1',
    name: 'Technician User',
    email: 'tech@company.com',
    role: UserRole.TECHNICIAN,
    phone: '+1234567892',
    isActive: true,
    createdAt: new Date(),
    permissions: [
      { module: 'job_cards', actions: ['read', 'update_assigned'] },
      { module: 'orders', actions: ['read', 'update_status'] },
      { module: 'time_tracking', actions: ['create', 'read', 'update'] },
      { module: 'materials', actions: ['read', 'use'] },
      { module: 'checklists', actions: ['read', 'update'] },
      { module: 'sales_items', actions: ['create', 'read'] },
    ]
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Clear any existing user data on app start to ensure we start from login
    localStorage.removeItem('currentUser');
    setUser(null);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user by email (simple demo logic)
    const foundUser = demoUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const switchUser = (role: UserRole) => {
    const targetUser = demoUsers.find(u => u.role === role);
    if (targetUser) {
      setUser(targetUser);
      localStorage.setItem('currentUser', JSON.stringify(targetUser));
    }
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === UserRole.ADMIN) return true;
    
    // Check specific permissions
    return user.permissions.some(permission => {
      const moduleMatch = permission.module === '*' || permission.module === module;
      const actionMatch = permission.actions.includes('*') || permission.actions.includes(action);
      return moduleMatch && actionMatch;
    });
  };

  const canAccess = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    // Admin can access everything
    if (user.role === UserRole.ADMIN) return true;
    
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return requiredRoles.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    switchUser,
    hasPermission,
    canAccess,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Higher-order component for route protection
export const withAuth = (
  Component: React.ComponentType<any>,
  requiredRole?: UserRole | UserRole[]
) => {
  return function AuthenticatedComponent(props: any) {
    const { user, canAccess, isLoading } = useAuth();

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
      return <div className="flex items-center justify-center h-screen">Please log in</div>;
    }

    if (requiredRole && !canAccess(requiredRole)) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};

// Permission checking component
export const ProtectedComponent: React.FC<{
  children: ReactNode;
  module: string;
  action: string;
  fallback?: ReactNode;
}> = ({ children, module, action, fallback = null }) => {
  const { hasPermission } = useAuth();
  
  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Role-based component visibility
export const RoleBasedComponent: React.FC<{
  children: ReactNode;
  roles: UserRole | UserRole[];
  fallback?: ReactNode;
}> = ({ children, roles, fallback = null }) => {
  const { canAccess } = useAuth();
  
  if (!canAccess(roles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};
