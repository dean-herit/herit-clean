import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import * as Sentry from '@sentry/nextjs'
import { db } from '@/db/db'
import { users, auditEvents } from '@/db/schema'
import { eq } from 'drizzle-orm'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
  } catch (err) {
    Sentry.captureException(err, {
      tags: {
        webhook: 'stripe',
        error_type: 'signature_verification',
      },
    })
    
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
        
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Log the webhook event for audit purposes
    await logWebhookEvent(event)

    return NextResponse.json({ received: true })
    
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        webhook: 'stripe',
        event_type: event.type,
        event_id: event.id,
      },
      extra: {
        eventData: event.data,
      },
    })
    
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  // Find user by Stripe customer ID
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, customerId))
    .limit(1)
  
  if (user) {
    // Update user's subscription status
    await db
      .update(users)
      .set({
        // Add subscription fields to user schema if needed
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
    
    // Track subscription creation
    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Subscription created',
      level: 'info',
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        status: subscription.status,
      },
    })
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, customerId))
    .limit(1)
  
  if (user) {
    // Update user's subscription status
    await db
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
    
    // Track subscription update
    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Subscription updated',
      level: 'info',
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        status: subscription.status,
        previousStatus: subscription.status, // Would need to track previous state
      },
    })
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, customerId))
    .limit(1)
  
  if (user) {
    // Update user's subscription status
    await db
      .update(users)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
    
    // Track subscription cancellation
    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Subscription cancelled',
      level: 'warning',
      data: {
        userId: user.id,
        subscriptionId: subscription.id,
        cancelledAt: new Date().toISOString(),
      },
    })
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, customerId))
    .limit(1)
  
  if (user) {
    // Track successful payment
    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Payment succeeded',
      level: 'info',
      data: {
        userId: user.id,
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
      },
    })
    
    // Could update user's payment history or subscription status here
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.authProviderId, customerId))
    .limit(1)
  
  if (user) {
    // Track failed payment
    Sentry.addBreadcrumb({
      category: 'billing',
      message: 'Payment failed',
      level: 'error',
      data: {
        userId: user.id,
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        currency: invoice.currency,
        attemptCount: invoice.attempt_count,
      },
    })
    
    // Could notify user or update subscription status here
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  
  if (customerId) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.authProviderId, customerId))
      .limit(1)
    
    if (user) {
      // Track checkout completion
      Sentry.addBreadcrumb({
        category: 'billing',
        message: 'Checkout completed',
        level: 'info',
        data: {
          userId: user.id,
          sessionId: session.id,
          mode: session.mode,
          status: session.status,
        },
      })
      
      // Could update user's subscription or purchase status here
    }
  }
}

async function logWebhookEvent(event: Stripe.Event) {
  try {
    // Find user if customer ID is available
    let userId: string | undefined
    
    if (event.data.object && typeof event.data.object === 'object') {
      const obj = event.data.object as any
      const customerId = obj.customer
      
      if (customerId) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.authProviderId, customerId))
          .limit(1)
        
        if (user) {
          userId = user.id
        }
      }
    }
    
    // Log webhook event to audit trail
    await db.insert(auditEvents).values({
      userId: userId || null,
      eventType: 'webhook',
      eventAction: event.type,
      resourceType: 'stripe_event',
      resourceId: event.id,
      eventData: {
        stripeEventId: event.id,
        stripeEventType: event.type,
        created: event.created,
        livemode: event.livemode,
      },
    })
  } catch (error) {
    // Don't throw - webhook should still succeed even if audit logging fails
    Sentry.captureException(error, {
      tags: {
        operation: 'webhook_audit_logging',
        webhook: 'stripe',
      },
    })
  }
}