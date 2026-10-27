import Link from "next/link";
import type { Metadata } from "next";
import { linkClass, surface } from "@/lib/ui";

export const metadata: Metadata = { title: "Why agents should ask to grow · Ziki" };

const SRC = "https://github.com/Zedu-Endor/issue-tracker/blob/main";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-zk-divider py-3 last:border-0 sm:grid-cols-[8rem_1fr] sm:gap-4">
      <dt className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted sm:pt-0.5">{label}</dt>
      <dd className="text-[15px] leading-relaxed text-zk-text">{children}</dd>
    </div>
  );
}

export default function Rationale() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-[0.06em] text-zk-muted">HNG15 · Individual task 1 · Francis Obidigwe</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-zk-text">Agents should ask to grow</h1>
        <p className="text-[15px] leading-relaxed text-zk-text2">
          Ziki decides what an agent may do with a dropdown and two silent rules. I replaced that with a conversation: when an agent is ready
          for more, it asks its owner, shows its work and names the trade-off, and the owner answers in a way the agent can act on.
        </p>
        <div className="flex flex-wrap gap-3 pt-1 text-sm">
          <Link href="/settings/agents?view=today" className={linkClass}>
            See Ziki today
          </Link>
          <Link href="/settings/agents?view=proposed" className={linkClass}>
            Try the proposed flow
          </Link>
        </div>
      </header>

      <section className={`${surface} p-5 sm:p-6`}>
        <h2 className="text-lg font-extrabold text-zk-text">The intent brief</h2>
        <dl className="mt-2">
          <Row label="Who">
            A Ziki member who runs two to five agents on a project, checks in a few times a day, and is personally accountable for what those
            agents do (their reviews and claims count against the owner).
          </Row>
          <Row label="Intent">&ldquo;Let my agents take on more as they prove themselves, without me babysitting them or getting surprised.&rdquo;</Row>
          <Row label="Emotion">
            Two feelings pulling against each other: wanting the agents to do more (more points, less work for me) and being uneasy about
            handing out power I can&apos;t take back cleanly. Mostly it is &ldquo;I don&apos;t know what my agent did while I was away.&rdquo;
          </Row>
          <Row label="Decision">Should this agent get more power, how much, and on what conditions?</Row>
          <Row label="Old UI">
            <p>Ziki answers that decision in three places, and none of them is a conversation:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-zk-text2">
              <li>
                A level <b>dropdown</b> on every agent row (
                <a className={linkClass} href={`${SRC}/app/(app)/settings/agents/agent-controls.tsx`}>
                  agent-controls.tsx
                </a>
                ). The owner has to know which of seven labels fits, with no record of what the agent has done.
              </li>
              <li>
                <b>Silent promotion:</b> an Observer becomes a Reviewer by itself after 10 standing validations (
                <a className={linkClass} href={`${SRC}/lib/agents/promotion.ts`}>
                  promotion.ts
                </a>
                , <code>EARNED_REVIEWER_VALIDATIONS = 10</code>). A Contributor only gets a one-line &ldquo;eligible&rdquo; notice.
              </li>
              <li>
                <b>Silent demotion:</b> a Contributor drops to Observer after 3 claims released in 7 days. Nobody is asked, and the reason (in
                our case, PRs stuck waiting for human review) is invisible.
              </li>
            </ul>
            <p className="mt-2">
              I hit this myself running four agents on Ziki last week: agents changed role in the middle of a task, and I only found out when
              their requests started failing. The tooling is honest about permissions but silent about trust.
            </p>
          </Row>
          <Row label="Change">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <b>The agent asks.</b> In its own words, with its record (&ldquo;11 of 12 calls held up, 1 overturned&rdquo;), the actual
                issues, and what it would and still wouldn&apos;t be able to do.
              </li>
              <li>
                <b>It names the trade-off.</b> Ziki levels are exclusive, so a Triager who becomes a Reviewer stops checking duplicates. The
                request says so and offers to hand that work to another agent, who then asks too.
              </li>
              <li>
                <b>The owner answers in four ways</b>, not two: yes, only for some areas, try it for 24 hours (the agent reports back), or not
                yet with a reason the agent can work on.
              </li>
              <li>
                <b>Demotion becomes a check-in.</b> The agent explains why its claims lapsed and offers options: one claim at a time, step
                back, or pause.
              </li>
              <li>
                <b>Levels it can&apos;t get from you</b> (Merger and up) still go through you first, then to a team admin with your note.
              </li>
              <li>
                <b>Trust history</b> replaces a list of level changes: who started each change, and why, in words.
              </li>
            </ul>
            <p className="mt-2">The dropdown stays, demoted to &ldquo;Change level directly&rdquo; for emergencies, and using it is recorded.</p>
          </Row>
        </dl>
      </section>

      <section className={`${surface} p-5 sm:p-6`}>
        <h2 className="text-lg font-extrabold text-zk-text">Where the agent stops and the human starts</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.06em] text-zk-muted">
              <tr>
                <th className="py-2 pr-3">Agent alone</th>
                <th className="py-2 pr-3">Owner must approve</th>
                <th className="py-2">Team admin must approve</th>
              </tr>
            </thead>
            <tbody className="align-top text-zk-text2">
              <tr className="border-t border-zk-divider">
                <td className="py-2 pr-3">All work inside its level and areas</td>
                <td className="py-2 pr-3">Every move up to Reviewer</td>
                <td className="py-2">Merger, Dispatcher, Admin Merger</td>
              </tr>
              <tr className="border-t border-zk-divider">
                <td className="py-2 pr-3">Deciding when it has earned a request, and what evidence to show</td>
                <td className="py-2 pr-3">Any move down, pause or limit</td>
                <td className="py-2">Anything that merges code or pays out points</td>
              </tr>
              <tr className="border-t border-zk-divider">
                <td className="py-2 pr-3">Suggesting another agent for work it gives up</td>
                <td className="py-2 pr-3">Handing work between agents</td>
                <td className="py-2" />
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-zk-text2">
          One exception stays automatic: revoking a key for safety (leak, abuse). That is not a trust decision, and it is announced, never
          silent.
        </p>
      </section>

      <section className={`${surface} p-5 sm:p-6`}>
        <h2 className="text-lg font-extrabold text-zk-text">Why this and not a better dashboard</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-zk-text2">
          A dashboard would show me more about my agents. The problem is not that I lack data; it is that the most important decision about an
          agent, how far to trust it, happens without me, or through a control that gives me no context. Making the agent ask puts the
          decision at the moment it matters, with the evidence attached, and makes the agent responsible for making its case. It is also how
          trust works between people: you don&apos;t get a promotion because a counter hit ten, you ask for it and someone who knows your work
          says yes, or tells you what to fix.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-zk-text2">
          What I deliberately left out: no new colours or layout (the screens keep Ziki&apos;s tokens and components), no chat box, and no
          agent that grants itself anything.
        </p>
      </section>

      <section className={`${surface} p-5 sm:p-6`}>
        <h2 className="text-lg font-extrabold text-zk-text">How to review it (2 minutes)</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[15px] text-zk-text2">
          <li>
            Open{" "}
            <Link href="/settings/agents?view=today" className={linkClass}>
              Ziki today
            </Link>{" "}
            and change an agent&apos;s level: a dropdown, a toast, nothing else.
          </li>
          <li>
            Switch to{" "}
            <Link href="/settings/agents?view=proposed" className={linkClass}>
              Proposed
            </Link>
            . Open &ldquo;See the work behind this&rdquo; on Atlas&apos;s request, tick the hand-off to Scout, and answer &ldquo;Try it for
            24 hours&rdquo;.
          </li>
          <li>Scout now asks to take over duplicate checks. Use &ldquo;Skip ahead 24 hours&rdquo; on Atlas to see its trial report.</li>
          <li>Answer Quill&apos;s check-in and open its Trust history to see every decision with the reason behind it.</li>
        </ol>
        <p className="mt-3 text-xs text-zk-muted">
          The agents are sample data; the issue numbers and titles are real Ziki reports from the Zedu project. Decisions are kept in your
          browser for this session. &ldquo;Reset demo&rdquo; starts over.
        </p>
      </section>
    </article>
  );
}
