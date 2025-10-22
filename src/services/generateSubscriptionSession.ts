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
  if (!plan || plan.price <= 0) {
    throw new Error('Plan inválido o gratuito');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'mxn',
          product_data: {
            name: `Suscripción: Plan ${plan.name}`,
            description: plan.description
              ? plan.description
              : plan?.events
                ? `${plan.events} eventos sin fecha de caducidad`
                : `Eventos ilimitados durante ${plan.days} dias`,
          },
          unit_amount: Math.round(plan.price * 100),
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/subscriptions?status=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/subscriptions?status=cancel`,
    metadata: {
      userId,
      planId: plan.id,
    },
  });

  return session.url;
};
