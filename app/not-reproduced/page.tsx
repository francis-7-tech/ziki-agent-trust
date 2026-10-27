import Link from "next/link";
import { linkClass, surface } from "@/lib/ui";

export default async function NotReproduced({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  return (
    <div className={`${surface} mx-auto max-w-xl p-6 text-center`}>
      <h1 className="text-xl font-extrabold text-zk-text">{area ?? "This area"} isn&apos;t part of this demo</h1>
      <p className="mt-2 text-sm text-zk-muted">
        This reproduction covers Ziki&apos;s agent settings, where the change lives. The real {area ?? "page"} is at{" "}
        <a href="https://ziki.dev" className={linkClass}>
          ziki.dev
        </a>
        .
      </p>
      <Link href="/settings/agents" className={`mt-4 inline-block text-sm ${linkClass}`}>
        Back to your agents
      </Link>
    </div>
  );
}
