
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";

import { NAV_LINKS } from "@/lib/constants";
import {
  supabase,
  isSupabaseConfigured,
} from "@/lib/supabaseClient";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const pathname = usePathname();

  /*
   * Scroll effect
   */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
    };

    onScroll();

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  /*
   * Supabase authentication
   */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      return;
    }

    /*
     * Create a local constant after the null check.
     *
     * This fixes:
     * "'supabase' is possibly 'null'"
     */
    const client = supabase;

    let mounted = true;

    /*
     * Get the currently logged-in user
     */
    const loadUser = async () => {
      const {
        data: { user },
      } = await client.auth.getUser();

      if (mounted) {
        setUser(user);
      }
    };

    loadUser();

    /*
     * Listen for authentication changes
     */
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
        }
      }
    );

    /*
     * Cleanup
     */
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Close mobile menu when changing pages
   */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /*
   * Logout
   */
  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setOpen(false);

    /*
     * Reload the page so the entire app
     * immediately reflects the logged-out state.
     */
    window.location.replace("/");
  };

  /*
   * Get user's display name
   */
  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Profile";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(35,38,31,0.06)]"
          : "bg-white/60 backdrop-blur-sm"
      }`}
    >
      <nav className="container-froska flex h-[72px] items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="font-display text-xl font-bold tracking-tight text-ink"
        >
          frsqo
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-green-700 ${
                pathname === link.href
                  ? "text-green-700"
                  : "text-ink/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-4 md:flex">

          {user ? (
            <>
              {/* Profile */}
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm font-medium text-ink/80 transition-colors hover:text-green-700"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-700">
                  <User size={16} />
                </span>

                <span className="max-w-[120px] truncate">
                  {userName}
                </span>
              </Link>

              {/* Logout */}
              <button
                type="button"
                onClick={logout}
                className="text-sm font-medium text-ink/60 transition-colors hover:text-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            /* Login */
            <Link
              href={`/login?next=${encodeURIComponent(
                pathname
              )}`}
              className="text-sm font-medium text-ink/80 transition-colors hover:text-green-700"
            >
              Login
            </Link>
          )}

          {/* Book */}
          <Link
            href="/book"
            className="btn-primary"
          >
            Book a Slot
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={
            open
              ? "Close menu"
              : "Open menu"
          }
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? (
            <X size={22} />
          ) : (
            <Menu size={22} />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-white px-6 pb-6 pt-2 md:hidden">

          <div className="flex flex-col gap-1">

            {/* Navigation links */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-green-50"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <>
                {/* Mobile profile */}
                <Link
                  href="/profile"
                  className="flex items-center gap-3 rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-green-50"
                >
                  <User size={18} />

                  <span>
                    {userName}
                  </span>
                </Link>

                {/* Mobile logout */}
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 text-left text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />

                  <span>
                    Logout
                  </span>
                </button>
              </>
            ) : (
              /* Mobile login */
              <Link
                href={`/login?next=${encodeURIComponent(
                  pathname
                )}`}
                className="rounded-lg px-2 py-3 text-base font-medium text-ink hover:bg-green-50"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile book button */}
          <Link
            href="/book"
            className="btn-primary mt-4 w-full"
          >
            Book a Slot
          </Link>
        </div>
      )}
    </header>
  );
}
