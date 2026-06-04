"use client";

import { useEffect, useState, useCallback, useTransition, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { authService } from "@/src/lib/auth/auth-service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { AUTH_STORAGE_KEYS } from "@/src/lib/auth/constants";

// Validation utilities
const validateUsername = (username: string): string | null => {
  if (!username.trim()) return "Username is required";
  if (username.length < 3) return "Username must be at least 3 characters";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
};

// Feature card component for reusability
const FeatureCard = ({ icon: Icon, title, description, iconBg }: any) => (
  <div className="flex gap-3 rounded-lg border border-emerald-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconBg)}>
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  </div>
);

// Form field component for consistency
const FormField = ({ id, label, icon: Icon, error, children }: any) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-600 animate-in slide-in-from-top-1">{error}</p>}
  </div>
);

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, session } = useAuth();
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem(AUTH_STORAGE_KEYS.rememberedUsername);
    if (savedUsername) {
      setFormData(prev => ({ ...prev, username: savedUsername, rememberMe: true }));
    }
    setIsInitialized(true);
  }, []);

  // Handle redirect after authentication
  useEffect(() => {
    if (isAuthenticated && !authLoading && session && isInitialized) {
      const redirectPath = authService.getLoginRedirect(session);
      startTransition(() => {
        router.replace(redirectPath);
      });
    }
  }, [isAuthenticated, authLoading, session, router, isInitialized]);

  const updateField = useCallback((field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    
    const newErrors = {
      username: usernameError || undefined,
      password: passwordError || undefined,
    };
    
    setErrors(newErrors);
    return !usernameError && !passwordError;
  }, [formData.username, formData.password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitError(null);
    const normalizedUsername = formData.username.trim();
    
    const result = await login({
      username: normalizedUsername,
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    if (!result.success) {
      setSubmitError(result.error.message);
      return;
    }

    // Handle remember me
    if (formData.rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.rememberedUsername, normalizedUsername);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.rememberedUsername);
    }
  };

  const isLoading = isPending || authLoading;
  const isDisabled = isLoading || !isInitialized;

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7fbfa] via-white to-[#f7fbfa]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-emerald-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-all hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to site
          </Link>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure Portal
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto grid min-h-[calc(100vh-73px)] w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_440px] lg:px-8">
        
        {/* Left Side - Hero Section */}
        <section className="hidden max-w-xl lg:block">
          <div className="inline-flex animate-in fade-in slide-in-from-top-4 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-100">
            <HeartPulse className="h-4 w-4 animate-pulse" />
            Healthcare Group ERP
          </div>
          
          <h1 className="mt-6 text-4xl font-bold leading-tight text-slate-950 animate-in fade-in slide-in-from-left-4">
            Professional access for hospital operations
          </h1>
          
          <p className="mt-4 text-base leading-7 text-slate-600 animate-in fade-in slide-in-from-left-4 delay-100">
            Secure login for appointments, patients, pharmacy, diagnostics,
            accounts, and administration teams.
          </p>

          <div className="mt-8 grid gap-4 animate-in fade-in slide-in-from-bottom-4 delay-200">
            <FeatureCard
              icon={ShieldCheck}
              title="Role-based security"
              description="Every user lands on the right dashboard for their department."
              iconBg="bg-emerald-50 text-emerald-700"
            />
            <FeatureCard
              icon={Building2}
              title="Multi-department workflow"
              description="Designed for clinical, billing, lab, and pharmacy operations."
              iconBg="bg-sky-50 text-sky-700"
            />
          </div>
        </section>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-[440px] justify-self-center lg:justify-self-end">
          <Card className="overflow-hidden border border-emerald-100 bg-white shadow-xl transition-all hover:shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 animate-in slide-in-from-top-full duration-700" />
            
            <CardHeader className="space-y-3 px-6 pb-4 pt-6 text-center sm:px-8">
              <div className="flex justify-center">
                <div className="relative h-[200px] w-[200px] max-w-full transition-transform hover:scale-105">
                  <Image
                    src="/logo.png"
                    alt="Company logo"
                    fill
                    sizes="200px"
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
              
              <div>
                <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Authorized access only
                </div>
                <h2 className="mt-4 text-2xl font-semibold text-slate-950">
                  Sign in to ERP
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Use your credentials to continue
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0 sm:px-8">
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Error Message */}
                {submitError && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Username Field */}
                <FormField
                  id="username"
                  label="Username or Email"
                  icon={Mail}
                  error={errors.username}
                >
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    value={formData.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    placeholder="Enter your username"
                    disabled={isDisabled}
                    className={cn(
                      "h-11 border-slate-200 bg-white pl-9 transition-all focus-visible:ring-emerald-600",
                      errors.username && "border-red-300 focus-visible:ring-red-500"
                    )}
                  />
                </FormField>

                {/* Password Field */}
                <FormField
                  id="password"
                  label="Password"
                  icon={Lock}
                  error={errors.password}
                >
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Enter your password"
                    disabled={isDisabled}
                    className={cn(
                      "h-11 border-slate-200 bg-white pl-9 pr-9 transition-all focus-visible:ring-emerald-600",
                      errors.password && "border-red-300 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    disabled={isDisabled}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </FormField>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={(e) => updateField("rememberMe", e.target.checked)}
                      disabled={isDisabled}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-700 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitError(null);
                      // Show a toast or modal instead of alert for better UX
                      const message = "Contact your administrator to reset password";
                      setSubmitError(message);
                      setTimeout(() => setSubmitError(null), 5000);
                    }}
                    className="text-sm text-emerald-700 transition-colors hover:text-emerald-800 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-11 w-full bg-emerald-700 font-semibold transition-all hover:bg-emerald-800 hover:shadow-lg disabled:opacity-50"
                  disabled={isDisabled}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>

                {/* Security Notice */}
                <div className="mt-4 text-center text-xs text-slate-400">
                  <CheckCircle className="mr-1 inline-block h-3 w-3" />
                  Secured by SSL encryption
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}