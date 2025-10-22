import type { Request, Response } from 'express';
import { Plan } from '../models/Plan';
import { Subscription } from '../models/Subscription';
import { errorResponse, successResponse } from '../utils/response';
import { generateSubscriptionSession } from '../services/generateSubscriptionSession';
import { stripe } from '../config/stripe';
import { User } from '../models/User';

export const getMySubscription = async (req: Request, res: Response) => {
  const id = req.user.id;
  try {
    const subscription = await Subscription.findOne({
      where: { userId: id },
      include: [
        {
          model: Plan,
          as: 'plan',
        },
      ],
    });
    return successResponse({
      res,
      message: 'Suscripcion obtenida correctamente',
      data: subscription,
    });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al obtener la suscripcion', error });
  }
};

export const startSubscriptionPayment = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { planId } = req.body;
  try {
    const subscription = await Subscription.findOne({ where: { userId } });
    if (subscription && subscription.status === 'active' && subscription.planId === planId) {
      return errorResponse({
        res,
        status: 400,
        message: 'Ya tienes una suscripción activa con el mismo plan',
      });
    }
    const plan = await Plan.findByPk(planId);
    if (plan && plan?.price <= 0) {
      const user = await User.findByPk(userId);
      user?.update({ is_demo: true });
      await subscribe(req, res);
    } else {
      const url = await generateSubscriptionSession({ userId, planId });
      return successResponse({ res, message: 'Sesión de pago iniciada', data: { url } });
    }
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al iniciar pago', error });
  }
};

export const verifyStripeSession = async (req: Request, res: Response) => {
  const { session_id } = req.query;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id as string);
    console.log(session);
    const isPaid = session.payment_status === 'paid';
    console.log(isPaid);
    return successResponse({ res, message: 'Estado verificado', data: { isPaid } });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al verificar sesión', error });
  }
};

export const subscribe = async (req: Request, res: Response) => {
  const id = req.user.id;
  const { planId } = req.body;
  try {
    const plan = await Plan.findByPk(planId);
    const user = await User.findByPk(id);
    const oldSubscription = await Subscription.findOne({ where: { userId: id } });
    const currentDate = new Date();
    const addDays = (days: number) => {
      const date = new Date(currentDate);
      date.setDate(date.getDate() + days);
      return date;
    };
    if (oldSubscription) {
      if (oldSubscription?.status === 'active') {
        if (oldSubscription.planId === planId) {
          return errorResponse({ res, status: 400, message: 'Ya tienes esta suscripcion activa' });
        } else {
          await Subscription.update(
            {
              status: 'active',
              planId,
              start_date: currentDate,
              end_date: plan?.days ? addDays(plan.days) : null,
              renewal_date: plan?.days ? addDays(plan.days) : null,
              events_remaining: plan?.events ? plan.events : null,
            },
            { where: { userId: id } }
          );
        }
        return errorResponse({ res, status: 400, message: 'Ya tienes una suscripcion activa' });
      } else {
        await Subscription.update(
          {
            status: 'active',
            planId,
            start_date: currentDate,
            end_date: plan?.days ? addDays(plan.days) : null,
            renewal_date: plan?.days ? addDays(plan.days) : null,
            events_remaining: plan?.events ? plan.events : null,
          },
          { where: { userId: id } }
        );
      }
    } else {
      const subscription = await Subscription.create({
        userId: id,
        planId,
        status: 'active',
        start_date: currentDate,
        end_date: plan?.days ? addDays(plan.days) : null,
        renewal_date: plan?.days ? addDays(plan.days) : null,
        events_remaining: plan?.events ? plan.events : null,
      });
      user?.update({
        subscription_status: 'active',
        subscription_end: plan?.days ? addDays(plan.days) : null,
        events_remaining: plan?.events ? plan.events : null,
      });
      return successResponse({
        res,
        message: 'Suscripción activada correctamente',
        data: subscription,
      });
    }
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al crear la suscripcion', error });
  }
};

export const cancelSubscription = async (req: Request, res: Response) => {
  const id = req.user.id;
  try {
    await Subscription.update(
      { status: 'cancelled', renewal_date: null },
      { where: { userId: id } }
    );
    return successResponse({ res, message: 'Suscripcion cancelada correctamente' });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al cancelar la suscripcion', error });
  }
};
