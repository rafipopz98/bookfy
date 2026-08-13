"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { primaryNav, siteConfig } from "@/lib/config/site";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-accent/40 bg-paper">
      <Container className="flex h-18 items-center justify-between py-4">
        <Link
          href="/"
          className="font-display text-xl italic tracking-tight text-ink"
          onClick={() => setOpen(false)}
        >
          Bookfy
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm uppercase tracking-[0.08em] text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
          <Button href="/visualize" className="text-xs">
            Start Reading
          </Button>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-ink md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? `Close ${siteConfig.name} menu` : `Open ${siteConfig.name} menu`}
          onClick={() => setOpen((value) => !value)}
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" aria-hidden="true">
            {open ? (
              <path
                d="M1 1L21 15M21 1L1 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            ) : (
              <>
                <line x1="0" y1="1" x2="22" y2="1" stroke="currentColor" strokeWidth="1.5" />
                <line x1="0" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="1.5" />
              </>
            )}
          </svg>
        </button>
      </Container>

      {open && (
        <nav id="mobile-nav" className="border-t border-accent/40 bg-paper md:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-ink-soft transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Button href="/visualize" className="mt-2 w-full" onClick={() => setOpen(false)}>
              Start Reading
            </Button>
          </Container>
        </nav>
      )}
    </header>
  );
}
