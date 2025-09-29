import { Umzug, SequelizeStorage } from "umzug";
import sequelize from "../config/sequelize";

const migrator = new Umzug({
  migrations: {
    glob: "migrations/*.js",
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

(async () => {
  const pending = await migrator.pending();

  if (pending.length === 0) {
    console.log("✅ No hay migraciones pendientes");
    process.exit(0);
  }

  console.log(`🚀 Migraciones pendientes (${pending.length}):`);
  pending.forEach((m) => {
    console.log(`- ${m.name}`);
  });

  await migrator.up();

  console.log("✅ Migraciones aplicadas correctamente");
  process.exit(0);
})();
