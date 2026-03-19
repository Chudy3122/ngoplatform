"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import GuideButton from "./GuideButton";
import { useUser } from "@/context/AuthContext";

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  MANAGER: "Manager",
  USER: "Użytkownik",
};

const roleBadgeColors: Record<string, string> = {
  ADMIN: "bg-violet-500/25 text-violet-300",
  MANAGER: "bg-indigo-500/25 text-indigo-300",
  USER: "bg-white/10 text-slate-300",
};

const Navbar = () => {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as string) || "pl";

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(`/${lang}/login`);
    router.refresh();
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex items-center justify-between px-6 py-3">
      {/* Left */}
      <div />

      {/* Right */}
      <div className="flex items-center gap-3 ml-auto">
        <GuideButton />
        <LanguageSwitcher />

        <div className="w-px h-6 bg-white/20" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[13px] font-semibold text-white leading-tight">{user?.name}</span>
            {user?.role && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5 ${roleBadgeColors[user.role] ?? "bg-slate-100 text-slate-600"}`}>
                {roleLabels[user.role] ?? user.role}
              </span>
            )}
          </div>

          {/* Avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((v) => !v)}
              style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity ring-2 ring-white/20"
            >
              {initial}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">@{user?.username}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setOpen(false); router.push(`/${lang}/profile`); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    Profil
                  </button>
                  <button
                    onClick={() => { setOpen(false); router.push(`/${lang}/settings`); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Ustawienia
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Wyloguj się
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
