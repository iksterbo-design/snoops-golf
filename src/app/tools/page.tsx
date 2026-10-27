import { TOOLS, TOOLSETS } from "@/lib/tools/data";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const metadata = { title: "Tools — AI Golf Coach" };

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-ink-900">Tools &amp; Toolsets</h1>
      <p className="mt-1 max-w-2xl text-sm text-ink-500">
        {TOOLS.length} helper tools across {TOOLSETS.length} toolsets to support coaches, staff, and golfers.
      </p>

      {TOOLSETS.map(ts => (
        <section key={ts} className="mt-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-ink-900">{ts}</h2>
            <Badge tone="blue">{TOOLS.filter(t => t.toolset === ts).length} tools</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {TOOLS.filter(t => t.toolset === ts).map(t => (
              <Card key={t.id} className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardBody className="pt-4">
                  <div className="text-sm font-semibold text-ink-900">{t.name}</div>
                  <p className="mt-1 text-xs text-ink-500">{t.description}</p>
                  <Badge tone="slate" className="mt-2">{t.id}</Badge>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
