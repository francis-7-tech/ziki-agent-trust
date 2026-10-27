"use client";

import Link from "next/link";
import { AGENTS, OWNER, TEAM_ADMIN, TODAY_HISTORY, type TimelineEvent } from "@/lib/data";
import { AGENT_LEVEL_DESCRIPTIONS, AGENT_LEVEL_LABELS, LEVEL_IN_PLAIN_WORDS, levelBadgeClass } from "@/lib/levels";
import { chipClass, inputClass, linkClass, primaryBtn, sectionTitle, surface } from "@/lib/ui";
import { AskCard, Avatar } from "./ask-card";
import type { View } from "./demo-bar";
import { useTrust } from "./trust-store";

function who(e: TimelineEvent, agentName: string) {
  if (e.who === "you") return OWNER.name.split(" ")[0] + " (you)";
  if (e.who === "agent") return agentName;
  if (e.who === "admin") return TEAM_ADMIN;
  return "Ziki (automatic)";
}

export function AgentDetail({ id, view }: { id: string; view: View }) {
  const agent = AGENTS.find((a) => a.id === id)!;
  const { levels, areas, rules, history, openAsks, ready } = useTrust();

  if (view === "today") {
    const events = TODAY_HISTORY.filter((e) => e.agentId === id);
    return (
      <div className="space-y-6">
        <Link href="/settings/agents?view=today" className={`text-sm ${linkClass}`}>
          ← Your agents
        </Link>
        <div className="flex items-center gap-3">
          <Avatar id={agent.id} name={agent.name} />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-zk-text">{agent.name}</h1>
            <span className={levelBadgeClass(agent.level)}>{AGENT_LEVEL_LABELS[agent.level]}</span>
          </div>
        </div>
        <section className={`${surface} p-4 sm:p-6`}>
          <h2 className={sectionTitle}>Messages and instructions</h2>
          <label htmlFor="instr" className="mt-3 block text-sm font-semibold text-zk-text">
            Standing instructions
          </label>
          <textarea id="instr" rows={4} className={`${inputClass} mt-1`} placeholder={`Tell ${agent.name} how to work.`} />
          <button type="button" className={`${primaryBtn} mt-3`}>
            Save instructions
          </button>
        </section>
        <section className={`${surface} p-4 sm:p-6`}>
          <h2 className={sectionTitle}>Level changes</h2>
          <ul className="mt-3 divide-y divide-zk-divider text-sm">
            {events.map((e, i) => (
              <li key={i} className="flex justify-between gap-3 py-2.5 text-zk-text2">
                <span>{e.text}</span>
                <span className="shrink-0 text-xs text-zk-muted">{e.at}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zk-muted">
            Ziki records who changed the level, but not why, and the agent is never part of the decision.
          </p>
        </section>
      </div>
    );
  }

  const level = levels[id];
  const scope = areas[id];
  const events = history.filter((e) => e.agentId === id);
  const ask = openAsks.find((a) => a.agentId === id);

  return (
    <div className="space-y-6">
      <Link href="/settings/agents?view=proposed" className={`text-sm ${linkClass}`}>
        ← Your agents
      </Link>
      <div className="flex items-center gap-3">
        <Avatar id={agent.id} name={agent.name} />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zk-text">{agent.name}</h1>
          <p className="text-sm text-zk-muted">{agent.model}</p>
        </div>
      </div>

      <section className={`${surface} p-4 sm:p-6`} aria-labelledby="trust-now">
        <h2 id="trust-now" className={sectionTitle}>
          What you trust {agent.name} with
        </h2>
        <p className="mt-3 text-lg font-semibold text-zk-text">
          {LEVEL_IN_PLAIN_WORDS[level]} {scope === "all" ? "Across the whole project." : `Only ${scope.join(" and ")}.`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className={levelBadgeClass(level)}>{AGENT_LEVEL_LABELS[level]}</span>
          {(rules[id] ?? []).map((r) => (
            <span key={r} className={`${chipClass} bg-zk-info-bg text-zk-info-fg`}>
              Your rule · {r}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-zk-muted">{AGENT_LEVEL_DESCRIPTIONS[level]}</p>
      </section>

      {ready && ask ? (
        <section aria-labelledby="asking-now" className="space-y-3">
          <h2 id="asking-now" className={sectionTitle}>
            {agent.name} is asking
          </h2>
          <AskCard ask={ask} />
        </section>
      ) : null}

      <section className={`${surface} p-4 sm:p-6`} aria-labelledby="history">
        <h2 id="history" className={sectionTitle}>
          Trust history
        </h2>
        <p className="mt-1 text-sm text-zk-muted">Every change, who started it, and why.</p>
        <ol className="mt-4 space-y-4 border-l-2 border-zk-border pl-5">
          {events.map((e, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-zk-surface ${
                  e.who === "agent" ? "bg-electric-blue-strong" : e.who === "you" ? "bg-blue-slate" : "bg-zk-muted"
                }`}
                aria-hidden
              />
              <p className="text-sm text-zk-text2">
                <span className="font-bold text-zk-text">{who(e, agent.name)}</span> · <span className="text-xs text-zk-muted">{e.at}</span>
              </p>
              <p className="text-sm text-zk-text">{e.text}</p>
              {e.quote ? <p className="mt-1 rounded-xl bg-zk-tint px-3 py-2 text-sm italic text-zk-text2">&ldquo;{e.quote}&rdquo;</p> : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
