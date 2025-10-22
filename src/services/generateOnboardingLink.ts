import { stripe } from '../config/stripe';

export const generateOnboardingLink = async (accountId: string) => {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/stripe/onboarding/refresh`,
    return_url: `${process.env.FRONTEND_URL}/stripe/onboarding/success`,
    type: 'account_onboarding',
  });
};
