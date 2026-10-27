"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { OWNER } from "@/lib/data";
import { initials } from "@/lib/ui";
import { useTrust } from "./trust-store";
import { ZikiMark } from "./ziki-mark";

const focus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2";

function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0">
      {children}
    </svg>
  );
}

function TopNavLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`relative inline-flex shrink-0 items-center whitespace-nowrap font-medium text-zk-text2 hover:text-zk-text ${focus} max-lg:min-w-16 max-lg:flex-1 max-lg:flex-col max-lg:gap-0.5 max-lg:rounded-xl max-lg:py-1.5 max-lg:text-[11px] lg:h-9 lg:gap-2 lg:rounded-full lg:px-2.5 lg:text-[13px] lg:hover:bg-zk-chip`}
    >
      <span className="relative flex items-center justify-center max-lg:h-7 max-lg:w-12">{children}</span>
      {label}
    </Link>
  );
}

/** Ziki's top bar, reproduced from components/app-header.tsx (workspace areas, agents menu, account, points). */
export function ZikiHeader() {
  const pathname = usePathname();
  const { openAsks, ready } = useTrust();
  const today = useSearchParams()?.get("view") === "today";
  const onAgents = pathname?.startsWith("/settings/agents");
  // Today's Ziki has no "agents waiting on you" count; only the proposed version shows it.
  const count = ready && !today ? openAsks.length : 0;

  return (
    <header className="relative z-40 border-b border-zk-border bg-zk-surface shadow-[0_1px_3px_rgba(0,0,0,0.04)] lg:sticky lg:top-0">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-3 py-3 max-sm:py-2 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/settings/agents" aria-label="Ziki" className={`flex shrink-0 items-center gap-2 rounded-full ${focus}`}>
            <ZikiMark className="h-7 w-auto text-electric-blue-strong max-sm:h-6" />
            <span aria-hidden className="pr-1 text-[15px] font-semibold tracking-[-0.02em] text-zk-text max-sm:hidden">
              ziki
            </span>
          </Link>
          <span aria-hidden className="h-[18px] w-px shrink-0 bg-zk-border max-sm:hidden" />
          <span className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-zk-text">
            {OWNER.workspace}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="text-zk-muted">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>

        <nav
          aria-label="Workspace"
          className="flex items-center max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:justify-around max-lg:border-t max-lg:border-zk-border max-lg:bg-zk-surface max-lg:px-2 max-lg:pt-1.5 max-lg:pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:gap-1"
        >
          <TopNavLink href="/not-reproduced?area=Product" label="Product">
            <NavIcon>
              <circle cx="12" cy="12" r="9" />
              <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
            </NavIcon>
          </TopNavLink>
          <TopNavLink href="/not-reproduced?area=Marketing" label="Marketing">
            <NavIcon>
              <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
            </NavIcon>
          </TopNavLink>
          <TopNavLink href="/not-reproduced?area=Security" label="Security">
            <NavIcon>
              <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </NavIcon>
          </TopNavLink>
        </nav>

        <div className="ml-auto flex min-w-0 flex-wrap items-center justify-end gap-2 max-sm:gap-1 lg:shrink-0">
          <Link
            href="/settings/agents"
            aria-current={onAgents ? "page" : undefined}
            className={`relative inline-flex h-11 items-center gap-2 rounded-full border border-zk-border px-3.5 text-[13px] font-semibold ${
              onAgents ? "bg-zk-tint text-zk-accent" : "bg-zk-surface text-zk-text hover:bg-zk-chip"
            } ${focus}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
              <rect x="4" y="7" width="16" height="12" rx="3" />
              <path d="M12 3v4M9 12h.01M15 12h.01" />
            </svg>
            Agents
            {count > 0 ? (
              <span className="rounded-full bg-zk-bad-soft px-2 py-0.5 text-xs font-bold tabular-nums text-zk-bad-fg" aria-label={`${count} agents waiting for you`}>
                {count}
              </span>
            ) : null}
          </Link>
          <span className="inline-flex h-11 items-center gap-2 rounded-full border border-zk-border bg-zk-surface py-[5px] pl-[5px] pr-3 text-zk-text">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-slate text-xs font-bold text-white">{initials(OWNER.name)}</span>
            <span className="max-w-40 truncate text-[13px] font-medium max-sm:sr-only">{OWNER.name}</span>
          </span>
          <span className="inline-flex h-11 items-center rounded-full bg-zk-tint px-3.5 text-[13px] font-bold tabular-nums text-zk-accent max-sm:hidden">
            4,104 pts
          </span>
        </div>
      </div>
    </header>
  );
}
