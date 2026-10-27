/** Shared classes, copied from app/(app)/settings/agents/agents-ui.tsx in Ziki. */
export const surface = "rounded-[20px] border border-zk-border bg-zk-surface";

const focus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2";

export const linkClass = `font-semibold text-zk-accent hover:underline ${focus}`;

export const primaryBtn = `inline-flex min-h-11 items-center justify-center rounded-full bg-electric-blue-strong px-5 text-sm font-bold text-white shadow-[0_8px_20px_rgba(46,111,239,0.30)] transition hover:bg-[#2552af] ${focus} disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none`;

export const secondaryBtn = `inline-flex min-h-11 items-center justify-center rounded-full border border-zk-border bg-zk-surface px-5 text-sm font-bold text-zk-text transition hover:bg-zk-chip ${focus} disabled:cursor-not-allowed disabled:opacity-50`;

export const dangerBtn = `inline-flex min-h-11 items-center justify-center rounded-full border border-zk-bad-bd bg-zk-bad-soft px-5 text-sm font-bold text-zk-bad-fg transition hover:bg-zk-bad-bg ${focus} disabled:cursor-not-allowed disabled:opacity-50`;

export const inputClass =
  "w-full rounded-xl border border-zk-border bg-zk-surface px-3.5 py-2.5 text-sm text-zk-text shadow-none placeholder:text-zk-muted focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20";

/** Ziki's input look for selects that size to their content (no w-full). */
export const selectClass =
  "w-auto min-w-[8rem] rounded-xl border border-zk-border bg-zk-surface px-3.5 py-2.5 text-sm text-zk-text focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20";

export const chipClass = "inline-flex items-center rounded-full bg-zk-chip px-2.5 py-0.5 text-xs font-bold text-zk-text2";

export const sectionTitle = "text-sm font-bold uppercase tracking-[0.06em] text-zk-muted";

const AVATAR_COLORS = ["bg-electric-blue-strong", "bg-blue-slate", "bg-[#0F8A6A]", "bg-[#7C3AED]"];

export function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash + seed.charCodeAt(i) * (i + 1)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash] ?? AVATAR_COLORS[0];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
