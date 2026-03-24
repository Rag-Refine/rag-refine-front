"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { UsageBar } from "@/app/components/ui/usage-bar";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type HeaderProps = {
  userName: string;
  userEmail: string;
  pagesUsed: number;
  pagesLimit: number;
};

export function Header({
  userName,
  userEmail,
  pagesUsed,
  pagesLimit,
}: HeaderProps) {
  const t = useTranslations("Dashboard");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="relative z-40 flex h-16 items-center gap-4 border-b border-white/5 bg-surface-lowest/60 px-4 backdrop-blur-xl lg:px-6">
      {/* Spacer for mobile hamburger */}
      <div className="w-8 lg:hidden" />

      {/* Usage bar - hidden on small screens */}
      <div className="hidden w-48 md:block">
        <UsageBar used={pagesUsed} limit={pagesLimit} />
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-md ml-10">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
        />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-xl border border-white/5 bg-surface-high py-2 pl-9 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/50 transition focus:border-primary/30 focus:outline-none focus:ring-1 focus:ring-primary/20"
        />
      </div>

      {/* Profile dropdown */}
      <div className="relative ml-auto" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-white/5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
            {initials}
          </div>
          <span className="hidden text-sm font-medium text-on-surface sm:inline">
            {userName}
          </span>
          <ChevronDown size={14} className="text-on-surface-variant" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/5 bg-surface-low shadow-xl">
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-sm font-medium text-on-surface">{userName}</p>
              <p className="text-xs text-on-surface-variant">{userEmail}</p>
            </div>
            <div className="p-1.5">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface">
                <UserIcon size={16} />
                {t("profile")}
              </button>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-error transition hover:bg-error/5"
              >
                <LogOut size={16} />
                {t("signOut")}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
