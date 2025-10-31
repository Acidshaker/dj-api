import express from 'express';
import http from 'http';
import expressLayouts from 'express-ejs-layouts';
import dotenv from 'dotenv';
import routes from './routes/index';
import cors from 'cors';
import { corsOptions } from './config/cors';
import sequelize from './config/sequelize';
import { errorResponse } from './utils/response';
import { configs } from './config';
import { swaggerUiHandler, swaggerUiSetup } from './config/swagger';
import path from 'path';
import { getSystemStatus } from './middlewares/status';
import { adminRouter, adminPath } from './admin/panel';
import './models';
import { startSubscriptionChecker } from './cron/subscriptionChecker';
import { startEventExpirationJob } from './cron/eventChecker';
import { stripeWebhook } from './webhooks/stripeWebhook';
import chalk from 'chalk';
import { WebSocketServer } from 'ws';
import type { WebSocket } from 'ws';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors(corsOptions));

// 🔌 WebSocket server
const wss = new WebSocketServer({ server });

// 🧠 Guardar clientes conectados
const connectedClients: Set<WebSocket> = new Set();

wss.on('connection', (ws: WebSocket) => {
  console.log('🔗 Cliente conectado vía WebSocket');
  connectedClients.add(ws);
  console.log(`🧠 Total clientes conectados: ${connectedClients.size}`);

  ws.on('message', (message: string) => {
    console.log('📩 Mensaje recibido del cliente:', message);
  });

  ws.on('close', () => {
    console.log('❌ Cliente desconectado');
    connectedClients.delete(ws);
    console.log(`🧠 Total clientes conectados: ${connectedClients.size}`);
  });
});

// Exportar función para emitir actualizaciones
export const broadcastEventMusic = (data: any) => {
  const payload = JSON.stringify({ type: 'eventMusicUpdate', data });
  connectedClients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(payload);
    }
  });
};

// ✅ Webhook stripe
app.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json());

sequelize
  .authenticate()
  .then(() => console.log('Conectado a la base de datos'))
  .catch((error) => console.log(error));

sequelize
  .sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => console.log('Base de datos sincronizada'))
  .catch((error) => console.log(error));

// Cron jobs
// startSubscriptionChecker();
startEventExpirationJob();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// app.get("/", (_, res) => {
//   res.render("home", {
//     title: "Bienvenido",
//     endpoints: {
//       login: "/api/v1/auth/login",
//       users: "/api/v1/users",
//       docs: "/docs",
//       admin: adminPath,
//     },
//   });
// });

app.get('/', async (_, res) => {
  const status = await getSystemStatus();
  res.render('dashboard', {
    title: 'Dashboard del sistema',
    ...status,
  });
});

// Documentación Swagger
app.use('/docs', swaggerUiHandler, swaggerUiSetup);

// Panel AdminJS
app.use(adminPath, adminRouter);

app.use('/api/v1', routes);
app.use((_, res) => {
  errorResponse({
    res,
    status: 404,
    message: `URL no encontrada`,
  });
});

server.listen(configs.api.port, () => {
  console.log(chalk.greenBright(`🚀 Servidor corriendo en el puerto: ${configs.api.port}`));
});
