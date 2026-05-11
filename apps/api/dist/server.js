"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createApp_1 = require("./createApp");
const database_1 = require("./config/database");
const env_1 = require("./config/env");
const cloudinarySign_1 = require("./services/cloudinarySign");
async function bootstrap() {
    await (0, database_1.connectDatabase)();
    (0, cloudinarySign_1.configureCloudinary)();
    const app = (0, createApp_1.createApp)();
    app.listen(env_1.env.port, () => {
        console.info(`SYNTRAA API listening on :${env_1.env.port}`);
    });
}
bootstrap().catch((err) => {
    console.error("Fatal bootstrap error:", err);
    process.exit(1);
});
