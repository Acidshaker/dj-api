import { stripe } from '../config/stripe';

export const generateOnboardingLink = async (accountId: string) => {
  return await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.FRONTEND_URL}/me?status=refresh`,
    return_url: `${process.env.FRONTEND_URL}/me?status=success`,
    type: 'account_onboarding',
  });
};
