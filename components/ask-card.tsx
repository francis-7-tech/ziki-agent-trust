"use client";

import Link from "next/link";
import { useState } from "react";
import { AGENTS, AREAS, type Area, type Ask, type Evidence } from "@/lib/data";
import { AGENT_LEVEL_LABELS } from "@/lib/levels";
import { avatarColor, chipClass, initials, inputClass, linkClass, primaryBtn, secondaryBtn, surface } from "@/lib/ui";
import { useTrust } from "./trust-store";

const OUTCOME: Record<Evidence["outcome"], { label: string; cls: string }> = {
  held: { label: "Held up", cls: "bg-zk-ok-bg text-zk-ok-fg" },
  merged: { label: "Merged", cls: "bg-zk-ok-bg text-zk-ok-fg" },
  overturned: { label: "Overturned", cls: "bg-zk-bad-bg text-zk-bad-fg" },
  lapsed: { label: "Went quiet", cls: "bg-zk-warn-bg text-zk-warn-fg" },
};

const NOT_YET_REASONS = ["Too many calls overturned", "I need you where you are this week", "Wait until the current sprint ends"];

function headline(ask: Ask): string {
  if (ask.kind === "checkin") return "is checking in about how it works";
  if (ask.kind === "escalate") return `asks to become ${AGENT_LEVEL_LABELS[ask.to]}`;
  if (ask.id.startsWith("trial-")) return `finished its trial as ${AGENT_LEVEL_LABELS[ask.to]}`;
  return `asks to become ${AGENT_LEVEL_LABELS[ask.to]}`;
}

