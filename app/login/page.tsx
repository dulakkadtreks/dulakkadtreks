"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 relative overflow-hidden">
      {/* generated image background */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity" style={{ backgroundImage: "url('/images/bg2.png')" }}></div>
      {/* background blobs matching admin panel */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle,#16a34a,transparent 70%)" }} />
        <div className="absolute top-1/2 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#0891b2,transparent 70%)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <span className="flex items-center gap-2 text-xs text-white/40 mb-1">
            <span className="w-2 h-2 rounded-full shadow-[0_0_6px_2px_currentColor] bg-green-400 text-green-400" />
            Secure Area
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 text-center">Admin Login</h1>
        <p className="text-sm text-center text-white/50 mb-8">Sign in to manage treks</p>
        
        {error && <p className="text-red-400 text-sm mb-4 text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">{error}</p>}
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#16a34a,#0891b2)" }}
          >
            {loading ? "Logging in..." : "Login to Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}