import session from 'express-session';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import sequelize from '../config/sequelize';
import { User } from '../models/User';
import { Role } from '../models/Role';
import { Music } from '../models/Music';
import { Mention } from '../models/Mention';
import { Event } from '../models/Event';
import { EventMusic } from '../models/EventMusic';
import { CompanyData } from '../models/CompanyData';
import { EventPackage } from '../models/EventPackage';
import { Plan } from '../models/Plan';
import { Subscription } from '../models/Subscription';
import { es } from './es';
import { is } from 'zod/v4/locales';

AdminJS.registerAdapter({
  Database: AdminJSSequelize.Database,
  Resource: AdminJSSequelize.Resource,
});

const admin = new AdminJS({
  databases: [sequelize],
  rootPath: '/admin',
  locale: es,
  resources: [
    {
      resource: User,
      options: {
        listProperties: [
          'first_name',
          'last_name',
          'username',
          'roleId',
          'is_active',
          'is_superuser',
          'subscription_status',
        ],
        properties: {
          username: {
            isTitle: true,
          },
        },
      },
    },
    {
      resource: Role,
      options: {
        listProperties: ['id', 'name', 'updatedAt', 'createdAt'],
      },
    },
    { resource: Music },
    { resource: Mention },
    { resource: Event },
    { resource: EventMusic },
    { resource: CompanyData },
    { resource: Plan },
    { resource: Subscription },
    { resource: EventPackage },
  ],
});

// Configura sesión manualmente
const sessionMiddleware = session({
  secret: process.env.COOKIE_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: true,
});

const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return { email };
    }
    return null;
  },
  cookieName: 'adminjs',
  cookiePassword: process.env.COOKIE_SECRET || 'supersecret',
});

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