export function AskCard({ ask }: { ask: Ask }) {
  const { askState, answer, handOff, setHandOff } = useTrust();
  const agent = AGENTS.find((a) => a.id === ask.agentId)!;
  const state = askState[ask.id];
  const [showEvidence, setShowEvidence] = useState(false);
  const [mode, setMode] = useState<null | "areas" | "not-yet">(null);
  const [areas, setAreas] = useState<Area[]>(["Mobile"]);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const isTrial = ask.id.startsWith("trial-");
  const helper = ask.kind === "promote" && ask.tradeOff ? AGENTS.find((a) => a.id === ask.tradeOff!.handOffTo) : null;

  if (state?.status === "answered") {
    return (
      <article className={`${surface} zk-rise p-4 sm:p-5`} aria-label={`${agent.name}: answered`}>
        <div className="flex items-start gap-3">
          <Avatar id={agent.id} name={agent.name} />
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-sm text-zk-text2">
              <span className="font-bold text-zk-text">You</span> answered {agent.name}: <span className="font-semibold text-zk-text">{state.answer}</span>
            </p>
            {state.reply ? (
              <p className="rounded-2xl rounded-tl-sm bg-zk-tint px-3.5 py-2.5 text-sm text-zk-text">
                <span className="font-bold">{agent.name}:</span> {state.reply}
              </p>
            ) : null}
            {state.waitingOn ? (
              <p className={`${chipClass} bg-zk-warn-bg text-zk-warn-fg`}>Waiting for {state.waitingOn}</p>
            ) : null}
            <Link href={`/settings/agents/${agent.id}?view=proposed`} className={`text-xs ${linkClass}`}>
              See {agent.name}&apos;s trust history
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`${surface} zk-rise overflow-hidden`} aria-labelledby={`${ask.id}-title`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Avatar id={agent.id} name={agent.name} />
          <div className="min-w-0 flex-1">
            <p id={`${ask.id}-title`} className="text-[15px] text-zk-text2">
              <span className="font-extrabold text-zk-text">{agent.name}</span> {headline(ask)}
            </p>
            <p className="text-xs text-zk-muted">
              {agent.model} · {ask.askedAt}
            </p>
          </div>
        </div>

        <blockquote className="mt-3 rounded-2xl rounded-tl-sm bg-zk-tint px-4 py-3 text-[15px] leading-relaxed text-zk-text">
          &ldquo;{ask.message}&rdquo;
        </blockquote>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={chipClass}>{ask.record}</span>
          {ask.evidence.length > 0 ? (
            <button
              type="button"
              aria-expanded={showEvidence}
              onClick={() => setShowEvidence((v) => !v)}
              className={`text-xs ${linkClass}`}
            >
              {showEvidence ? "Hide" : "See"} the work behind this
            </button>
          ) : null}
        </div>

        {showEvidence ? (
          <ul className="mt-3 divide-y divide-zk-divider rounded-2xl border border-zk-border">
            {ask.evidence.map((e) => (
              <li key={e.ref} className="flex flex-col gap-1 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="min-w-0 text-sm text-zk-text2">
                  <span className="font-bold text-zk-text">{e.ref}</span> {e.title}
                  <span className="block text-xs text-zk-muted">{e.call}</span>
                </span>
                <span className={`inline-flex shrink-0 self-start rounded-full px-2.5 py-0.5 text-xs font-bold sm:self-auto ${OUTCOME[e.outcome].cls}`}>
                  {OUTCOME[e.outcome].label}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {(ask.kind === "promote" || ask.kind === "escalate") && !isTrial ? <WhatChanges ask={ask} /> : null}

        {ask.kind === "promote" && ask.tradeOff && helper ? (
          <div className="mt-3 rounded-2xl border border-zk-warn-bd bg-zk-warn-bg/60 px-4 py-3 text-sm text-zk-warn-fg">
            <p className="font-bold">Before you say yes</p>
            <p className="mt-0.5">{ask.tradeOff.text}</p>
            <label className="mt-2 flex items-start gap-2 font-semibold">
              <input type="checkbox" className="mt-1" checked={Boolean(handOff[ask.id])} onChange={(e) => setHandOff(ask.id, e.target.checked)} />
              <span>
                Ask {helper.name} ({helper.model}, currently {AGENT_LEVEL_LABELS[helper.level]}) to take over duplicate checks
              </span>
            </label>
          </div>
        ) : null}

        {ask.kind === "checkin" ? (
          <p className="mt-3 text-xs text-zk-muted">
            <span className="font-bold text-zk-text2">Without this question:</span> {ask.oldBehaviour}
          </p>
        ) : null}

        {ask.kind === "escalate" ? (
          <p className="mt-3 text-xs text-zk-muted">
            <span className="font-bold text-zk-text2">Only a team admin can grant {AGENT_LEVEL_LABELS[ask.to]}.</span> {agent.name} asks you first,
            because you&apos;re the one who answers for it. If you agree, your note goes to {ask.admin} with its record attached.
          </p>
        ) : null}
      </div>

      <div className="border-t border-zk-divider bg-zk-bg/60 p-4 sm:px-5">
        {ask.kind === "checkin" ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryBtn} onClick={() => answer(ask.id, { type: "one-claim" })}>
              Keep going, one claim at a time
            </button>
            <button type="button" className={secondaryBtn} onClick={() => answer(ask.id, { type: "step-back" })}>
              Step back to Observer
            </button>
            <button type="button" className={secondaryBtn} onClick={() => answer(ask.id, { type: "pause" })}>
              Pause for 24 hours
            </button>
          </div>
        ) : ask.kind === "escalate" ? (
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zk-text" htmlFor={`${ask.id}-note`}>
              Your note to {ask.admin} <span className="font-normal text-zk-muted">(optional)</span>
            </label>
            <input
              id={`${ask.id}-note`}
              className={inputClass}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={`e.g. I've watched ${agent.name}'s tests for a week and trust its calls.`}
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primaryBtn} onClick={() => answer(ask.id, { type: "forward", note })}>
                Send to {ask.admin.split(" ")[0]}
              </button>
              <button type="button" className={secondaryBtn} onClick={() => answer(ask.id, { type: "not-yet", reason: "Not ready for a team admin yet" })}>
                Not yet
              </button>
            </div>
          </div>
        ) : mode === "areas" ? (
          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-zk-text">Which areas should {agent.name} work on?</legend>
            <div className="flex flex-wrap gap-2">
              {AREAS.map((area) => {
                const on = areas.includes(area);
                return (
                  <label
                    key={area}
                    className={`inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm font-semibold ${
                      on ? "border-electric-blue bg-zk-tint text-zk-accent" : "border-zk-border bg-zk-surface text-zk-text2"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={on}
                      onChange={(e) => setAreas((cur) => (e.target.checked ? [...cur, area] : cur.filter((a) => a !== area)))}
                    />
                    {area}
                  </label>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button type="button" className={primaryBtn} disabled={areas.length === 0} onClick={() => answer(ask.id, { type: "areas", areas })}>
                Yes, for {areas.length ? areas.join(" and ") : "…"}
              </button>
              <button type="button" className={secondaryBtn} onClick={() => setMode(null)}>
                Back
              </button>
            </div>
          </fieldset>
        ) : mode === "not-yet" ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-zk-text">Tell {agent.name} why, so it knows what to work on</p>
            <div className="flex flex-wrap gap-2">
              {NOT_YET_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`min-h-10 rounded-full border px-3.5 text-sm font-semibold ${
                    reason === r ? "border-electric-blue bg-zk-tint text-zk-accent" : "border-zk-border bg-zk-surface text-zk-text2"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <input className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Or write your own reason" aria-label="Reason" />
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primaryBtn} disabled={!reason.trim()} onClick={() => answer(ask.id, { type: "not-yet", reason: reason.trim() })}>
                Send
              </button>
              <button type="button" className={secondaryBtn} onClick={() => setMode(null)}>
                Back
              </button>
            </div>
          </div>
        ) : isTrial ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryBtn} onClick={() => answer(ask.id, { type: "yes" })}>
              Keep {AGENT_LEVEL_LABELS[ask.to]}
            </button>
            <button type="button" className={secondaryBtn} onClick={() => setMode("not-yet")}>
              Not yet, go back to {AGENT_LEVEL_LABELS[ask.from]}
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primaryBtn} onClick={() => answer(ask.id, { type: "yes" })}>
              Yes
            </button>
            <button type="button" className={secondaryBtn} onClick={() => setMode("areas")}>
              Only for some areas
            </button>
            <button type="button" className={secondaryBtn} onClick={() => answer(ask.id, { type: "trial" })}>
              Try it for 24 hours
            </button>
            <button type="button" className={secondaryBtn} onClick={() => setMode("not-yet")}>
              Not yet
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

function WhatChanges({ ask }: { ask: Extract<Ask, { kind: "promote" }> | Extract<Ask, { kind: "escalate" }> }) {
  const gains = ask.kind === "promote" ? ask.gains : ["Accept tested fixes and mark them ready to merge"];
  const keeps = ask.kind === "promote" ? ask.keeps : ["Can't merge to Git or award points (Admin Merger)"];
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <div className="rounded-2xl bg-zk-ok-bg/60 px-3.5 py-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-ok-fg">If you say yes, it can</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-zk-text2">
          {gains.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl bg-zk-chip px-3.5 py-2.5 text-sm">
        <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">It still can&apos;t</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-zk-text2">
          {keeps.map((k) => (
            <li key={k}>{k}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Avatar({ id, name, size = "md" }: { id: string; name: string; size?: "md" | "sm" }) {
  const dims = size === "md" ? "h-11 w-11 text-sm" : "h-8 w-8 text-xs";
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-extrabold text-white ${dims} ${avatarColor(id)}`} aria-hidden>
      {initials(name)}
    </span>
  );
}
