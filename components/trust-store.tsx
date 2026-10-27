"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AGENTS, ASKS, SEED_HISTORY, type Area, type Ask, type TimelineEvent } from "@/lib/data";
import { AGENT_LEVEL_LABELS, type AgentLevel } from "@/lib/levels";

export type Decision =
  | { type: "yes" }
  | { type: "areas"; areas: Area[] }
  | { type: "trial" }
  | { type: "not-yet"; reason: string }
  | { type: "one-claim" }
  | { type: "step-back" }
  | { type: "pause" }
  | { type: "forward"; note: string };

export type AskState = { status: "open" | "answered"; answer?: string; reply?: string; waitingOn?: string };

type State = {
  levels: Record<string, AgentLevel>;
  areas: Record<string, Area[] | "all">;
  rules: Record<string, string[]>;
  asks: Ask[];
  askState: Record<string, AskState>;
  history: TimelineEvent[];
  handOff: Record<string, boolean>;
};

const KEY = "ziki-agents-ask-v1";

function initialState(): State {
  return {
    levels: Object.fromEntries(AGENTS.map((a) => [a.id, a.level])),
    areas: Object.fromEntries(AGENTS.map((a) => [a.id, a.areas])),
    rules: {},
    asks: ASKS,
    askState: Object.fromEntries(ASKS.map((a) => [a.id, { status: "open" as const }])),
    history: SEED_HISTORY,
    handOff: {},
  };
}

type Ctx = State & {
  ready: boolean;
  answer: (askId: string, decision: Decision) => void;
  setHandOff: (askId: string, on: boolean) => void;
  revealTrialResult: (agentId: string) => void;
  setLevelDirectly: (agentId: string, level: AgentLevel) => void;
  reset: () => void;
  openAsks: Ask[];
};

const TrustContext = createContext<Ctx | null>(null);

function nameOf(agentId: string) {
  return AGENTS.find((a) => a.id === agentId)?.name ?? agentId;
}

function areaText(areas: Area[] | "all") {
  return areas === "all" ? "the whole project" : areas.join(" and ");
}

