/** Auth pages always use light theme — scoped CSS vars work on SSR (no flash) */
export function AuthThemeScope({ children }: { children: React.ReactNode }) {
  return <div className="auth-light">{children}</div>;
}