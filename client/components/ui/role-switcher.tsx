import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@shared/types';
import { User, Shield, Wrench, Settings } from 'lucide-react';

const roleIcons = {
  [UserRole.ADMIN]: Shield,
  [UserRole.OFFICE_MANAGER]: Settings,
  [UserRole.TECHNICIAN]: Wrench,
};

const roleLabels = {
  [UserRole.ADMIN]: 'Admin',
  [UserRole.OFFICE_MANAGER]: 'Office Manager',
  [UserRole.TECHNICIAN]: 'Technician',
};

const roleColors = {
  [UserRole.ADMIN]: 'bg-red-100 text-red-800 border-red-200',
  [UserRole.OFFICE_MANAGER]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UserRole.TECHNICIAN]: 'bg-green-100 text-green-800 border-green-200',
};

export const RoleSwitcher: React.FC = () => {
  const { user, switchUser } = useAuth();

  if (!user) return null;

  const CurrentIcon = roleIcons[user.role];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{roleLabels[user.role]}</span>
          <Badge variant="outline" className={`${roleColors[user.role]} text-xs`}>
            {user.role}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <div className="px-2 py-1">
          <p className="text-xs text-muted-foreground mb-2">Switch Role (Demo):</p>
        </div>
        {Object.values(UserRole).map((role) => {
          const Icon = roleIcons[role];
          const isCurrentRole = user.role === role;
          
          return (
            <DropdownMenuItem
              key={role}
              onClick={() => !isCurrentRole && switchUser(role)}
              disabled={isCurrentRole}
              className="gap-2"
            >
              <Icon className="h-4 w-4" />
              <span>{roleLabels[role]}</span>
              {isCurrentRole && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// User info display component
export const UserInfo: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const Icon = roleIcons[user.role];

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
      </div>
      <Badge variant="outline" className={`${roleColors[user.role]} text-xs`}>
        {user.role}
      </Badge>
    </div>
  );
};
