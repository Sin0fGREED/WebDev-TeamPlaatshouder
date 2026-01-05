import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../app/providers/AuthProvider";

/* =======================
   Validation Rules
======================= */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// min 8 chars, 1 uppercase, 1 number, 1 special char
const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

/* =======================
   Register Modal
======================= */

type RegisterBoxProps = {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  error: string | null;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
};

function RegisterBox({
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  error,
  onSubmit,
  onClose,
}: RegisterBoxProps) {
  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
      <div className="relative w-80 bg-white shadow-md p-6 rounded-lg">
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 font-bold"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-center mb-4">Register</h2>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="user@email.com"
            className="border rounded-md px-3 py-2"
            required
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="border rounded-md px-3 py-2"
            required
          />

          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm Password"
            className="border rounded-md px-3 py-2"
            required
          />

          <button
            type="submit"
            className="mt-3 bg-green-600 text-white py-2 rounded-md hover:bg-green-500 transition-colors"
          >
            Register
          </button>
        </form>

        {error && (
          <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}

/* =======================
   Login Page
======================= */

export default function LoginPage() {
  /* Login */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  /* Register */
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/";

  /* ---------- Login ---------- */

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailRegex.test(loginEmail)) {
      setError("Please enter a valid email (user@email.com)");
      return;
    }

    if (!passwordRegex.test(loginPassword)) {
      setError(
        "Password must be 8+ chars, include uppercase, number, and special character"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      if (!res.ok) throw new Error("Invalid credentials");
      const { token } = await res.json();

      login(token, { email: loginEmail });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Dev Token ---------- */

  async function handleDevLogin() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "dev@company.com",
          password: "DevPassword1!",
        }),
      });

      if (!res.ok) throw new Error("Dev login failed");
      const { token } = await res.json();

      login(token, { email: "dev@company.com" });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? "Dev login failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Register ---------- */

  function handleRegister(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!emailRegex.test(registerEmail)) {
      setError("Please enter a valid email (user@email.com)");
      return;
    }

    if (!passwordRegex.test(registerPassword)) {
      setError(
        "Password must be 8+ chars, include uppercase, number, and special character"
      );
      return;
    }

    if (registerPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    alert("Registration successful");
    setShowRegister(false);
  }

  return (
    <div className="w-screen h-screen flex items-center justify-center relative bg-[url('/blue_background.jpg')] bg-cover bg-center">
      <div className="z-10">
        <div className="w-80 bg-white shadow-md p-6 rounded-lg">
          <h1 className="text-2xl font-semibold text-center mb-4">Login</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              type="email"
              placeholder="user@email.com"
              className="border rounded-md px-3 py-2"
              required
            />

            <input
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="border rounded-md px-3 py-2"
              required
            />

            <button
              disabled={loading}
              className="mt-3 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <button
            type="button"
            disabled={loading}
            onClick={handleDevLogin}
            className="mt-3 w-full bg-gray-200 text-gray-800 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Sign in (Dev Token)
          </button>

          <p className="text-sm text-gray-600 mt-3 text-center">
            No account?{" "}
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                setError(null);
                setShowRegister(true);
              }}
            >
              Register
            </button>
          </p>

          {error && (
            <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
          )}
        </div>
      </div>

      {showRegister && (
        <RegisterBox
          email={registerEmail}
          setEmail={setRegisterEmail}
          password={registerPassword}
          setPassword={setRegisterPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          error={error}
          onSubmit={handleRegister}
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  );
}