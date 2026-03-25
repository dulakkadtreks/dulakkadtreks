"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "/admin";
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") login();
  };

  const input =
    "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400 transition text-sm";

  return (
    <div className="min-h-screen bg-[#080c10] text-white flex items-center justify-center px-4">

      {/* ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle,#16a34a,transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[380px] h-[380px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle,#0891b2,transparent 70%)" }} />
      </div>

      <div className="w-full max-w-sm">

        {/* logo / brand */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏔️</span>
          <h1 className="text-2xl font-black mt-2">
            Dullakad&nbsp;
            <span className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#4ade80,#22d3ee)" }}>
              Treks
            </span>
          </h1>
          <p className="text-white/35 text-sm mt-1">Admin access only</p>
        </div>

        {/* card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-7 shadow-2xl">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <span>🔐</span> Sign In
          </h2>

          <div className="space-y-3">
            <input
              className={input}
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={onKey}
              autoComplete="email"
            />

            <div className="relative">
              <input
                className={input}
                type={show ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onKey}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 hover:text-white/70 transition"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            onClick={login}
            disabled={loading}
            className="mt-5 w-full py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:brightness-110 active:scale-95 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#16a34a,#0891b2)" }}
          >
            {loading ? "Signing in…" : "Login →"}
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          © {new Date().getFullYear()} Dullakad Treks
        </p>
      </div>
    </div>
  );
}