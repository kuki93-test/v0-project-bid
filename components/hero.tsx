import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-32 md:pb-36">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium">
            <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
            Announcing our $20M Series A
            <ArrowRight className="size-3" />
          </Badge>

          <h1 className="max-w-3xl text-balance font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-6xl lg:text-7xl">
            Ship faster with modern infrastructure
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
            The modern platform for teams who build. Automated workflows, seamless collaboration, and zero-config deployments that scale.
          </p>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 rounded-full px-8">
              Request Access
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
          {[
            { value: "20 days", label: "saved on daily builds" },
            { value: "98%", label: "faster time to market" },
            { value: "300%", label: "increase in productivity" },
            { value: "6x", label: "faster build + deploy" },
          ].map((stat) => (
            <div key={stat.value} className="flex flex-col gap-1 bg-card p-6 md:p-8">
              <span className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
