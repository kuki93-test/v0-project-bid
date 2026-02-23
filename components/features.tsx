import { Zap, Shield, BarChart3, GitBranch, Globe, Layers } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Automated Execution",
    description:
      "Streamline your workflows with automated CI/CD pipelines. Push code, sit back, and watch your changes go live.",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description:
      "SOC 2 Type II compliant with end-to-end encryption, SSO, and granular role-based access controls built in.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Monitor performance, track deployments, and get actionable insights with our built-in observability dashboard.",
  },
  {
    icon: GitBranch,
    title: "Git-native Workflow",
    description:
      "Every branch gets a preview deployment. Review changes in context with automatic environment creation.",
  },
  {
    icon: Globe,
    title: "Edge-first Platform",
    description:
      "Deploy to the edge by default. Your applications run closer to your users for blazing-fast response times.",
  },
  {
    icon: Layers,
    title: "Custom Strategies",
    description:
      "Build custom deployment pipelines, automate rollbacks, and create approval workflows for your team.",
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Features
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Faster iteration. More innovation.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            The platform for rapid progress. Let your team focus on shipping features instead of managing infrastructure.
          </p>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col gap-3 bg-card p-8 md:p-10">
              <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
                <feature.icon className="size-5 text-foreground" />
              </div>
              <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
