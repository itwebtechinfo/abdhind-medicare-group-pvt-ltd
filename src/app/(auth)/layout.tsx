/** Login, change-password and access-denied: no website chrome, no ERP shell. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="auth-layout" className="flex min-h-screen w-full flex-col">{children}</div>
  );
}
