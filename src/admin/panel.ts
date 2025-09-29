import session from 'express-session';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import sequelize from '../config/sequelize';
import { User } from '../models/User';
import { es } from './es';

AdminJS.registerAdapter({
  Database: AdminJSSequelize.Database,
  Resource: AdminJSSequelize.Resource,
});

const admin = new AdminJS({
  databases: [sequelize],
  rootPath: '/admin',
  locale: es,
  resources: [{ resource: User }],
});

// Configura sesión manualmente
const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: true,
});

const adminRouter = AdminJSExpress.buildRouter(admin);

// Aplica sesión y autenticación manual
adminRouter.use(sessionMiddleware);
adminRouter.use((req, res, next) => {
  const { email, password } = req.body || {};
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    req.session.adminUser = { email };
  }
  next();
});

export const adminPath = admin.options.rootPath;
export { adminRouter };
