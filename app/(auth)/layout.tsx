// Auth pages render their own full-screen shells (LoginShell etc).
// This thin layout exists so the route group works.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
