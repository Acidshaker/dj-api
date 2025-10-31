import { stripe } from '../config/stripe';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { Subscription as LocalSubscription } from '../models/Subscription';
import { Music } from '../models/Music';
import { Mention } from '../models/Mention';
import { EventMusic } from '../models/EventMusic';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { broadcastEventMusic } from '../app';
import { sendSubscriptionCancellationEmail } from '../services/sendSubscriptionCancellationEmail';
import { sendSubscriptionConfirmationEmail } from '../services/sendSubscriptionConfirmationEmail';
import { sendSubscriptionRenewalEmail } from '../services/sendSubscriptionRenewalEmail';

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

export const stripeWebhook = async (req: Request, res: Response) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  const sig = req.headers['stripe-signature'];

  if (!sig || typeof sig !== 'string') {
    return res.status(400).send('Falta la firma de Stripe');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log(`✅ Webhook recibido: ${event.type}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error(`❌ Webhook Error: ${message}`);
    return res.status(400).send(`Webhook Error: ${message}`);
  }

  // ✅ Verificación de cuenta Stripe Connect
  if (event.type === 'account.updated') {
    const account = event.data.object as Stripe.Account;
    const user = await User.findOne({ where: { stripeAccountId: account.id } });

    if (user) {
      const isReady =
        account.details_submitted === true &&
        account.payouts_enabled === true &&
        account.capabilities?.transfers === 'active';

      user.isStripeVerified = isReady;
      await user.save();
      console.log(`🔄 Estado de verificación actualizado para usuario ${user.id}`);
    }
  }

  // ✅ Sesión de pago completada (suscripción o solicitud musical)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const planId = Number(session.metadata?.planId);
    const stripeSubscriptionId = session.subscription as string;

    // 🔁 Suscripción Stripe
    if (userId && planId && stripeSubscriptionId) {
      const plan = await Plan.findByPk(planId);
      const user = await User.findByPk(userId);
      const stripeSubscription = (await stripe.subscriptions.retrieve(
        stripeSubscriptionId
      )) as Stripe.Subscription;
      const firstItem = stripeSubscription.items?.data?.[0];
      const renewalDate = firstItem?.current_period_end
        ? new Date(firstItem.current_period_end * 1000)
        : null;
      const subscription = await LocalSubscription.findOne({ where: { userId } });

      const subscriptionData = {
        userId,
        planId,
        status: 'active',
        start_date: new Date(),
        end_date: null,
        renewal_date: renewalDate,
        events_remaining: null,
        stripeSubscriptionId,
      };

      if (subscription) {
        await subscription.update(subscriptionData);
        user?.update({ subscription_status: 'active', subscription_end: null });
      } else {
        await LocalSubscription.create(subscriptionData);
        user?.update({ subscription_status: 'active', subscription_end: null });
      }

      if (user && plan) {
        await sendSubscriptionConfirmationEmail(user, plan);
      }

      console.log(`🟢 Suscripción Stripe creada para usuario ${userId}`);
    }

    // 🎶 Solicitud musical
    const eventId = session.metadata?.eventId;
    const applicant = session.metadata?.applicant;
    const type = session.metadata?.type;
    const description = session.metadata?.description;
    const name = session.metadata?.name;
    const spotify_url = session.metadata?.spotify_url;
    const author = session.metadata?.author;
    const album_logo = session.metadata?.album_logo;
    const duration = session.metadata?.duration;

    if (eventId && applicant && type && session.payment_status === 'paid') {
      if (!['mention', 'song'].includes(type)) {
        console.warn(`⚠️ Tipo de solicitud musical inválido: ${type}`);
        return res.status(200).send('Tipo inválido ignorado');
      }

      try {
        const last = await EventMusic.findOne({
          where: { eventId },
          order: [['application_number', 'DESC']],
        });
        const application_number = last ? last.application_number + 1 : 1;

        const eventMusic = await EventMusic.create({
          applicant,
          type,
          description,
          tip: session.amount_total ? session.amount_total / 100 : null,
          application_date: new Date(),
          application_number,
          eventId,
          is_paid: true,
          is_played: false,
          stripeSessionId: session.id,
          payment_method: 'stripe',
        });

        if (type === 'mention') {
          await Mention.create({
            text: description || '',
            eventMusicId: eventMusic.id,
          });
        }

        if (type === 'song') {
          await Music.create({
            name: name || 'Canción sin nombre',
            author: author || 'Desconocido',
            album_logo: album_logo || '',
            duration: duration || '00:00',
            spotify_url: spotify_url || '',
            eventMusicId: eventMusic.id,
          });
        }

        broadcastEventMusic({
          id: eventMusic.id,
          applicant: eventMusic.applicant,
          type: eventMusic.type,
          tip: eventMusic.tip,
          application_number: eventMusic.application_number,
          eventId: eventMusic.eventId,
          url: `${frontendUrl}/events/${eventMusic.eventId}`,
        });

        console.log(`🎶 Solicitud musical procesada: ${type} para evento ${eventId}`);
      } catch (err) {
        console.error(`❌ Error al registrar solicitud musical desde webhook:`, err);
      }
    }
  }

  // 🔄 Renovación de suscripción automática
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
    const stripeSubscriptionId = invoice.subscription ?? null;

    const subscription = await LocalSubscription.findOne({ where: { stripeSubscriptionId } });
    if (subscription) {
      subscription.status = 'active';
      if (invoice.next_payment_attempt) {
        subscription.renewal_date = new Date(invoice.next_payment_attempt * 1000);
      }
      await subscription.save();

      const user = await User.findByPk(subscription.userId);
      if (user) {
        await user.update({
          subscription_status: 'active',
          subscription_end: null,
        });
      }

      const plan = await Plan.findByPk(subscription.planId);
      if (user && plan) {
        await sendSubscriptionRenewalEmail(user, plan);
      }

      console.log(`🔁 Suscripción renovada: ${stripeSubscriptionId}`);
    }
  }

  // ❌ Cancelación de suscripción
  if (event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object as Stripe.Subscription;

    const subscription = await LocalSubscription.findOne({
      where: { stripeSubscriptionId: stripeSub.id },
    });
    if (subscription) {
      await subscription.update({
        status: 'cancelled',
        renewal_date: null,
      });

      const user = await User.findByPk(subscription.userId);
      if (user) {
        await user.update({
          subscription_status: 'cancelled',
          subscription_end: null,
          events_remaining: null,
        });

        await sendSubscriptionCancellationEmail(user);
      }

      console.log(`🛑 Suscripción cancelada: ${stripeSub.id}`);
    }
  }

  res.status(200).send('Webhook recibido');
};
