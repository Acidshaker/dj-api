import { stripe } from '../config/stripe';
import { Plan } from '../models/Plan';

export const generateSubscriptionSession = async ({
  userId,
  planId,
}: {
  userId: string;
  planId: number;
}) => {
  const plan = await Plan.findByPk(planId);
  if (!plan || !plan.stripePriceId) {
    throw new Error('Plan inválido o no vinculado con Stripe');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.stripePriceId, // ✅ Usamos el ID del precio recurrente
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.FRONTEND_URL}/subscriptions?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscriptions?status=cancel`,
    metadata: {
      userId,
      planId: plan.id,
    },
  });

  return session.url;
};
