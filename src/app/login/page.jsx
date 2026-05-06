"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogle = () => signIn("google", { callbackUrl: "/products" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (isSignUp) {
      if (password !== confirm) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.push("/products");
    } else {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result.error) setError("Invalid email or password");
      else router.push("/products");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-900">{isSignUp ? "Create account" : "Welcome back"}</h2>
        <p className="text-center text-gray-500 mt-1">{isSignUp ? "Sign up to start shopping" : "Sign in to continue"}</p>
        {error && <div className="mt-4 p-2 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignUp && (
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
          {isSignUp && (
            <input type="password" placeholder="Confirm password" value={confirm} onChange={e => setConfirm(e.target.value)} required className="w-full border rounded-lg px-4 py-2" />
          )}
          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
            {loading ? "Please wait..." : (isSignUp ? "Sign up" : "Sign in")}
          </button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400">or</span></div>
        </div>
        <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50">
          <svg className="w-5 h-5" viewBox="0 0 24 24">...</svg>
          Sign {isSignUp ? "up" : "in"} with Google
        </button>
        <p className="text-center text-xs text-gray-400 mt-6">
          {isSignUp ? "Already have an account? " : "New here? "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-indigo-600 hover:underline">
            {isSignUp ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}