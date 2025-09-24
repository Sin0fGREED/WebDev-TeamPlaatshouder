import { Link } from "react-router-dom";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-semibold">Register</h1>
      <form className="space-y-4">
        <input className="w-full rounded-md border px-3 py-2" placeholder="Email" />
        <input className="w-full rounded-md border px-3 py-2" placeholder="Password" type="password" />
        <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-500" type="button">
          Create account (stub)
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        Already have an account?{" "}
        <Link className="text-blue-600 hover:underline" to="/login">
          Login
        </Link>
      </p>
    </div>
  );
}
