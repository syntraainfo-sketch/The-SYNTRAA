"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const User_1 = require("../models/User");
async function main() {
    const email = process.env.SEED_ADMIN_EMAIL ?? "admin@thesyntraa.com";
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!password) {
        throw new Error("Set SEED_ADMIN_PASSWORD in env to seed admin");
    }
    await mongoose_1.default.connect(env_1.env.mongodbUri);
    const passwordHash = await bcryptjs_1.default.hash(password, 12);
    await User_1.User.findOneAndUpdate({ email }, {
        $setOnInsert: {
            email,
        },
        $set: { passwordHash, role: "superAdmin", name: "SYNTRAA Admin" },
    }, { upsert: true, new: true });
    console.info(`Upserted superAdmin: ${email}`);
    await mongoose_1.default.disconnect();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