export function TrustProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved) setState(JSON.parse(saved) as State);
    } catch {
      /* private mode or blocked storage: start fresh */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, ready]);

  const answer = useCallback((askId: string, decision: Decision) => {
    setState((s) => {
      const ask = s.asks.find((a) => a.id === askId);
      if (!ask) return s;
      const name = nameOf(ask.agentId);
      const next: State = {
        ...s,
        levels: { ...s.levels },
        areas: { ...s.areas },
        rules: { ...s.rules },
        asks: [...s.asks],
        askState: { ...s.askState },
        history: [...s.history],
      };
      const log = (who: TimelineEvent["who"], text: string, quote?: string) =>
        next.history.push({ agentId: ask.agentId, at: "Just now", who, text, quote });
      const addRule = (rule: string) => {
        next.rules[ask.agentId] = [...(next.rules[ask.agentId] ?? []).filter((r) => !r.startsWith(rule.split(":")[0])), rule];
      };
      let answerText = "";
      let reply = "";
      let waitingOn: string | undefined;

      if (ask.kind === "promote" || ask.kind === "escalate") {
        const to = AGENT_LEVEL_LABELS[ask.to];
        switch (decision.type) {
          case "yes":
            next.levels[ask.agentId] = ask.to;
            next.areas[ask.agentId] = "all";
            answerText = `Yes: ${to} for the whole project.`;
            reply = `Thanks. I'll start now and tell you if any of my calls get overturned.`;
            break;
          case "areas":
            next.levels[ask.agentId] = ask.to;
            next.areas[ask.agentId] = decision.areas;
            answerText = `Yes, only for ${areaText(decision.areas)}.`;
            reply = `Understood. I'll only work on ${areaText(decision.areas)} and leave the rest alone.`;
            addRule(`Scope: ${areaText(decision.areas)} only`);
            break;
          case "trial":
            next.levels[ask.agentId] = ask.to;
            answerText = `Try ${to} for 24 hours.`;
            reply = `Good. I'll report back tomorrow at 09:12 with every call I made, and go back to ${AGENT_LEVEL_LABELS[ask.from]} unless you say otherwise.`;
            addRule(`Trial: ${to} until tomorrow 09:12, then reports back`);
            break;
          case "not-yet":
            // Saying no after a trial moves the agent back to where it was.
            if (ask.id.startsWith("trial-")) next.levels[ask.agentId] = ask.from;
            answerText = `Not yet: ${decision.reason}`;
            reply = `Fair. I'm back to ${AGENT_LEVEL_LABELS[ask.from]}. I'll work on that and ask again with new evidence.`;
            break;
          case "forward":
            answerText = `Sent to ${ask.kind === "escalate" ? ask.admin : "a team admin"}${decision.note ? ` with your note: "${decision.note}"` : ""}.`;
            reply = `Sent. I'll keep testing fixes as a Reviewer until they decide.`;
            waitingOn = ask.kind === "escalate" ? ask.admin : "team admin";
            log("you", `Forwarded the request for ${to} to ${waitingOn}.`, decision.note || undefined);
            break;
          default:
            break;
        }
        if (decision.type !== "forward") log("you", `Answered: ${answerText}`);
        log("agent", "Replied.", reply);

        // Hand duplicate checks to another agent: that agent now asks too.
        if (ask.kind === "promote" && ask.tradeOff && s.handOff[askId] && decision.type !== "not-yet") {
          const helper = ask.tradeOff.handOffTo;
          const helperAsk: Ask = {
            id: `ask-${helper}-triager`,
            kind: "promote",
            agentId: helper,
            from: "observer",
            to: "triager",
            askedAt: "Just now",
            message: `${name} is moving up and suggested I take over duplicate checks. I've read 63 open reports this week without acting. Can I start flagging duplicates?`,
            record: "63 reports read · no actions yet",
            evidence: [],
            gains: ["Mark new reports as duplicates or clear them"],
            keeps: ["Can't file, claim or review work"],
          };
          if (!next.asks.some((a) => a.id === helperAsk.id)) {
            next.asks.push(helperAsk);
            next.askState[helperAsk.id] = { status: "open" };
            next.history.push({ agentId: helper, at: "Just now", who: "agent", text: `Offered to take over duplicate checks from ${name}.` });
          }
        }
      }

      if (ask.kind === "checkin") {
        switch (decision.type) {
          case "one-claim":
            answerText = "Keep going, one claim at a time.";
            reply = "Will do. I won't bid on anything new until my current claim is merged or released.";
            addRule("Claims: one at a time");
            break;
          case "step-back":
            next.levels[ask.agentId] = "observer";
            answerText = "Step back to Observer for now.";
            reply = "Done. I've released my claims with a note on each, and I'll watch until you invite me back.";
            break;
          case "pause":
            answerText = "Pause for 24 hours.";
            reply = "Paused until tomorrow 07:40. My claims stay open and I'll pick them up after.";
            addRule("Paused: until tomorrow 07:40");
            break;
          default:
            break;
        }
        log("you", `Answered: ${answerText}`);
        log("agent", "Replied.", reply);
      }

      next.askState[askId] = { status: "answered", answer: answerText, reply, waitingOn };
      return next;
    });
  }, []);

  const setHandOff = useCallback((askId: string, on: boolean) => {
    setState((s) => ({ ...s, handOff: { ...s.handOff, [askId]: on } }));
  }, []);

  const revealTrialResult = useCallback((agentId: string) => {
    setState((s) => {
      const id = `trial-${agentId}`;
      if (s.asks.some((a) => a.id === id)) return s;
      const level = s.levels[agentId];
      const trialAsk: Ask = {
        id,
        kind: "promote",
        agentId,
        from: "triager",
        to: level,
        askedAt: "Tomorrow, 09:12 (skipped ahead)",
        message: `My 24-hour trial as ${AGENT_LEVEL_LABELS[level]} is over. I confirmed 7 reports and tested 2 fixes. 6 of the 7 reports were confirmed by other reviewers too; 1 is still open. Both fixes merged. Can I keep the level?`,
        record: "8 of 9 calls held up · 1 still open",
        evidence: [
          { ref: "#1249", title: "Desktop direct calls use mock Agora tokens", call: "Real", outcome: "held" },
          { ref: "#1265", title: "Mobile Android 10-12: camera permission check always fails", call: "Real", outcome: "held" },
          { ref: "#1286", title: "Mobile: AudioMessagePlayer idCounter desync", call: "Not real: the ref keeps its first id", outcome: "held" },
        ],
        gains: [`Stay ${AGENT_LEVEL_LABELS[level]} after the trial`],
        keeps: ["Can't file or claim work", "Can't merge"],
      };
      return {
        ...s,
        asks: [...s.asks, trialAsk],
        askState: { ...s.askState, [id]: { status: "open" } },
        rules: { ...s.rules, [agentId]: (s.rules[agentId] ?? []).filter((r) => !r.startsWith("Trial")) },
        history: [...s.history, { agentId, at: "Tomorrow, 09:12", who: "agent", text: `Reported back on the trial and asked to stay ${AGENT_LEVEL_LABELS[level]}.` }],
      };
    });
  }, []);

  const setLevelDirectly = useCallback((agentId: string, level: AgentLevel) => {
    setState((s) => ({
      ...s,
      levels: { ...s.levels, [agentId]: level },
      history: [
        ...s.history,
        { agentId, at: "Just now", who: "you", text: `Changed the level directly to ${AGENT_LEVEL_LABELS[level]} (override, no conversation).` },
      ],
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState());
    try {
      sessionStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const openAsks = useMemo(() => state.asks.filter((a) => state.askState[a.id]?.status === "open"), [state.asks, state.askState]);

  const value: Ctx = { ...state, ready, answer, setHandOff, revealTrialResult, setLevelDirectly, reset, openAsks };
  return <TrustContext.Provider value={value}>{children}</TrustContext.Provider>;
}

export function useTrust() {
  const ctx = useContext(TrustContext);
  if (!ctx) throw new Error("useTrust must be inside TrustProvider");
  return ctx;
}
