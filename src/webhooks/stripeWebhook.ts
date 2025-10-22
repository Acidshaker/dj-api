import { stripe } from '../config/stripe';
import { User } from '../models/User';
import { Plan } from '../models/Plan';
import { Subscription } from '../models/Subscription';
import { Music } from '../models/Music';
import { Mention } from '../models/Mention';
import { EventMusic } from '../models/EventMusic';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { broadcastEventMusic } from '../app';

const subscribe = async (userId: string, planId: number) => {
  const plan = await Plan.findByPk(planId);
  const oldSubscription = await Subscription.findOne({ where: { userId } });
  const currentDate = new Date();

  const addDays = (days: number) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    return date;
  };

  const subscriptionData = {
    status: 'active',
    planId,
    start_date: currentDate,
    end_date: plan?.days ? addDays(plan.days) : null,
    renewal_date: plan?.days ? addDays(plan.days) : null,
    events_remaining: plan?.events ?? null,
  };

  if (oldSubscription) {
    if (oldSubscription.planId === planId && oldSubscription.status === 'active') {
      console.log(`Suscripción ya activa para user ${userId} con plan ${planId}`);
      return;
    }
    await Subscription.update(subscriptionData, { where: { userId } });
    console.log(`Suscripción actualizada para user ${userId}`);
  } else {
    await Subscription.create({ userId, ...subscriptionData });
    console.log(`Suscripción creada para user ${userId}`);
  }
};

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

  // ✅ Pago exitoso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Suscripción
    const userId = session.metadata?.userId;
    const planId = Number(session.metadata?.planId);
    if (userId && planId && session.payment_status === 'paid') {
      await subscribe(userId, planId);
    }

    // Solicitud musical
    const eventId = session.metadata?.eventId;
    const applicant = session.metadata?.applicant;
    const type = session.metadata?.type;
    const description = session.metadata?.description;
    const name = session.metadata?.name;
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

        let mentionId: string | null = null;
        let musicId: string | null = null;

        // Crear mención
        if (type === 'mention') {
          const mention = await Mention.create({
            text: description || '',
            eventMusicId: '', // se actualiza después
          });
          mentionId = mention.id;
        }

        // Crear canción
        if (type === 'song') {
          const music = await Music.create({
            name: name || 'Canción sin nombre',
            author: author || 'Desconocido',
            album_logo: album_logo || '',
            duration: duration || '00:00',
            eventMusicId: '', // se actualiza después
          });
          musicId = music.id;
        }

        // Crear solicitud musical
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
        });

        // Actualizar relación inversa
        if (mentionId) {
          await Mention.update({ eventMusicId: eventMusic.id }, { where: { id: mentionId } });
        }
        if (musicId) {
          await Music.update({ eventMusicId: eventMusic.id }, { where: { id: musicId } });
        }

        broadcastEventMusic({
          id: eventMusic.id,
          applicant: eventMusic.applicant,
          type: eventMusic.type,
          tip: eventMusic.tip,
          application_number: eventMusic.application_number,
          eventId: eventMusic.eventId,
        });

        if (session.amount_total) {
          console.log(
            `🎶 Solicitud musical procesada: ${type} para evento ${eventId}, monto $${session.amount_total / 100}`
          );
        }
      } catch (err) {
        console.error(`❌ Error al registrar solicitud musical desde webhook:`, err);
      }
    }
  }

  res.status(200).send('Webhook recibido');
};
