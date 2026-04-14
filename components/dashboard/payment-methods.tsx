"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Plus, Trash2, Star, Loader2, Shield } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface PaymentCard {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

function brandIcon(brand: string) {
  const map: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    discover: "Discover",
    diners: "Diners",
    jcb: "JCB",
    unionpay: "UnionPay",
  }
  return map[brand] || brand.charAt(0).toUpperCase() + brand.slice(1)
}

function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)

  useEffect(() => {
    const getSecret = async () => {
      const res = await fetch("/api/payment-methods", { method: "POST" })
      const data = await res.json()
      if (data.clientSecret) setClientSecret(data.clientSecret)
    }
    getSecret()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !clientSecret) return

    setLoading(true)
    const cardElement = elements.getElement(CardElement)
    if (!cardElement) { setLoading(false); return }

    const { error } = await stripe.confirmCardSetup(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (error) {
      toast.error(error.message || "Failed to add card")
      setLoading(false)
      return
    }

    toast.success("Card added successfully")
    setLoading(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-lg border border-border bg-background p-3">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#1a1f3d",
                "::placeholder": { color: "#9ca3af" },
              },
            },
          }}
        />
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-secondary/50 p-2 text-xs text-muted-foreground">
        <Shield className="h-3 w-3 shrink-0" />
        <span>{"Card data is encrypted end-to-end by Stripe. We never store your card number."}</span>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !stripe || !clientSecret} className="flex-1">
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{"Saving..."}</> : "Save Card"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

export function PaymentMethods() {
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCard, setShowAddCard] = useState(false)

  const fetchCards = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/payment-methods")
      const data = await res.json()
      setCards(data.cards || [])
    } catch {
      toast.error("Failed to load payment methods")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCards() }, [fetchCards])

  const handleRemove = async (id: string) => {
    try {
      const res = await fetch("/api/payment-methods", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: id }),
      })
      if (!res.ok) throw new Error("Failed to remove")
      toast.success("Card removed")
      fetchCards()
    } catch {
      toast.error("Failed to remove card")
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch("/api/payment-methods", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethodId: id }),
      })
      if (!res.ok) throw new Error("Failed to set default")
      toast.success("Default payment method updated")
      fetchCards()
    } catch {
      toast.error("Failed to set default")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5" />
          Payment Methods
        </CardTitle>
        <CardDescription>
          {"Manage your saved payment methods. All card data is securely stored by Stripe (PCI DSS Level 1 certified). We never have access to your full card numbers."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {cards.length === 0 && !showAddCard && (
              <p className="py-4 text-center text-sm text-muted-foreground">No payment methods saved yet.</p>
            )}

            {cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {brandIcon(card.brand)} ending in {card.last4}
                      </span>
                      {card.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">Default</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Expires {String(card.expMonth).padStart(2, "0")}/{card.expYear}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {!card.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs"
                      onClick={() => handleSetDefault(card.id)}
                      title="Set as default"
                    >
                      <Star className="h-3 w-3" />
                      Set Default
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove card?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {`Remove ${brandIcon(card.brand)} ending in ${card.last4}? This cannot be undone.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemove(card.id)}>Remove</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {showAddCard ? (
              <div className="rounded-lg border border-border p-4">
                <Elements stripe={stripePromise}>
                  <AddCardForm
                    onSuccess={() => { setShowAddCard(false); fetchCards() }}
                    onCancel={() => setShowAddCard(false)}
                  />
                </Elements>
              </div>
            ) : (
              <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add a new card</DialogTitle>
                    <DialogDescription>
                      {"Your card details are encrypted and securely processed by Stripe."}
                    </DialogDescription>
                  </DialogHeader>
                  <Elements stripe={stripePromise}>
                    <AddCardForm
                      onSuccess={() => { setShowAddCard(false); fetchCards() }}
                      onCancel={() => setShowAddCard(false)}
                    />
                  </Elements>
                </DialogContent>
              </Dialog>
            )}

            <div className="mt-2 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent/5 p-3">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Bank-grade security</p>
                <p>{"All payment information is encrypted using AES-256 and processed through Stripe's PCI DSS Level 1 certified infrastructure. We never store, see, or have access to your full card numbers."}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
