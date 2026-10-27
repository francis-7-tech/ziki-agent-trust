"use client";

import Link from "next/link";
import { useState } from "react";
import { AGENTS, type Agent } from "@/lib/data";
import {
  AGENT_LEVELS,
  AGENT_LEVEL_DESCRIPTIONS,
  AGENT_LEVEL_LABELS,
  LEVEL_IN_PLAIN_WORDS,
  OWNER_LEVELS,
  levelBadgeClass,
  type AgentLevel,
} from "@/lib/levels";
import { chipClass, linkClass, sectionTitle, selectClass, surface } from "@/lib/ui";
import { AskCard, Avatar } from "./ask-card";
import { useTrust } from "./trust-store";

export function ProposedAgents() {
  const { asks, askState, openAsks, ready } = useTrust();
  const answered = asks.filter((a) => askState[a.id]?.status === "answered").reverse();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zk-text">Your agents</h1>
        <p className="mt-1 max-w-2xl text-sm text-zk-muted">
          Your agents don&apos;t get more power on a timer. When one is ready for more, it asks you, shows its work, and you decide.
        </p>
      </div>

      <section aria-labelledby="waiting-heading" className="space-y-3">
        <h2 id="waiting-heading" className={sectionTitle}>
          Waiting on you{ready && openAsks.length ? ` · ${openAsks.length}` : ""}
        </h2>
        {!ready ? null : openAsks.length === 0 ? (
          <p className={`${surface} p-5 text-sm text-zk-muted`}>Nothing is waiting on you. Your agents will ask when they&apos;re ready for more.</p>
        ) : (
          <div className="space-y-3">
            {openAsks.map((ask) => (
              <AskCard key={ask.id} ask={ask} />
            ))}
          </div>
        )}
        {ready && answered.length > 0 ? (
          <div className="space-y-3 pt-2" aria-live="polite">
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">Your answers and their replies</h3>
            {answered.map((ask) => (
              <AskCard key={ask.id} ask={ask} />
            ))}
          </div>
        ) : null}
      </section>

      <section aria-labelledby="agents-heading" className="space-y-3">
        <h2 id="agents-heading" className={sectionTitle}>
          Your agents
        </h2>
        <ul className="space-y-3">
          {AGENTS.map((agent) => (
            <AgentRow key={agent.id} agent={agent} />
          ))}
        </ul>
      </section>

      <HowItWorks />
    </div>
  );
}

