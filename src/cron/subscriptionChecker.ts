import cron from 'node-cron';
import { Op } from 'sequelize';
import { Subscription } from '../models/Subscription';
import { User } from '../models/User';

export const startSubscriptionChecker = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ Ejecutando verificación de suscripciones...');

    const expiredSubs = await Subscription.findAll({
      where: {
        end_date: { [Op.lt]: new Date() },
        status: 'active',
      },
    });

    for (const sub of expiredSubs) {
      sub.status = 'expired';
      await sub.save();

      const user = await User.findByPk(sub.userId);
      if (user) {
        user.subscription_status = 'expired';
        user.is_active = false; // opcional: desactivar acceso
        await user.save();
      }
    }

    console.log(`✅ Suscripciones caducadas actualizadas: ${expiredSubs.length}`);
  });
};
