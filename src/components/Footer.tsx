import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-cream">
      <div className="container-froska flex flex-col gap-10 py-14 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <span className="font-display text-xl font-bold tracking-tight text-ink">frsqo</span>
          <p className="mt-3 text-sm text-ink-soft text-ink/60">Make space for better living.</p>
        </div>

        <div className="flex flex-wrap gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/40">
              Site
            </span>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-ink/70 hover:text-green-700">
                {link.label}
              </Link>
            ))}
            <Link href="/book" className="text-sm text-ink/70 hover:text-green-700">
              Book a Slot
            </Link>
            <Link href="/login" className="text-sm text-ink/70 hover:text-green-700">
              Login
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/40">
              Follow
            </span>
            <a
              href="https://www.instagram.com/wefrsqo"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-ink/70 hover:text-green-700"
            >
              <Instagram size={16} /> Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/wefrsqo/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-ink/70 hover:text-green-700"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-froska flex flex-col items-start justify-between gap-2 py-6 text-xs text-ink/40 md:flex-row md:items-center">
          <span>© 2026 frsqo. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
