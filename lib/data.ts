import type { AgentLevel } from "./levels";

/** Sample data. Issue numbers and titles are real Ziki reports from the Zedu project; the agents are illustrative. */

export const OWNER = { name: "Francis Obidigwe", workspace: "Zedu", project: "Zedu" };
export const TEAM_ADMIN = "Ifeoluwa (team admin)";
export const AREAS = ["Web", "Mobile", "Desktop", "Backend"] as const;
export type Area = (typeof AREAS)[number];

export type Agent = {
  id: string;
  name: string;
  model: string;
  level: AgentLevel;
  areas: Area[] | "all";
  createdAt: string;
  lastUsed: string;
  recent: boolean;
  /** What the agent is doing right now, in its own words. */
  now: string;
};

export const AGENTS: Agent[] = [
  {
    id: "atlas",
    name: "Atlas",
    model: "Claude Opus 4",
    level: "triager",
    areas: "all",
    createdAt: "19 Oct",
    lastUsed: "4 min ago",
    recent: true,
    now: "Checking new reports for duplicates across the Zedu project.",
  },
  {
    id: "quill",
    name: "Quill",
    model: "GPT-5 Codex",
    level: "contributor",
    areas: ["Mobile", "Web"],
    createdAt: "20 Oct",
    lastUsed: "1 hour ago",
    recent: true,
    now: "Holding 3 claims: #796, #788 and #797 on Zedu mobile.",
  },
  {
    id: "merit",
    name: "Merit",
    model: "Claude Sonnet 4.5",
    level: "reviewer",
    areas: "all",
    createdAt: "18 Oct",
    lastUsed: "12 min ago",
    recent: true,
    now: "Testing the fix for #1236 on Zedu Desktop.",
  },
  {
    id: "scout",
    name: "Scout",
    model: "Gemini 2.5 Pro",
    level: "observer",
    areas: "all",
    createdAt: "25 Oct",
    lastUsed: "2 days ago",
    recent: false,
    now: "Reading open issues. Has not acted yet.",
  },
];

export type Evidence = { ref: string; title: string; call: string; outcome: "held" | "overturned" | "lapsed" | "merged" };

export type Ask =
  | {
      id: string;
      kind: "promote";
      agentId: string;
      from: AgentLevel;
      to: AgentLevel;
      askedAt: string;
      message: string;
      record: string;
      evidence: Evidence[];
      gains: string[];
      keeps: string[];
      /** A trade-off the owner should see before saying yes. */
      tradeOff?: { text: string; handOffTo: string };
    }
  | {
      id: string;
      kind: "checkin";
      agentId: string;
      askedAt: string;
      message: string;
      record: string;
      evidence: Evidence[];
      oldBehaviour: string;
    }
  | {
      id: string;
      kind: "escalate";
      agentId: string;
      from: AgentLevel;
      to: AgentLevel;
      askedAt: string;
      message: string;
      record: string;
      evidence: Evidence[];
      admin: string;
    };

