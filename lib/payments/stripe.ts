import Stripe from 'stripe';
import { redirect } from 'next/navigation';
import { getUser, updateUserSubscriptionByCustomerId } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});


export async function createCheckoutSession({ priceId }: { priceId: string }) {
  const user = await getUser();

  if (!user) {
    redirect(`/sign-up?redirect=checkout&priceId=${priceId}`);
  }

  // 🆕 Verifica si ya tiene stripeCustomerId
  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
    });

    // 🆕 Guarda el ID en la base de datos
await db.update(users).set({
  stripeCustomerId: customer.id,
}).where(eq(users.id, user.id));

    customerId = customer.id;
  }

  // ✅ Usa el ID correcto para la suscripción
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/pricing`,
    customer: customerId,
    client_reference_id: user.id.toString(),
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });

  redirect(session.url!);
}


export async function createCustomerPortalSession(user: {
   stripeCustomerId: string | null;
  stripeProductId: string | null;
}) {
  if (!user?.stripeCustomerId || !user.stripeProductId) {
    redirect('/pricing');
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    const product = await stripe.products.retrieve(user.stripeProductId);
    if (!product.active) {
      throw new Error("Product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    if (prices.data.length === 0) {
      throw new Error("No active prices found for the user's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: 'Gestiona tu suscripción',
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'quantity', 'promotion_code'],
          proration_behavior: 'create_prorations',
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: 'at_period_end',
          cancellation_reason: {
            enabled: true,
            options: [
              'too_expensive',
              'missing_features',
              'switched_service',
              'unused',
              'other',
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.BASE_URL}/dashboard`,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {

  const customerId = subscription.customer as string;
  const status = subscription.status;

  const plan = subscription.items.data[0]?.plan;

  const productId =
    typeof plan?.product === 'string'
      ? plan.product
      : plan?.product?.id ?? null;

  let planName = null;

  if (productId) {
    const product = await stripe.products.retrieve(productId);
    planName = product.name;
  }

  await updateUserSubscriptionByCustomerId(customerId, {
    stripeSubscriptionId: subscription.id,
    stripeProductId: productId,
    planName,
    subscriptionStatus: status,
  });
}




export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ['data.product'],
    active: true,
    type: 'recurring'
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === 'string' ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval: price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ['data.default_price']
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === 'string'
        ? product.default_price
        : product.default_price?.id
  }));
}