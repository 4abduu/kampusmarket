"use client";

import { ShieldCheck } from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm text-slate-500">
          {/* Left - Brand */}
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span>KampusMarket Admin Panel</span>
          </div>

          {/* Right - Copyright */}
          <span>&copy; 2024 KampusMarket</span>
        </div>
      </div>
    </footer>
  );
}
