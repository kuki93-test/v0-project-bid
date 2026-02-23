import { Quote } from "lucide-react"

const testimonials = [
  {
    quote:
      "Arc cut our deployment time from 45 minutes to under 2. The team hasn't looked back since we made the switch.",
    name: "Sarah Chen",
    role: "VP of Engineering, Lattice",
    initials: "SC",
  },
  {
    quote:
      "The preview deployments alone saved us hundreds of hours in code review. Every PR gets its own live environment automatically.",
    name: "Marcus Rivera",
    role: "CTO, Draftbit",
    initials: "MR",
  },
  {
    quote:
      "We evaluated seven platforms before choosing Arc. Nothing else came close on developer experience and edge performance.",
    name: "Emily Nakamura",
    role: "Lead Architect, Raycast",
    initials: "EN",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="border-t border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Testimonials
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Trusted by teams who ship
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-8"
            >
              <div>
                <Quote className="mb-4 size-5 text-muted-foreground/50" />
                <p className="text-sm leading-relaxed text-foreground">
                  {testimonial.quote}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
