import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  user?: { email: string } | null;
};

type AuthContextValue = {
  token: string | null;
  user: { email: string } | null | undefined;
  login: (token: string, user?: { email: string } | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null });

  // hydrate from localStorage on first mount (browser only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("user:email");
    if (token) setState({ token, user: email ? { email } : null });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    token: state.token,
    user: state.user,
    isAuthenticated: !!state.token,
    login: (token, user) => {
      setState({ token, user });
      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        if (user?.email) localStorage.setItem("user:email", user.email);
      }
    },
    logout: () => {
      setState({ token: null, user: null });
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user:email");
      }
    },
  }), [state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
