import { DemoBar, type View } from "@/components/demo-bar";
import { ProposedAgents } from "@/components/proposed-agents";
import { TodayAgents } from "@/components/today-agents";

export default async function AgentsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view: raw } = await searchParams;
  const view: View = raw === "today" ? "today" : "proposed";
  return (
    <>
      <DemoBar view={view} basePath="/settings/agents" />
      {view === "today" ? <TodayAgents /> : <ProposedAgents />}
    </>
  );
}
