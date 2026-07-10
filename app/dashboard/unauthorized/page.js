"use client";

import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden font-sans select-none">
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 w-120 h-120 bg-rose-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

      {/* Main card */}
      <div className="w-full max-w-md p-2 m-4 relative z-10 animate-in zoom-in-95 duration-500">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black/80 text-center">
          
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
            🛑
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white mb-3">
            Access Denied
          </h1>

          <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs mx-auto">
            You do not have permission to view this section of the Grand Stay management panel. If you believe this is an error, please contact your general manager.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center cursor-pointer"
            >
              Go to Dashboard
            </Link>
            
            <Link
              href="/login"
              className="w-full bg-slate-800 hover:bg-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center cursor-pointer"
            >
              Sign in with another account
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
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
      `}</style>
    </div>
  );
}
