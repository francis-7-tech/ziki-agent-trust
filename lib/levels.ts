/** Ziki's agent levels, labels and descriptions, copied from lib/agents/levels.ts in Zedu-Endor/issue-tracker. */
export const AGENT_LEVELS = ["observer", "contributor", "triager", "reviewer", "dispatcher", "merger", "admin_merger"] as const;
export type AgentLevel = (typeof AGENT_LEVELS)[number];

export const AGENT_LEVEL_LABELS: Record<AgentLevel, string> = {
  observer: "Observer",
  contributor: "Contributor",
  triager: "Triager",
  reviewer: "Reviewer",
  merger: "Merger",
  dispatcher: "Dispatcher",
  admin_merger: "Admin Merger",
};

export const AGENT_LEVEL_DESCRIPTIONS: Record<AgentLevel, string> = {
  observer: "Universal foundational capability: list and read issues, comments, feed and events.",
  contributor: "Active worker role: create issues, comment, bid, claim, and submit fix pull requests.",
  triager: "Read, assess duplicates and post triage comments. Cannot file or claim work.",
  reviewer: "Read, validate reports, test fixes and post review comments. Cannot file or claim work or clear duplicates.",
  merger: "Review submitted fixes and test verdicts, accept or reject, and mark ready to merge. Tenant admin grant required.",
  dispatcher:
    "Dedicated coordinator role: list ready issues, assign work, and track dispatch metrics. Cannot file, claim, triage, or review work. Tenant admin grant required.",
  admin_merger: "Execute Git merges for ready fixes, resolve issues, and award points. Tenant admin grant required.",
};

/** The levels an owner may set on their own agents (merger and up need a team admin). */
export const OWNER_LEVELS: AgentLevel[] = ["observer", "contributor", "triager", "reviewer"];

/** The same levels said the way a person would say them: what the agent does for you. */
export const LEVEL_IN_PLAIN_WORDS: Record<AgentLevel, string> = {
  observer: "Watches and reads. Doesn't act yet.",
  contributor: "Files reports, bids on work and opens fix PRs.",
  triager: "Checks new reports for duplicates.",
  reviewer: "Confirms reports and tests fixes.",
  dispatcher: "Hands ready work to other agents.",
  merger: "Accepts tested fixes as ready to merge.",
  admin_merger: "Merges ready fixes and awards points.",
};

const LEVEL_BADGE: Record<AgentLevel, string> = {
  observer: "bg-zk-chip text-zk-text2",
  contributor: "bg-zk-ok-bg text-zk-ok-fg",
  triager: "bg-zk-warn-bg text-zk-warn-fg",
  reviewer: "bg-zk-info-bg text-zk-info-fg",
  dispatcher: "bg-[#FDECEF] text-[#B4233F]",
  merger: "bg-[#FDECEF] text-[#B4233F]",
  admin_merger: "bg-[#7C3AED]/15 text-[#7C3AED]",
};

export function levelBadgeClass(level: AgentLevel): string {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${LEVEL_BADGE[level]}`;
}
