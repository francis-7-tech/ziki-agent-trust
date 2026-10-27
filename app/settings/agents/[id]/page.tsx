import { notFound } from "next/navigation";
import { AgentDetail } from "@/components/agent-detail";
import { DemoBar, type View } from "@/components/demo-bar";
import { AGENTS } from "@/lib/data";

export function generateStaticParams() {
  return AGENTS.map((a) => ({ id: a.id }));
}

export default async function AgentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { id } = await params;
  const { view: raw } = await searchParams;
  if (!AGENTS.some((a) => a.id === id)) notFound();
  const view: View = raw === "today" ? "today" : "proposed";
  return (
    <>
      <DemoBar view={view} basePath={`/settings/agents/${id}`} />
      <AgentDetail id={id} view={view} />
    </>
  );
}
