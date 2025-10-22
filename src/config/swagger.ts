import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'Documentación interactiva de la API',
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Servidor local de desarrollo',
      },
    ],
    tags: [
      {
        name: 'Autenticación',
        description: 'Endpoints relacionados con login, registro y recuperación de contraseña',
      },
      {
        name: 'Usuarios',
        description: 'Operaciones CRUD y gestión de usuarios',
      },
      {
        name: 'Suscripciones',
        description: 'Gestión de planes y estado de suscripción',
      },
      {
        name: 'Stripe',
        description: 'Integración con Stripe Connect Express para pagos y onboarding',
      },
      {
        name: 'Eventos',
        description: 'Operaciones CRUD y gestión de eventos',
      },
      {
        name: 'EventMusics',
        description: 'Operaciones CRUD y gestión de solicitudes musicales',
      },
      {
        name: 'ListEventMusics',
        description: 'Operaciones CRUD y gestión de listas de solicitudes musicales',
      },
      {
        name: 'EventPackages',
        description: 'Operaciones CRUD y gestión de paquetes de eventos',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        UpdateUserNameInput: {
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: { type: 'string' },
            last_name: { type: 'string' },
          },
        },
        CreateCompanyDataInput: {
          type: 'object',
          required: ['company_name', 'company_phone', 'company_email', 'logo'],
          properties: {
            company_name: { type: 'string' },
            company_phone: { type: 'string' },
            company_email: { type: 'string', format: 'email' },
            logo: { type: 'string', format: 'binary' },
          },
        },

        UpdateCompanyDataInput: {
          type: 'object',
          properties: {
            company_name: { type: 'string' },
            company_phone: { type: 'string' },
            company_email: { type: 'string', format: 'email' },
            replace_logo: { type: 'boolean' },
            logo: { type: 'string', format: 'binary' },
          },
        },
        CreateEventInput: {
          type: 'object',
          required: ['date', 'packages'],
          properties: {
            date: { type: 'string', format: 'date-time' },
            name: { type: 'string' },
            companyDataId: { type: 'string', format: 'uuid' },
            packages: {
              type: 'array',
              minItems: 1,
              maxItems: 4,
              items: {
                type: 'object',
                required: ['name', 'max_songs_per_user', 'tip'],
                properties: {
                  name: { type: 'string' },
                  max_songs_per_user: { type: 'integer', minimum: 1 },
                  type: {
                    type: 'string',
                    enum: ['song', 'mention', 'both'],
                    description: 'Tipo de solicitud permitida en el paquete',
                  },
                  tip: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },

        UpdateEventInput: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date-time' },
            name: { type: 'string' },
            companyDataId: { type: 'string', format: 'uuid' },
            packages: {
              type: 'array',
              minItems: 1,
              maxItems: 4,
              items: {
                type: 'object',
                required: ['name', 'max_songs_per_user', 'tip'],
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  max_songs_per_user: { type: 'integer', minimum: 1 },
                  type: {
                    type: 'string',
                    enum: ['song', 'mention', 'both'],
                    description: 'Tipo de solicitud permitida en el paquete',
                  },
                  tip: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },
        StripeOnboardingLinkResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  format: 'uri',
                  description: 'Enlace de onboarding generado por Stripe',
                },
              },
            },
          },
        },

        StripeVerificationResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                isStripeVerified: {
                  type: 'boolean',
                  description: 'Indica si el usuario puede recibir pagos',
                },
              },
            },
          },
        },
        PrepareEventMusicInput: {
          type: 'object',
          required: ['applicant', 'eventId', 'eventPackageId', 'type'],
          properties: {
            applicant: {
              type: 'string',
              example: 'Juan Pérez',
            },
            eventId: {
              type: 'string',
              format: 'uuid',
              example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
            },
            eventPackageId: {
              type: 'string',
              format: 'uuid',
              example: 'f1e2d3c4-b5a6-7890-abcd-0987654321fe',
            },
            type: {
              type: 'string',
              enum: ['song', 'mention', 'both'],
            },
            description: {
              type: 'string',
              example: 'Quiero dedicar esta canción a mi mamá',
            },
          },
        },
        CreateListEventMusicInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Lista para boda' },
          },
        },

        CreateEventPackageInput: {
          type: 'object',
          required: ['name', 'max_songs_per_user', 'type', 'tip', 'listEventMusicId'],
          properties: {
            name: { type: 'string', example: 'Canción personalizada' },
            max_songs_per_user: { type: 'integer', example: 2 },
            type: { type: 'string', enum: ['song', 'mention', 'both'] },
            tip: { type: 'number', example: 50 },
            listEventMusicId: {
              type: 'string',
              format: 'uuid',
              example: 'd3f2a1b4-5678-4c9e-9abc-1234567890ef',
            },
          },
        },
        // Aquí puedes agregar otros schemas como LoginInput, RegisterInput, etc.
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
export const swaggerUiHandler = swaggerUi.serve;
export const swaggerUiSetup = swaggerUi.setup(swaggerSpec);
