"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AGENTS } from "@/lib/data";
import { AGENT_LEVELS, AGENT_LEVEL_DESCRIPTIONS, AGENT_LEVEL_LABELS, OWNER_LEVELS, levelBadgeClass, type AgentLevel } from "@/lib/levels";
import { avatarColor, initials, linkClass, sectionTitle, selectClass, surface } from "@/lib/ui";

type Filter = "all" | AgentLevel;

/** A faithful copy of Ziki's Settings → Agents list: a level dropdown on every agent, no conversation. */
export function TodayAgents() {
  const [levels, setLevels] = useState<Record<string, AgentLevel>>(() => Object.fromEntries(AGENTS.map((a) => [a.id, a.level])));
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const covered = useMemo(() => {
    const set = new Set(Object.values(levels));
    return AGENT_LEVELS.map((level) => ({ level, on: set.has(level) }));
  }, [levels]);

  const visible = AGENTS.filter((a) => {
    if (filter !== "all" && levels[a.id] !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || a.name.toLowerCase().includes(q) || a.model.toLowerCase().includes(q);
  });

  function change(id: string, name: string, next: AgentLevel) {
    setLevels((l) => ({ ...l, [id]: next }));
    setToast(`${name} is now ${AGENT_LEVEL_LABELS[next].toLowerCase()}.`);
    window.setTimeout(() => setToast(null), 2600);
  }

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "contributor", label: "Contributor" },
    { id: "triager", label: "Triager" },
    { id: "reviewer", label: "Reviewer" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zk-text">Your agents</h1>
        <p className="mt-1 text-sm text-zk-muted">Add agents, set their level, and manage their keys.</p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className={`${surface} p-4`}>
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Active agents</p>
            <p className="mt-1 text-2xl font-extrabold text-zk-text">
              4 <span className="text-base font-semibold text-zk-muted">/ 5</span>
            </p>
            <p className="mt-0.5 text-xs text-zk-muted">limit 5</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-zk-seg">
              <div className="h-full w-4/5 rounded-full bg-electric-blue-strong" />
            </div>
          </div>
          <div className={`${surface} p-4`}>
            <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Roles covered</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {covered.map(({ level, on }) => (
                <span
                  key={level}
                  className={on ? levelBadgeClass(level) : "inline-flex items-center rounded-full border border-dashed border-zk-border px-2.5 py-0.5 text-xs font-bold text-zk-muted"}
                >
                  {AGENT_LEVEL_LABELS[level]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search agents</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents"
              className="h-11 w-full rounded-full border border-zk-border bg-zk-surface px-4 text-sm text-zk-text placeholder:text-zk-muted focus:border-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue/20"
            />
          </label>
          <div role="tablist" aria-label="Filter by role" className="inline-flex flex-wrap gap-1 rounded-full bg-zk-seg p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className={`min-h-[34px] rounded-full px-3.5 text-[13px] transition ${
                  filter === t.id ? "bg-zk-surface font-bold text-zk-text shadow-sm" : "font-medium text-zk-text2 hover:text-zk-text"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <ul className="space-y-3">
          {visible.map((agent) => (
            <li key={agent.id} className={`${surface} p-4 sm:p-5`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="relative h-11 w-11 shrink-0 self-start">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white ${avatarColor(agent.id)}`}>
                      {initials(agent.name)}
                    </span>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zk-surface ${agent.recent ? "bg-emerald-500" : "bg-slate-400"}`}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-extrabold text-zk-text">{agent.name}</p>
                      <span className={levelBadgeClass(levels[agent.id])}>{AGENT_LEVEL_LABELS[levels[agent.id]]}</span>
                    </div>
                    <p className="text-sm text-zk-muted">{agent.model}</p>
                    <p className="text-xs text-zk-muted">
                      Last used {agent.lastUsed} · Added {agent.createdAt}
                    </p>
                    <Link href={`/settings/agents/${agent.id}?view=today`} className={`text-xs ${linkClass}`}>
                      Messages and instructions
                    </Link>
                    <p className="pt-1 font-mono text-xs text-zk-muted">zk_live_{agent.id.slice(0, 3)}••••••••  · Zedu</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end lg:max-w-md">
                  <label htmlFor={`level-${agent.id}`} className="sr-only">
                    Level for {agent.name}
                  </label>
                  <select
                    id={`level-${agent.id}`}
                    value={levels[agent.id]}
                    onChange={(e) => change(agent.id, agent.name, e.target.value as AgentLevel)}
                    className={selectClass}
                  >
                    {[...new Set([levels[agent.id], ...AGENT_LEVELS])].map((option) => (
                      <option key={option} value={option} disabled={!OWNER_LEVELS.includes(option)}>
                        {AGENT_LEVEL_LABELS[option]}
                      </option>
                    ))}
                  </select>
                  <select aria-label="Project for the new key" className={selectClass} defaultValue="zedu">
                    <option value="zedu">Zedu</option>
                  </select>
                  <button type="button" className="inline-flex min-h-11 items-center rounded-full border border-zk-border bg-zk-surface px-5 text-sm font-bold text-zk-text hover:bg-zk-chip">
                    Regenerate key
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <section className={`${surface} p-4 sm:p-6`} aria-labelledby="levels-heading">
        <h2 id="levels-heading" className={sectionTitle}>
          Levels
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          {AGENT_LEVELS.map((level) => (
            <div key={level} className="sm:flex sm:gap-3">
              <dt className="font-semibold text-zk-text sm:w-28">{AGENT_LEVEL_LABELS[level]}</dt>
              <dd className="text-zk-text2">{AGENT_LEVEL_DESCRIPTIONS[level]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-zk-muted">
          New agents start as observers. You can raise your own agents up to reviewer; only a team admin can make one a merger. Give each
          level its own agent. Each agent may make 30 writes an hour, including reviews.
        </p>
      </section>

      {toast ? (
        <div role="status" className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zk-ok-bg px-4 py-2 text-sm font-semibold text-zk-ok-fg shadow-lg lg:bottom-6">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
