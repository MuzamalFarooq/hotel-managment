"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username: username.trim(),
        password: password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("deactivated")) {
          setError("Your account has been deactivated. Please contact the administrator.");
        } else {
          setError("Invalid username or password.");
        }
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden font-sans select-none">
      {/* Background ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Main card */}
      <div className="w-full max-w-md p-2 m-4 relative z-10 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/80">
          
          {/* Logo / Header */}
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <span className="text-2xl font-black text-white">H</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
              Grand Stay
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">
              Staff Portal Login
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex gap-3 items-center animate-in fade-in duration-300">
              <span className="text-rose-400 text-xl font-bold">⚠️</span>
              <p className="text-xs text-rose-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-slate-100"
                required
                disabled={loading}
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                  disabled={loading}
                />
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    rememberMe
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-slate-800 bg-slate-950 group-hover:border-slate-700"
                  }`}
                >
                  {rememberMe && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-400 select-none group-hover:text-slate-300">
                  Remember Me
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes zoom-in-95 {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-in {
          animation-fill-mode: both;
        }
        .fade-in {
          animation-name: fade-in;
        }
        .zoom-in-95 {
          animation-name: zoom-in-95;
        }
        .duration-500 {
          animation-duration: 500ms;
        }
        .duration-300 {
          animation-duration: 300ms;
        }
      `}</style>
    </div>
  );
}
