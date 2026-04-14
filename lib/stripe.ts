import 'server-only'

import Stripe from 'stripe'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripeInstance
}

// For backwards compatibility
export const stripe = {
  get checkout() {
    return getStripe().checkout
  },
  get customers() {
    return getStripe().customers
  },
  get paymentMethods() {
    return getStripe().paymentMethods
  },
  get setupIntents() {
    return getStripe().setupIntents
  },
}
