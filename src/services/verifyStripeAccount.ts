import { stripe } from '../config/stripe';

export const verifyStripeAccount = async (stripeAccountId: string) => {
  const account = await stripe.accounts.retrieve(stripeAccountId);

  const isReady =
    account.details_submitted === true &&
    account.payouts_enabled === true &&
    account.capabilities?.transfers === 'active';

  return {
    isReady,
    account,
  };
};
