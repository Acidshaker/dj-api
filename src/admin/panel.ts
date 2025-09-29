import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import { Database, Resource } from '@adminjs/sequelize';
import sequelize from '../config/sequelize.js';
import { User } from '../models/User.js';

AdminJS.registerAdapter({ Database, Resource });

const admin = new AdminJS({
  databases: [sequelize],
  rootPath: '/admin',
  resources: [{ resource: User }],
});

export const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
  authenticate: async (email, password) => {
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      return { email };
    }
    return null;
  },
  cookieName: 'adminjs',
  cookiePassword: process.env.COOKIE_SECRET || 'supersecret',
});

export const adminPath = admin.options.rootPath;
