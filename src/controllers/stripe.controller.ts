import { stripe } from '../config/stripe';
import { User } from '../models/User';
import type { Request, Response } from 'express';
import { errorResponse, successResponse } from '../utils/response';
import { verifyStripeAccount } from '../services/verifyStripeAccount';
import { generateOnboardingLink } from '../services/generateOnboardingLink';

export const createStripeAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (user.stripeAccountId) {
      const accountLink = await generateOnboardingLink(user.stripeAccountId);
      return successResponse({
        res,
        message: 'Ya tienes cuenta Stripe, redirigiendo al onboarding',
        data: { url: accountLink.url },
      });
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'MX',
      email: user.email,
      capabilities: {
        transfers: { requested: true },
      },
    });

    user.stripeAccountId = account.id;
    user.isStripeVerified = false;
    await user.save();

    const accountLink = await generateOnboardingLink(account.id);
    return successResponse({
      res,
      message: 'Cuenta Stripe creada, redirigiendo al onboarding',
      data: { url: accountLink.url },
    });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al crear cuenta Stripe', error });
  }
};

export const generateStripeOnboardingLink = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user.stripeAccountId) {
      return errorResponse({ res, status: 400, message: 'No tienes cuenta Stripe aún' });
    }

    const accountLink = await generateOnboardingLink(user.stripeAccountId);
    return successResponse({
      res,
      message: 'Redirige al onboarding',
      data: { url: accountLink.url },
    });
  } catch (error) {
    return errorResponse({
      res,
      status: 500,
      message: 'Error al generar enlace de onboarding',
      error,
    });
  }
};

export const updateStripeVerificationStatus = async (req: Request, res: Response) => {
  try {
    const user = req.user;

    if (!user.stripeAccountId) {
      return errorResponse({ res, status: 400, message: 'Usuario sin cuenta Stripe' });
    }

    const { isReady } = await verifyStripeAccount(user.stripeAccountId);

    user.isStripeVerified = isReady;
    await user.save();

    return successResponse({
      res,
      message: 'Estado de Stripe actualizado',
      data: { isStripeVerified: isReady },
    });
  } catch (error) {
    return errorResponse({ res, status: 500, message: 'Error al verificar cuenta Stripe', error });
  }
};
