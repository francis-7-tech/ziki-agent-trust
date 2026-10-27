"use client";

import Link from "next/link";
import { useTrust } from "./trust-store";

export type View = "today" | "proposed";

/** Not part of Ziki: switches between the faithful reproduction and the proposed interaction. */
export function DemoBar({ view, basePath }: { view: View; basePath: string }) {
  const { reset } = useTrust();
  const tab = (id: View, label: string) => (
    <Link
      href={`${basePath}?view=${id}`}
      aria-current={view === id ? "page" : undefined}
      className={`min-h-[34px] rounded-full px-3.5 py-1.5 text-[13px] transition ${
        view === id ? "bg-white font-bold text-blue-slate shadow-sm" : "font-medium text-white/80 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-[20px] bg-blue-slate px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-white/80">
        <span className="font-bold text-white">HNG15 · human–agent interaction.</span> A reproduction of Ziki&apos;s agent settings, with one
        change.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Which version" className="inline-flex gap-1 rounded-full bg-white/10 p-1">
          {tab("today", "Ziki today")}
          {tab("proposed", "Proposed: agents ask")}
        </div>
        <Link href="/rationale" className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white underline-offset-2 hover:underline">
          Why
        </Link>
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-white/80 hover:text-white"
          title="Undo every decision made in this demo"
        >
          Reset demo
        </button>
      </div>
    </div>
  );
}
