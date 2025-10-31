import { Plan } from '../models/Plan';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';

export const checkSubscription = async (user: User) => {
  const subscription = await Subscription.findOne({ where: { userId: user.id } });
  if (!subscription) {
    return false;
  }
  const plan = await Plan.findByPk(subscription.planId);
  if (!plan) {
    return false;
  }

  if (subscription.status !== 'active' && plan.is_demo) {
    return true;
  }
  return true;
};
