import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    description: "Perfect for side projects and personal sites.",
    features: [
      "Up to 3 projects",
      "Automatic HTTPS",
      "Community support",
      "1 team member",
      "100 GB bandwidth",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "For growing teams that need more power and collaboration.",
    features: [
      "Unlimited projects",
      "Preview deployments",
      "Priority support",
      "Up to 10 team members",
      "1 TB bandwidth",
      "Custom domains",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored for you",
    description: "For organizations with advanced security and compliance needs.",
    features: [
      "Everything in Pro",
      "SSO & SAML",
      "SOC 2 compliance",
      "Unlimited team members",
      "Dedicated support",
      "SLA guarantee",
      "Custom contracts",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Pricing
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            Start free. Scale when you need to. No surprises.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {plan.name}
              </p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-[family-name:var(--font-heading)] text-4xl font-bold tracking-tight">
                  {plan.price}
                </span>
                <span
                  className={`text-sm ${
                    plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"
                  }`}
                >
                  /{plan.period}
                </span>
              </div>
              <p
                className={`mt-3 text-sm leading-relaxed ${
                  plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-8 flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check
                      className={`size-4 shrink-0 ${
                        plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  className={`w-full rounded-full ${
                    plan.highlighted
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