function AgentRow({ agent }: { agent: Agent }) {
  const { levels, areas, rules, revealTrialResult, setLevelDirectly, openAsks } = useTrust();
  const level = levels[agent.id];
  const scope = areas[agent.id];
  const agentRules = rules[agent.id] ?? [];
  const onTrial = agentRules.some((r) => r.startsWith("Trial"));
  const asking = openAsks.find((a) => a.agentId === agent.id);
  const [override, setOverride] = useState(false);

  return (
    <li className={`${surface} p-4 sm:p-5`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="relative h-11 w-11 shrink-0 self-start">
            <Avatar id={agent.id} name={agent.name} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-zk-surface ${agent.recent ? "bg-emerald-500" : "bg-slate-400"}`}
              aria-hidden
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-extrabold text-zk-text">{agent.name}</p>
              <span className={levelBadgeClass(level)}>{AGENT_LEVEL_LABELS[level]}</span>
              {asking ? <span className={`${chipClass} bg-zk-bad-soft text-zk-bad-fg`}>Asking you</span> : null}
            </div>
            <p className="text-sm text-zk-text2">
              {LEVEL_IN_PLAIN_WORDS[level]} {scope === "all" ? "Whole project." : `Only ${scope.join(" and ")}.`}
            </p>
            <p className="text-xs text-zk-muted">
              {agent.model} · Now: {agent.now}
            </p>
            {agentRules.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {agentRules.map((r) => (
                  <span key={r} className={`${chipClass} bg-zk-info-bg text-zk-info-fg`}>
                    Your rule · {r}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
              <Link href={`/settings/agents/${agent.id}?view=proposed`} className={`text-xs ${linkClass}`}>
                Trust history
              </Link>
              {onTrial ? (
                <button type="button" onClick={() => revealTrialResult(agent.id)} className={`text-xs ${linkClass}`}>
                  Skip ahead 24 hours (demo): see {agent.name}&apos;s report
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="shrink-0 lg:max-w-xs lg:text-right">
          {override ? (
            <div className="space-y-2">
              <label htmlFor={`override-${agent.id}`} className="block text-xs font-semibold text-zk-text2">
                Change {agent.name}&apos;s level without asking it
              </label>
              <select
                id={`override-${agent.id}`}
                value={level}
                onChange={(e) => {
                  setLevelDirectly(agent.id, e.target.value as AgentLevel);
                  setOverride(false);
                }}
                className={selectClass}
              >
                {AGENT_LEVELS.map((l) => (
                  <option key={l} value={l} disabled={!OWNER_LEVELS.includes(l)}>
                    {AGENT_LEVEL_LABELS[l]}
                  </option>
                ))}
              </select>
              <p className="text-xs text-zk-muted">For emergencies. It&apos;s recorded in the trust history without a reason from the agent.</p>
            </div>
          ) : (
            <button type="button" onClick={() => setOverride(true)} className="text-xs font-semibold text-zk-muted underline-offset-2 hover:text-zk-text hover:underline">
              Change level directly
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

function HowItWorks() {
  return (
    <section className={`${surface} p-4 sm:p-6`} aria-labelledby="how-heading">
      <h2 id="how-heading" className={sectionTitle}>
        How agents grow here
      </h2>
      <ol className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <li className="rounded-2xl bg-zk-chip/60 p-3.5">
          <p className="font-bold text-zk-text">1. The agent earns a reason</p>
          <p className="mt-1 text-zk-text2">It works at its level. Ziki counts the calls other people later confirm or overturn.</p>
        </li>
        <li className="rounded-2xl bg-zk-chip/60 p-3.5">
          <p className="font-bold text-zk-text">2. It asks you, with its work</p>
          <p className="mt-1 text-zk-text2">In its own words, with its record, what changes, and any trade-off you should know about.</p>
        </li>
        <li className="rounded-2xl bg-zk-chip/60 p-3.5">
          <p className="font-bold text-zk-text">3. You decide, and it hears why</p>
          <p className="mt-1 text-zk-text2">Yes, only for some areas, a 24-hour trial, or not yet with a reason it can act on.</p>
        </li>
      </ol>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Who decides what</caption>
          <thead>
            <tr className="text-xs uppercase tracking-[0.06em] text-zk-muted">
              <th className="py-2 pr-3 font-bold">The agent decides alone</th>
              <th className="py-2 pr-3 font-bold">It asks you</th>
              <th className="py-2 font-bold">It asks a team admin (through you)</th>
            </tr>
          </thead>
          <tbody className="align-top text-zk-text2">
            <tr>
              <td className="py-2 pr-3">Any work inside its current level and areas</td>
              <td className="py-2 pr-3">Every move up, from Observer to Reviewer</td>
              <td className="py-2">Merger, Dispatcher, Admin Merger</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">When to ask, and what evidence to show</td>
              <td className="py-2 pr-3">Any move down, a pause, or a limit on its work</td>
              <td className="py-2">Anything that merges code or pays points</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Suggesting another agent for work it gives up</td>
              <td className="py-2 pr-3">Handing its work to another of your agents</td>
              <td className="py-2" />
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-zk-muted">
        Ziki can still revoke a key on its own for safety (a leaked key, abuse). That isn&apos;t a level change and it is never silent.
      </p>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm font-semibold text-zk-accent hover:underline">What each level allows (reference)</summary>
        <dl className="mt-3 space-y-2 text-sm">
          {AGENT_LEVELS.map((level) => (
            <div key={level} className="sm:flex sm:gap-3">
              <dt className="font-semibold text-zk-text sm:w-28">{AGENT_LEVEL_LABELS[level]}</dt>
              <dd className="text-zk-text2">{AGENT_LEVEL_DESCRIPTIONS[level]}</dd>
            </div>
          ))}
        </dl>
      </details>
    </section>
  );
}
