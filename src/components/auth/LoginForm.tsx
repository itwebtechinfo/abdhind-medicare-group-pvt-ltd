"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  User,
  CheckCircle,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/src/hooks/useAuth";
import { authService } from "@/src/lib/auth/auth-service";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { InfoTooltip } from "@/src/components/ui/info-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";
import { AUTH_STORAGE_KEYS } from "@/src/lib/auth/constants";
import { loginSchema, type LoginFormValues } from "@/src/features/auth/login-schema";
import { toast } from "@/src/lib/toast";
import { patientService } from "@/src/features/patients/patient";
import {
  OTP_LENGTH,
  OTP_RESEND_COOLDOWN_SECONDS,
  PATIENT_SIGNUP_DETAIL_FIELDS,
  patientSignupSchema,
  type PatientSignupFormValues,
} from "@/src/features/patients/patient";
import { INDIA_STATES, getDistricts } from "@/src/data/india-states-districts";
import type { NormalizedApiError } from "@/src/types/api";

// Feature card component for reusability
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  iconBg,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  iconBg: string;
}) => (
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

// Marks a field as required — placed right after the field's label.
const RequiredMark = () => <span className="text-red-500">&nbsp;*</span>;

// Form field component for consistency
const FormField = ({
  id,
  label,
  icon: Icon,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  icon: LucideIcon;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <RequiredMark />}
    </label>
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-600 animate-in slide-in-from-top-1">{error}</p>}
  </div>
);

// Plain (icon-less) labeled field — used for select/optional inputs.
const PlainField = ({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
      {label}
      {required && <RequiredMark />}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-600 animate-in slide-in-from-top-1">{error}</p>}
  </div>
);

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition-all focus-visible:ring-2 focus-visible:ring-emerald-600";

export function LoginForm() {
  const router = useRouter();
  const { login, signup, isAuthenticated, isLoading: authLoading, session } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [showPassword, setShowPassword] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mode, setMode] = useState<"signin" | "register">("signin");

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "", rememberMe: false },
  });

  const phoneField = register("phone");

  // Load saved phone number on mount
  useEffect(() => {
    const savedPhone = localStorage.getItem(AUTH_STORAGE_KEYS.rememberedPhone);
    if (savedPhone) {
      setValue("phone", savedPhone);
      setValue("rememberMe", true);
    }
    setIsInitialized(true);
  }, [setValue]);

  // Handle redirect after authentication — any successfully authenticated
  // user (staff or patient) goes straight to their permission-gated ERP
  // dashboard; the sidebar renders whatever their permissions allow.
  useEffect(() => {
    if (isAuthenticated && !authLoading && session && isInitialized) {
      const redirectPath = authService.getLoginRedirect(session);
      startTransition(() => {
        router.replace(redirectPath);
      });
    }
  }, [isAuthenticated, authLoading, session, router, isInitialized]);

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");

    const result = await login({
      phone: values.phone,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (!result.success) {
      setError("root", { message: result.error.message });
      return;
    }

    if (values.rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEYS.rememberedPhone, values.phone);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.rememberedPhone);
    }
  });

  const isLoading = isPending || authLoading || isSubmitting;
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

      {/* Main Content — register mode drops the hero column and centers a
          wider, top-aligned card so the (longer) form stays the sole focus
          and works well on small screens. */}
      <main
        className={cn(
          "mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
          mode === "signin"
            ? "grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1fr)_440px]"
            : "flex max-w-xl flex-col"
        )}
      >
        {/* Left Side - Hero Section (sign in only) */}
        {mode === "signin" && (
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
        )}

        {/* Right Side - Login / Register Form */}
        <div
          className={cn(
            "w-full",
            mode === "signin" ? "max-w-[440px] justify-self-center lg:justify-self-end" : "max-w-xl"
          )}
        >
          <Card className="overflow-hidden border border-emerald-100 bg-white shadow-xl transition-all hover:shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-500 animate-in slide-in-from-top-full duration-700" />

            <CardHeader className="space-y-3 px-6 pb-4 pt-6 text-center sm:px-8">
              <div className="flex justify-center">
                <div
                  className={cn(
                    "relative max-w-full transition-transform hover:scale-105",
                    mode === "signin" ? "h-[200px] w-[200px]" : "h-[120px] w-[120px]"
                  )}
                >
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
                  {mode === "signin" ? "Sign in" : "Patient Registration"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {mode === "signin"
                    ? "Staff and patients — use your phone number and password"
                    : "Fill in your details to create your patient account"}
                </p>
              </div>
            </CardHeader>

            <CardContent className="px-6 pb-6 pt-0 sm:px-8">
              {mode === "register" ? (
                <PatientRegisterForm
                  signup={signup}
                  onDone={(phone) => {
                    setMode("signin");
                    if (phone) setValue("phone", phone);
                  }}
                />
              ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                {/* Error Message */}
                {errors.root?.message && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errors.root.message}</span>
                  </div>
                )}

                {/* Phone Field */}
                <FormField
                  id="phone"
                  label="Phone Number"
                  icon={Phone}
                  error={errors.phone?.message}
                >
                  <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                    +91
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    disabled={isDisabled}
                    className={cn(
                      "h-11 border-slate-200 bg-white pl-16 transition-all focus-visible:ring-emerald-600",
                      errors.phone && "border-red-300 focus-visible:ring-red-500"
                    )}
                    {...phoneField}
                    onChange={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
                      phoneField.onChange(e);
                    }}
                  />
                </FormField>

                {/* Password Field */}
                <FormField
                  id="password"
                  label="Password"
                  icon={Lock}
                  error={errors.password?.message}
                >
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isDisabled}
                    className={cn(
                      "h-11 border-slate-200 bg-white pl-9 pr-9 transition-all focus-visible:ring-emerald-600",
                      errors.password && "border-red-300 focus-visible:ring-red-500"
                    )}
                    {...register("password")}
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
                      disabled={isDisabled}
                      className="h-4 w-4 rounded border-slate-300 accent-emerald-700 focus:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                      {...register("rememberMe")}
                    />
                    <span>Remember me</span>
                    <InfoTooltip text="Unchecked, you'll stay signed in only in this browser tab — closing it or opening a new tab/window signs you out. Check this on your own device to stay signed in across browser restarts." />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      toast.info(
                        "Forgot your password?",
                        "Contact your administrator to reset it."
                      )
                    }
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

                {/* New patient signup */}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  disabled={isDisabled}
                  className="w-full text-center text-sm font-medium text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  New patient? Create an account
                </button>

                {/* Security Notice */}
                <div className="mt-4 text-center text-xs text-slate-400">
                  <CheckCircle className="mr-1 inline-block h-3 w-3" />
                  Secured by SSL encryption
                </div>
              </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function PatientRegisterForm({
  signup,
  onDone,
}: {
  signup: ReturnType<typeof useAuth>["signup"];
  /** Called after the result modal is dismissed. `phone` is set on success, so the sign-in form can be prefilled. */
  onDone: (phone?: string) => void;
}) {
  const [step, setStep] = useState<"details" | "otp">("details");
  const [cooldown, setCooldown] = useState(0);
  const [result, setResult] = useState<
    { success: true; phone: string } | { success: false; message: string } | null
  >(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PatientSignupFormValues>({
    resolver: zodResolver(patientSignupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone_number: "",
      state: "",
      district: "",
      age: "",
      gender: "",
      address: "",
      password: "",
      otp: "",
    },
  });

  const selectedState = useWatch({ control, name: "state" });
  const districts = getDistricts(selectedState || "");

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otpMutation = useMutation({
    mutationFn: (phone: string) => patientService.requestSignupOtp(phone),
    onSuccess: () => {
      setStep("otp");
      setCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      toast.success("OTP sent", "Check WhatsApp for your 6-digit code.");
    },
    onError: (err: NormalizedApiError) => toast.error(err.error, err.msg),
  });

  const onSubmit = handleSubmit(async (values) => {
    const signupResult = await signup({
      phone_number: values.phone_number,
      password: values.password,
      full_name: values.full_name,
      otp: values.otp,
      state: values.state,
      district: values.district,
      email: values.email || undefined,
      age: values.age ? Number(values.age) : undefined,
      gender: values.gender || undefined,
      address: values.address || undefined,
    });
    setResult(
      signupResult.success
        ? { success: true, phone: values.phone_number }
        : { success: false, message: signupResult.error.message }
    );
  });

  if (step === "details") {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const valid = await trigger(PATIENT_SIGNUP_DETAIL_FIELDS);
          if (!valid) return;
          otpMutation.mutate(getValues("phone_number"));
        }}
        className="space-y-4"
        noValidate
      >
        <FormField id="full_name" label="Full Name" icon={User} error={errors.full_name?.message} required>
          <Input
            id="full_name"
            placeholder="Jane Doe"
            className="h-11 border-slate-200 bg-white pl-9 focus-visible:ring-emerald-600"
            {...register("full_name")}
          />
        </FormField>

        <FormField id="email" label="Email" icon={ShieldCheck} error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            className="h-11 border-slate-200 bg-white pl-9 focus-visible:ring-emerald-600"
            {...register("email")}
          />
        </FormField>

        <FormField
          id="reg-phone"
          label="Phone Number"
          icon={Phone}
          error={errors.phone_number?.message}
          required
        >
          <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
            +91
          </span>
          <Input
            id="reg-phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            className="h-11 border-slate-200 bg-white pl-16 focus-visible:ring-emerald-600"
            {...register("phone_number", {
              onChange: (e) => {
                e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
              },
            })}
          />
        </FormField>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PlainField id="state" label="State" error={errors.state?.message} required>
            <select
              id="state"
              className={SELECT_CLASS}
              {...register("state", {
                onChange: () => setValue("district", "", { shouldValidate: false }),
              })}
            >
              <option value="">Select state</option>
              {INDIA_STATES.map((state) => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </PlainField>
          <PlainField id="district" label="District" error={errors.district?.message} required>
            <select
              id="district"
              className={SELECT_CLASS}
              disabled={!selectedState}
              {...register("district")}
            >
              <option value="">{selectedState ? "Select district" : "Select a state first"}</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </PlainField>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PlainField id="age" label="Age" error={errors.age?.message}>
            <Input
              id="age"
              placeholder="e.g. 28"
              className="h-11 border-slate-200 bg-white focus-visible:ring-emerald-600"
              {...register("age")}
            />
          </PlainField>
          <PlainField id="gender" label="Gender" error={errors.gender?.message}>
            <select id="gender" className={SELECT_CLASS} {...register("gender")}>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </PlainField>
        </div>

        <PlainField id="address" label="Address" error={errors.address?.message}>
          <Input
            id="address"
            placeholder="House No., Street, Area, City"
            className="h-11 border-slate-200 bg-white focus-visible:ring-emerald-600"
            {...register("address")}
          />
        </PlainField>

        <FormField id="reg-password" label="Password" icon={Lock} error={errors.password?.message} required>
          <Input
            id="reg-password"
            type="password"
            placeholder="Create a password"
            className="h-11 border-slate-200 bg-white pl-9 focus-visible:ring-emerald-600"
            {...register("password")}
          />
        </FormField>

        <Button
          type="submit"
          className="h-11 w-full bg-emerald-700 font-semibold hover:bg-emerald-800"
          disabled={otpMutation.isPending}
        >
          {otpMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending OTP...
            </>
          ) : (
            "Send OTP"
          )}
        </Button>
        <button
          type="button"
          onClick={() => onDone()}
          className="w-full text-center text-sm font-medium text-emerald-700 hover:underline"
        >
          Already have an account? Sign in
        </button>
      </form>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          id="otp"
          label={`OTP sent to +91 ${getValues("phone_number")}`}
          icon={ShieldCheck}
          error={errors.otp?.message}
          required
        >
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={OTP_LENGTH}
            placeholder="000000"
            className="h-11 border-slate-200 bg-white pl-9 text-center tracking-[0.3em] focus-visible:ring-emerald-600"
            {...register("otp")}
          />
        </FormField>

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={cooldown > 0 || otpMutation.isPending}
            onClick={() => otpMutation.mutate(getValues("phone_number"))}
            className="font-medium text-emerald-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
          </button>
          <button
            type="button"
            onClick={() => setStep("details")}
            className="font-medium text-slate-500 hover:underline"
          >
            Edit details
          </button>
        </div>

        <Button
          type="submit"
          className="h-11 w-full bg-emerald-700 font-semibold hover:bg-emerald-800"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <Dialog open={result !== null} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{result?.success ? "Registration Successful" : "Registration Failed"}</DialogTitle>
            <DialogDescription>
              {result?.success
                ? "Your account has been created. Please sign in with your phone number and password."
                : result && "message" in result
                  ? result.message
                  : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => (result?.success ? onDone(result.phone) : setResult(null))}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