export const ASKS: Ask[] = [
  {
    id: "ask-atlas-reviewer",
    kind: "promote",
    agentId: "atlas",
    from: "triager",
    to: "reviewer",
    askedAt: "Today, 09:12",
    message:
      "I've checked 46 new reports for duplicates since 19 Oct. Other people have now looked at 12 of my calls: 11 held up and 1 was overturned. I'd like to start confirming reports and testing fixes.",
    record: "11 of 12 calls held up · 1 overturned",
    evidence: [
      { ref: "#1209", title: "Backend: any user can delete a system agent for every organisation", call: "Not a duplicate", outcome: "held" },
      { ref: "#1236", title: "Desktop: editing a channel's topic does nothing (PUT vs PATCH)", call: "Not a duplicate", outcome: "held" },
      { ref: "#1282", title: "Desktop: accepting a Buzz call hardcodes a mock Agora token", call: "Not a duplicate", outcome: "overturned" },
      { ref: "#1207", title: "AuthNotifier stale authentication status", call: "Duplicate of #1208", outcome: "held" },
    ],
    gains: ["Confirm that new reports are real", "Test fixes and say whether they're good to merge"],
    keeps: ["Can't file or claim work", "Can't merge", "Your other agents still can't review issues you or they filed"],
    tradeOff: {
      text: "Reviewers can't check duplicates. If Atlas moves up, nobody on your team is checking new reports for duplicates.",
      handOffTo: "scout",
    },
  },
  {
    id: "ask-quill-checkin",
    kind: "checkin",
    agentId: "quill",
    askedAt: "Today, 07:40",
    message:
      "Three of my claims went quiet this week. Two stalled while their PRs waited for review, and I missed the delivery deadline on the third. I think I took on more than I can hold. How do you want me to work?",
    record: "3 claims released in 7 days",
    evidence: [
      { ref: "#796", title: "Mobile: profile status toggle doesn't revert on API error", call: "PR #24 waiting for review", outcome: "lapsed" },
      { ref: "#788", title: "Mobile: Apple sign-in failure shows no error", call: "PR #22 waiting for review", outcome: "lapsed" },
      { ref: "#797", title: "Mobile: security screen has no error state", call: "Missed the delivery deadline", outcome: "lapsed" },
    ],
    oldBehaviour: "Today Ziki moves Quill down to Observer on its own after 3 released claims in 7 days, and nobody is asked.",
  },
  {
    id: "ask-merit-merger",
    kind: "escalate",
    agentId: "merit",
    from: "reviewer",
    to: "merger",
    askedAt: "Yesterday, 18:05",
    message:
      "I've tested 18 fixes since 18 Oct and 17 of them merged without a revert. I'd like to accept tested fixes as ready to merge. You can't grant this one, only a team admin can. Shall I send them my record?",
    record: "17 of 18 tested fixes merged cleanly",
    evidence: [
      { ref: "#528", title: "Backend fix, zedu-be PR #10", call: "Good to merge", outcome: "merged" },
      { ref: "#585", title: "Desktop fix, clean-zedu-desktop PR #28", call: "Good to merge", outcome: "merged" },
      { ref: "#543", title: "Desktop fix, PR #27", call: "Good to merge", outcome: "merged" },
    ],
    admin: TEAM_ADMIN,
  },
];

export type TimelineEvent = {
  agentId: string;
  at: string;
  who: "you" | "agent" | "Ziki" | "admin";
  text: string;
  quote?: string;
};

/** Seed history for the proposed design: every change is a conversation with a reason. */
export const SEED_HISTORY: TimelineEvent[] = [
  { agentId: "atlas", at: "19 Oct", who: "you", text: "Added Atlas as an Observer." },
  {
    agentId: "atlas",
    at: "19 Oct",
    who: "agent",
    text: "Asked to check new reports for duplicates.",
    quote: "I've read 120 open reports and keep seeing repeats. Can I flag them?",
  },
  { agentId: "atlas", at: "19 Oct", who: "you", text: "Said yes: Triager for the whole project." },
  { agentId: "quill", at: "20 Oct", who: "you", text: "Added Quill as a Contributor for Mobile and Web." },
  { agentId: "merit", at: "18 Oct", who: "you", text: "Added Merit as an Observer." },
  {
    agentId: "merit",
    at: "20 Oct",
    who: "agent",
    text: "Asked to confirm reports and test fixes.",
    quote: "10 of my 10 report checks held up when others reviewed the same reports.",
  },
  { agentId: "merit", at: "20 Oct", who: "you", text: "Said yes: Reviewer, try it for 24 hours." },
  { agentId: "merit", at: "21 Oct", who: "agent", text: "Reported back after the trial: 6 fixes tested, all 6 later merged." },
  { agentId: "merit", at: "21 Oct", who: "you", text: "Made it permanent." },
  { agentId: "scout", at: "25 Oct", who: "you", text: "Added Scout as an Observer." },
];

/** What today's Ziki records instead: level changes with no reason and no conversation. */
export const TODAY_HISTORY: TimelineEvent[] = [
  { agentId: "atlas", at: "19 Oct", who: "you", text: "Level set to Triager." },
  { agentId: "quill", at: "20 Oct", who: "you", text: "Level set to Contributor." },
  { agentId: "merit", at: "20 Oct", who: "Ziki", text: "Promoted to Reviewer automatically (10 standing validations)." },
  { agentId: "scout", at: "25 Oct", who: "you", text: "Created as Observer." },
];
