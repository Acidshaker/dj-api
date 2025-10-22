import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import userRoutes from './user.routes';
import companyDataRoutes from './companyData.routes';
import planRoutes from './plan.routes';
import subscriptionRoutes from './subscription.routes';
import stripeRoutes from './stripe.routes';
import packageRoutes from './package.routes';
import groupRoutes from './group.routes';

const routes = Router();
routes.use('/auth', authRoutes);
routes.use('/users', userRoutes);
routes.use('/company-data', companyDataRoutes);
routes.use('/packages', packageRoutes);
routes.use('/groups', groupRoutes);
routes.use('/events', eventRoutes);
routes.use('/stripe', stripeRoutes);
routes.use('/plans', planRoutes);
routes.use('/subscriptions', subscriptionRoutes);

export default routes;
