import cron from 'node-cron';
import { Op } from 'sequelize';
import { Event } from '../models/Event';

export const startEventExpirationJob = () => {
  // Ejecutar cada hora
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Verificando eventos activos que exceden 24 horas...');

    const now = new Date();
    const cutoff = new Date(now.getTime() - 12 * 60 * 60 * 1000); // hace 24 horas

    const expiredEvents = await Event.findAll({
      where: {
        status: 'active',
        started_at: { [Op.lt]: cutoff },
        is_active: true,
      },
    });

    for (const event of expiredEvents) {
      event.status = 'finished';
      event.finished_at = now;
      event.is_active = true;
      await event.save();
    }

    console.log(`✅ Eventos finalizados automáticamente: ${expiredEvents.length}`);
  });
};
