import { createApp } from "./createApp";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";
import { configureCloudinary } from "./services/cloudinarySign";

async function bootstrap() {
  await connectDatabase();
  configureCloudinary();
  const app = createApp();
  app.listen(env.port, () => {
    console.info(`SYNTRAA API listening on :${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Fatal bootstrap error:", err);
  process.exit(1);
});
