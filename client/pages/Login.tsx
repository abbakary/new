import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@shared/types';
import {
  Shield,
  Settings,
  Wrench,
  Eye,
  EyeOff,
  LogIn,
  LayoutDashboard,
  User,
  Mail,
  Lock,
} from 'lucide-react';

const userRoles = [
  {
    role: UserRole.ADMIN,
    title: 'Administrator',
    description: 'Full system access and user management',
    icon: Shield,
    color: 'bg-red-50 border-red-200 hover:bg-red-100',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    permissions: [
      'Manage all users and permissions',
      'System configuration and settings',
      'Full access to all modules',
      'Analytics and reporting',
    ],
    demoCredentials: {
      email: 'admin@company.com',
      password: 'admin123',
    },
  },
  {
    role: UserRole.OFFICE_MANAGER,
    title: 'Office Manager',
    description: 'Customer and order management operations',
    icon: Settings,
    color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    permissions: [
      'Customer management and records',
      'Create and assign job cards',
      'Order management and tracking',
      'Service scheduling and coordination',
      'Invoice and billing management',
    ],
    demoCredentials: {
      email: 'manager@company.com',
      password: 'manager123',
    },
  },
  {
    role: UserRole.TECHNICIAN,
    title: 'Technician',
    description: 'Job execution and time tracking',
    icon: Wrench,
    color: 'bg-green-50 border-green-200 hover:bg-green-100',
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    permissions: [
      'View assigned job cards',
      'Update job status and progress',
      'Time tracking and labor logs',
      'Materials usage recording',
      'Sales items management',
    ],
    demoCredentials: {
      email: 'tech@company.com',
      password: 'tech123',
    },
  },
];

export default function Login() {
  const { login, isLoading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const roleConfig = userRoles.find(r => r.role === role);
    if (roleConfig) {
      setEmail(roleConfig.demoCredentials.email);
      setPassword(roleConfig.demoCredentials.password);
    }
    setLoginError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError('Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    setLoginError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setLoginError('Invalid credentials. Please try again.');
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    const roleConfig = userRoles.find(r => r.role === role);
    if (!roleConfig) return;

    setIsSubmitting(true);
    setLoginError('');

    try {
      const success = await login(roleConfig.demoCredentials.email, roleConfig.demoCredentials.password);
      if (!success) {
        setLoginError('Demo login failed. Please try again.');
      }
    } catch (error) {
      setLoginError('Demo login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <LayoutDashboard className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center">
              <LayoutDashboard className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TrackPro</h1>
              <p className="text-sm text-gray-600">POS Tracking System</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Your Service Management Platform
          </h2>
          <p className="text-gray-600">
            Choose your role to access the dashboard with appropriate permissions
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Role Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Select Your Role
                </CardTitle>
                <CardDescription>
                  Choose your user type to see role-specific features and access levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userRoles.map((roleConfig) => {
                  const Icon = roleConfig.icon;
                  const isSelected = selectedRole === roleConfig.role;
                  
                  return (
                    <div
                      key={roleConfig.role}
                      className={`
                        relative cursor-pointer rounded-lg border-2 p-4 transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5 shadow-lg' 
                          : `${roleConfig.color} border-gray-200`
                        }
                      `}
                      onClick={() => handleRoleSelect(roleConfig.role)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          rounded-lg p-2 
                          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white shadow-sm'}
                        `}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {roleConfig.title}
                            </h3>
                            <Badge className={roleConfig.badgeColor}>
                              {roleConfig.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">
                            {roleConfig.description}
                          </p>
                          
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Key Permissions:
                            </p>
                            {roleConfig.permissions.slice(0, 3).map((permission, index) => (
                              <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                <div className="h-1 w-1 bg-gray-400 rounded-full" />
                                {permission}
                              </div>
                            ))}
                            {roleConfig.permissions.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{roleConfig.permissions.length - 3} more permissions
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDemoLogin(roleConfig.role);
                          }}
                          disabled={isSubmitting}
                        >
                          Quick Login
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Login Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  {selectedRole 
                    ? `Login as ${userRoles.find(r => r.role === selectedRole)?.title}`
                    : 'Enter your credentials or select a role for demo access'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="pl-10 pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{loginError}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || !email || !password}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>

                {selectedRole && (
                  <>
                    <Separator className="my-6" />
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">Demo Credentials</p>
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p><strong>Email:</strong> {email}</p>
                        <p><strong>Password:</strong> {password}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Demo Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Demo Mode</CardTitle>
                <CardDescription>
                  This is a demonstration system with pre-configured user roles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">Admin Access</span>
                    <Badge className="bg-red-100 text-red-800">Full Control</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">Manager Access</span>
                    <Badge className="bg-blue-100 text-blue-800">Operations</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium">Technician Access</span>
                    <Badge className="bg-green-100 text-green-800">Job Tasks</Badge>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500">
                  Select any role above to explore the system with that user's permissions and dashboard view.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
