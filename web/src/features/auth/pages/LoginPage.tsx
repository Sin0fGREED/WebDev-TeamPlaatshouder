import { type FormEvent, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // min 8 chars, at least one uppercase, one number and one special char
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  function validatePassword(value: string) {
    if (!passwordRegex.test(value)) {
      return false;
    }
    setPasswordError(null);
    return true;
  }

  function validate(): boolean {
    let ok = true;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email (user@email.com)");
      ok = false;
    } else {
      setEmailError(null);
    }

    if (!validatePassword(password)) ok = false;

    return ok;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
<<<<<<< Updated upstream
      // somewhere in your LoginPage submit:
      const email = "admin@test.com";
      const password = "password";
=======
>>>>>>> Stashed changes
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const { token } = await res.json();
      login(token, { email })
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  // Dev sign-in: uses hardcoded credentials and bypasses validation
  async function devSignIn() {
    setError(null);
    setLoading(true);
    try {
      const email = "bob@gmail.com";
      const password = "password";
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const { token } = await res.json();
      login(token, { email });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Dev sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url('/blue_background.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center">
        <div className="w-80 h-80 bg-white shadow-md p-6 flex flex-col justify-center">
        <h1 className="mb-4 text-center text-2xl font-semibold">Login</h1>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="user@email.com"
            required
            className="rounded-md border px-3 py-2"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p id="email-error" className="text-xs text-red-600">
              {emailError}
            </p>
          )}

          <label className="text-sm font-medium mt-2">Password</label>
          <input
            value={password}
            onChange={(e) => {
              const v = e.target.value;
              setPassword(v);
              if (!passwordTouched && v.length > 0) setPasswordTouched(true);
              if (passwordTouched) validatePassword(v);
            }}
            onBlur={() => setPasswordTouched(true)}
            type="password"
            placeholder="Your secure password"
            required
            className="border px-3 py-2"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "pwd-error" : undefined}
          />
          {passwordError && passwordTouched && (
            <p id="pwd-error" className="text-xs text-red-600">
              {passwordError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </form>

        <p className="mt-3 text-center text-sm text-gray-600">
          No account? {" "}
          <Link className="text-blue-600 hover:underline" to="/register">
            Register
          </Link>
        </p>
        </div>

        <div className="w-80 flex justify-end mt-4">
          <button
            type="button"
            onClick={devSignIn}
            disabled={loading}
            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in (dev token)"}
          </button>
        </div>
      </div>
    </div>
  );
}
