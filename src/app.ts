import express from "express";
import expressLayouts from 'express-ejs-layouts';
import dotenv from "dotenv";
import routes from "./routes/index";
import cors from "cors";
import { corsOptions } from "./config/cors";
import sequelize from "./config/sequelize";
import { errorResponse } from "./utlis/response";
import { configs } from "./config";
import { swaggerUiHandler, swaggerUiSetup } from "./config/swagger";
import path from "path";
import { getSystemStatus } from "./middlewares/status";



dotenv.config();

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

sequelize.authenticate()
.then(() => console.log("Conectado a la base de datos"))
.catch((error) => console.log(error));

sequelize.sync()
.then(() => console.log("Base de datos sincronizada"))
.catch((error) => console.log(error));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set('layout', 'layouts/main');


// app.get("/", (_, res) => {
//   res.render("home", {
//     endpoints: {
//       login: "/api/v1/auth/login",
//       users: "/api/v1/users",
//       docs: "/docs",
//       admin: adminPath,
//     },
//   });
// });

app.get("/dashboard", async (_, res) => {
  const status = await getSystemStatus();
  res.render("dashboard", {
    title: "Dashboard del sistema",
    ...status,
  });
});



// Documentación Swagger
app.use('/docs', swaggerUiHandler, swaggerUiSetup);

// Panel AdminJS
// app.use(adminPath, adminRouter);


app.use("/api/v1", routes);
app.use((_, res) => {
  errorResponse({
    res,
    status: 404,
    message: `URL no encontrada`,
  });
});

app.listen(configs.api.port, () => {
  console.log(`Servidor corriendo en el puerto: ${configs.api.port}`);
});
