import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/config/site";

export function Footer() {
  return (
    <footer className="border-t border-accent/40 bg-paper-warm">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-display text-lg italic text-ink">{siteConfig.name}</span>
          <p className="max-w-sm text-sm text-ink-soft">{siteConfig.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
          <Link href="/" className="hover:text-ink">
            Home
          </Link>
          <Link href="/visualize" className="hover:text-ink">
            Visualize
          </Link>
          <a
            href="mailto:hello@bookfy.com"
            className="hover:text-ink"
          >
            Contact
          </a>
        </nav>
      </Container>

      <Container className="border-t border-accent/40 py-6">
        <p className="text-xs text-ink-soft">
          © {new Date().getFullYear()} {siteConfig.name}. Built for readers, not replacing them.
        </p>
      </Container>
    </footer>
  );
}
