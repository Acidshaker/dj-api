import { Locale } from 'adminjs';

export const es: Locale = {
  language: 'es',
  translations: {
    labels: {
      loginWelcome: 'Bienvenido al panel de administración',
      User: 'Usuarios',
    },
    messages: {
      loginWelcome: 'Inicia sesión para acceder al panel',
      successfullyBulkDeleted: 'Registros eliminados correctamente',
    },
    properties: {
      email: 'Correo electrónico',
      password: 'Contraseña',
    },
    resources: {
      User: {
        properties: {
          name: 'Nombre',
          email: 'Correo',
        },
      },
    },
  },
};
