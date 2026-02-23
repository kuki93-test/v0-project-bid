import { UserPlus, Search, Gavel, CreditCard } from "lucide-react"

const steps = [
  {
    icon: <UserPlus className="h-6 w-6" />,
    title: "Create an Account",
    description: "Sign up as a buyer or seller. Verify your email and phone number to get started.",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Browse or List Items",
    description: "Explore thousands of listings or create your own. Set auction times and buy-now prices.",
  },
  {
    icon: <Gavel className="h-6 w-6" />,
    title: "Bid or Buy Now",
    description: "Place bids on auctions or use buy-now for instant purchases. Track all your activity.",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Secure Payment",
    description: "Pay securely through our platform. Transparent commissions with no hidden fees.",
  },
]

export function HowItWorks() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-foreground">
            How It Works
          </h2>
          <p className="mt-2 text-muted-foreground">
            Getting started is simple
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {/* Step number connector */}
              {index < steps.length - 1 && (
                <div className="absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-border lg:block" />
              )}

              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                {step.icon}
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {index + 1}
                </span>
              </div>

              <h3 className="mb-2 text-base font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
