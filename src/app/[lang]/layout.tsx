"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Menu from "@/components/Menu";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

interface LangLayoutProps {
  children: React.ReactNode;
  params: { lang: string };
}

export default function LangLayout({ children, params }: LangLayoutProps) {
  const pathname = usePathname();
  const isAuthPage =
    pathname?.includes("/login") || pathname?.includes("/sign-up");

  if (isAuthPage) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return (
    <AuthProvider>
      <div className="flex overflow-hidden" style={{ height: "calc(100vh / 0.8)" }}>
        {/* SIDEBAR */}
        <aside
          className="w-[14%] md:w-[8%] lg:w-[220px] xl:w-[240px] flex-shrink-0 flex flex-col"
          style={{ background: "#0f172a" }}
        >
          {/* Logo */}
          <Link
            href={`/${params.lang}/dashboard`}
            className="flex items-center justify-center lg:justify-start gap-3 px-5 py-[18px] flex-shrink-0 hover:bg-white/5 transition-colors"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="w-7 h-7 rounded-md bg-indigo-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs tracking-tight">
              NG
            </div>
            <span className="hidden lg:block font-bold text-white text-[15px] tracking-tight">
              NGO Platform
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-2 hide-scrollbar">
            <Menu lang={params.lang} />
          </div>

          {/* Footer */}
          <div
            className="hidden lg:block px-5 py-3 flex-shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-[10px] text-slate-600 text-center">© 2026 NGO-Platform</p>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
          {/* Top Navbar */}
          <header
            className="flex-shrink-0 z-10"
            style={{ background: "#0f172a", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Navbar />
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-slate-100">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
