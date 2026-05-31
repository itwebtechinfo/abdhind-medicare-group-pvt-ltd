"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { authService } from "@/src/lib/auth/auth-service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

export function LoginForm() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading, session } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (isAuthenticated && !authLoading && session) {
      router.replace(authService.getLoginRedirect(session));
    }
  }, [isAuthenticated, authLoading, session, router]);

  const validate = () => {
    const next: typeof fieldErrors = {};
    if (!username.trim()) next.username = "Username is required";
    if (!password) next.password = "Password is required";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login({
      username: username.trim(),
      password,
      rememberMe,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    const restored = authService.restoreSession();
    router.replace(authService.getLoginRedirect(restored));
  };

  const loading = isSubmitting || authLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px]">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-4 pb-6 pt-8 text-center">
            {/* Logo Section */}
            <div className="flex justify-center">
              <div className="relative h-20 w-48">
                <Image
                  src="/logo.png"
                  alt="Abd Hind Medicare"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Abd Hind Medicare
              </h2>
              <p className="text-sm text-slate-500">Private Limited</p>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Sign in
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Access your account
              </p>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-0">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {notice && (
                <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                  {notice}
                </div>
              )}

              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Username or Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setFieldErrors((p) => ({ ...p, username: undefined }));
                    }}
                    placeholder="Enter your username"
                    disabled={loading}
                    className={cn(
                      "h-10 border-slate-200 pl-9 focus-visible:ring-emerald-600",
                      fieldErrors.username && "border-red-300 focus-visible:ring-red-500"
                    )}
                  />
                </div>
                {fieldErrors.username && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.username}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFieldErrors((p) => ({ ...p, password: undefined }));
                    }}
                    placeholder="Enter your password"
                    disabled={loading}
                    className={cn(
                      "h-10 border-slate-200 pl-9 pr-9 focus-visible:ring-emerald-600",
                      fieldErrors.password && "border-red-300 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() => setNotice("Contact your administrator to reset password")}
                  className="text-sm text-emerald-700 hover:text-emerald-800"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                className="h-10 w-full bg-emerald-700 hover:bg-emerald-800"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              <p className="text-center text-xs text-slate-400">
                Abd Hind Medicare PVT LTD
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}