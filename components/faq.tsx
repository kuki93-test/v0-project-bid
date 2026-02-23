import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does Arc differ from other deployment platforms?",
    answer:
      "Arc is built edge-first, meaning your applications are deployed to the edge by default. Combined with our git-native workflow, automatic preview deployments, and zero-config approach, we provide the fastest path from code to production.",
  },
  {
    question: "Can I migrate my existing projects to Arc?",
    answer:
      "Yes. Arc supports all major frameworks including Next.js, Remix, Astro, and more. Most migrations take less than 10 minutes with our guided import tool that connects directly to your Git repository.",
  },
  {
    question: "What kind of support is included?",
    answer:
      "Starter plans include community support through our forums and Discord. Pro plans include priority email support with a 4-hour response time. Enterprise plans include dedicated support engineers and a guaranteed SLA.",
  },
  {
    question: "Is there a free trial for the Pro plan?",
    answer:
      "Yes, every Pro plan starts with a 14-day free trial with full access to all features. No credit card required. You can downgrade to Starter at any time if Pro isn't the right fit.",
  },
  {
    question: "How does billing work for teams?",
    answer:
      "Pro plans are billed per team. You can add up to 10 members on a single Pro plan. For larger teams, our Enterprise plan offers unlimited members with volume-based pricing tailored to your organization.",
  },
  {
    question: "What about uptime and reliability?",
    answer:
      "Arc maintains a 99.99% uptime SLA for Pro and Enterprise customers. Our platform runs on a globally distributed network with automatic failover, ensuring your applications stay online.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="border-t border-border px-6 py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            FAQ
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {"Everything you need to know about Arc. Can't find what you're looking for? Reach out to our team."}
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
