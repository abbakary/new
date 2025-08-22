import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@shared/types";
import {
  Eye,
  EyeOff,
  LogIn,
  Mail,
  Lock,
  User,
  Settings,
  Wrench,
} from "lucide-react";

const userRoles = [
  {
    role: UserRole.ADMIN,
    title: "Administrator",
    icon: User,
    credentials: { email: "admin@company.com", password: "admin123" },
  },
  {
    role: UserRole.OFFICE_MANAGER,
    title: "Office Manager",
    icon: Settings,
    credentials: { email: "manager@company.com", password: "manager123" },
  },
  {
    role: UserRole.TECHNICIAN,
    title: "Technician",
    icon: Wrench,
    credentials: { email: "tech@company.com", password: "tech123" },
  },
];

export default function Login() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError("Please enter email and password");
      return;
    }

    setIsSubmitting(true);
    setLoginError("");

    try {
      const success = await login(email, password);
      if (!success) {
        setLoginError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    const roleConfig = userRoles.find((r) => r.role === role);
    if (!roleConfig) return;

    setIsSubmitting(true);
    setLoginError("");

    try {
      const success = await login(
        roleConfig.credentials.email,
        roleConfig.credentials.password,
      );
      if (!success) {
        setLoginError("Demo login failed. Please try again.");
      }
    } catch (error) {
      setLoginError("Demo login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-yellow-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-yellow-200 to-yellow-100 flex">
      {/* Left Side - Rotating Tyre with Branding */}
      <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-yellow-500 rounded-full animate-pulse"></div>
          <div
            className="absolute bottom-32 right-16 w-24 h-24 bg-yellow-400 rounded-full animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-600 rounded-full animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="relative z-10 text-center">
          {/* Rotating Tyre */}
          <div className="relative mb-8">
            <div className="w-80 h-80 mx-auto relative">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Ff4170ecfb6804b8283d5b1f576b5f60e%2F44ddb2377a754464bd43ae7d8d5214e1?format=webp&width=800"
                alt="Rotating Tyre"
                className="w-full h-full object-contain animate-spin-slow"
                style={{
                  filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
                  animation: "rotate 3s linear infinite",
                }}
              />
              {/* Glow effect behind tyre */}
              <div className="absolute inset-0 -z-10 bg-gradient-radial from-yellow-400/50 to-transparent blur-xl"></div>
            </div>
          </div>

          {/* Company Branding */}
          <div className="text-center space-y-4">
            <h1
              className="text-6xl font-bold text-yellow-600 drop-shadow-lg"
              style={{
                fontFamily: "Impact, Arial Black, sans-serif",
                textShadow: "3px 3px 0px rgba(0,0,0,0.1)",
                letterSpacing: "2px",
              }}
            >
              SUPERDOLL
            </h1>
            <div className="space-y-2">
              <p className="text-xl font-semibold text-yellow-800">
                Premium Tyre Services
              </p>
              <p className="text-lg text-yellow-700">
                Professional • Reliable • Fast
              </p>
            </div>
            <div className="flex items-center justify-center space-x-6 mt-6 text-yellow-700">
              <div className="text-center">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">Service</div>
              </div>
              <div className="w-px h-12 bg-yellow-400"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm">Quality</div>
              </div>
              <div className="w-px h-12 bg-yellow-400"></div>
              <div className="text-center">
                <div className="text-2xl font-bold">Fast</div>
                <div className="text-sm">Install</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Welcome Card */}
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back
              </CardTitle>
              <p className="text-gray-600">Sign in to your account</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-12 h-12 bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-12 pr-12 h-12 bg-gray-50 border-2 border-gray-200 focus:border-yellow-400 focus:bg-white transition-all"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isSubmitting}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <p className="text-sm text-red-600">{loginError}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold text-lg shadow-lg transition-all transform hover:scale-105"
                  disabled={isSubmitting || !email || !password}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Access */}
              <div className="border-t pt-6">
                <p className="text-center text-sm text-gray-600 mb-4">
                  Quick Demo Access
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {userRoles.map((role) => {
                    const Icon = role.icon;
                    return (
                      <Button
                        key={role.role}
                        variant="outline"
                        onClick={() => handleDemoLogin(role.role)}
                        disabled={isSubmitting}
                        className="h-10 justify-start gap-3 hover:bg-yellow-50 hover:border-yellow-300 transition-all"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="flex-1 text-left">{role.title}</span>
                        <span className="text-xs text-gray-500">Demo</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center text-sm text-yellow-800 bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <p className="font-medium mb-1">
              Professional Tyre Management System
            </p>
            <p>Need help? Contact support@superdoll.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
