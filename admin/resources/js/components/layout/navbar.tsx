import { Link, router, usePage } from "@inertiajs/react";
import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { SharedProps } from "@/types/auth";

function NavLink({
    href,
    active,
    children,
}: {
    href: string;
    active?: boolean;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
                "relative font-sans text-[10px] font-medium tracking-[0.18em] uppercase no-underline transition-colors duration-200",
                active ? "text-[#111]" : "text-[#888] hover:text-[#111]",
            )}
        >
            {children}
        </Link>
    );
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "AD";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Navbar({ className = "" }: { className?: string }) {
    const { auth } = usePage<SharedProps>().props;
    const admin = auth.admin;
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

    const url = usePage().url;
    const isActive = (path: string) =>
        url === path || url.startsWith(path + "?");

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(e.target as Node)
            ) {
                setProfileOpen(false);
            }
        }
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setProfileOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClickOutside);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const initials = admin ? getInitials(admin.name) : "AD";
    const displayName = admin?.name ?? "Admin";

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 bg-white border-b border-black/10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
                className,
            )}
        >
            <nav
                className="mx-auto max-w-7xl flex items-center justify-between h-[60px] px-4 lg:px-0"
                aria-label="Navigasi admin"
            >
                <ul className="hidden lg:flex items-center gap-8 list-none m-0 p-0">
                    <li>
                        <NavLink
                            href="/"
                            active={isActive("/") || url === "/dashboard"}
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            href="/products"
                            active={isActive("/products")}
                        >
                            Produk
                        </NavLink>
                    </li>
                </ul>

                <div className="flex items-center gap-5 justify-end ml-auto">
                    <div className="relative" ref={profileRef}>
                        <button
                            type="button"
                            onClick={() => setProfileOpen((v) => !v)}
                            aria-haspopup="menu"
                            aria-expanded={profileOpen}
                            aria-label="Menu profil"
                            className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-1 transition-colors duration-200 group"
                        >
                            <span
                                aria-hidden="true"
                                className="w-8 h-8 rounded-full bg-[#f5f5f5] border border-[#e6e6e6] flex items-center justify-center font-sans text-[11px] font-medium tracking-[0.08em] text-[#1a1a1a] shrink-0 select-none"
                            >
                                {initials}
                            </span>
                            <span className="hidden sm:flex flex-col items-start text-left">
                                <span className="font-sans text-[12px] font-medium leading-none text-[#1a1a1a] max-w-[140px] truncate">
                                    {displayName}
                                </span>
                                <span className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#888] leading-none mt-[3px]">
                                    Admin
                                </span>
                            </span>
                            <ChevronDown
                                size={14}
                                strokeWidth={1.5}
                                className={cn(
                                    "text-[#aaa] transition-transform duration-200 hidden sm:block",
                                    profileOpen && "rotate-180",
                                )}
                            />
                        </button>

                        {profileOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#e6e6e6] rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-1.5 z-50"
                            >
                                <div className="px-3 py-2 border-b border-[#f5f5f5] mb-1 sm:hidden">
                                    <p className="font-sans text-[12px] font-medium text-[#1a1a1a] truncate">
                                        {displayName}
                                    </p>
                                    <p className="font-sans text-[10px] uppercase tracking-[0.12em] text-[#aaa]">
                                        Admin
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => router.post("/logout")}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-sans text-[12px] text-[#666] hover:text-[#1a1a1a] hover:bg-[#f5f5f5] transition-colors duration-200 text-left"
                                >
                                    <LogOut
                                        size={14}
                                        strokeWidth={1.5}
                                        className="shrink-0"
                                    />
                                    Keluar
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        aria-label="Buka menu"
                        aria-expanded={mobileOpen}
                        className="lg:hidden flex flex-col gap-[5px] p-1 bg-transparent border-none cursor-pointer"
                        onClick={() => setMobileOpen((v) => !v)}
                    >
                        <span className="w-5 h-px bg-[#111] block" />
                        <span className="w-5 h-px bg-[#111] block" />
                        <span className="w-5 h-px bg-[#111] block" />
                    </button>
                </div>
            </nav>

            <nav
                className={cn(
                    "fixed inset-x-0 top-[60px] bottom-0 bg-white z-40 px-8 py-8 border-t border-black/5 flex-col overflow-y-auto lg:hidden",
                    mobileOpen ? "flex" : "hidden",
                )}
                aria-label="Menu mobile"
            >
                <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    aria-current={
                        isActive("/") || isActive("/dashboard")
                            ? "page"
                            : undefined
                    }
                    className={cn(
                        "font-sans text-[11px] font-medium tracking-[0.18em] uppercase no-underline py-4 border-b border-black/5 block transition-colors duration-200",
                        isActive("/") || isActive("/dashboard")
                            ? "text-[#111]"
                            : "text-[#888] hover:text-[#111]",
                    )}
                >
                    Dashboard
                </Link>
                <Link
                    href="/products"
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive("/products") ? "page" : undefined}
                    className={cn(
                        "font-sans text-[11px] font-medium tracking-[0.18em] uppercase no-underline py-4 border-b border-black/5 block transition-colors duration-200",
                        isActive("/products")
                            ? "text-[#111]"
                            : "text-[#888] hover:text-[#111]",
                    )}
                >
                    Produk
                </Link>
            </nav>
        </header>
    );
}
