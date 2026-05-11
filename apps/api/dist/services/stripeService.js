"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStripe = getStripe;
const stripe_1 = __importDefault(require("stripe"));
const env_1 = require("../config/env");
let stripe = null;
function getStripe() {
    if (!env_1.env.stripeSecretKey)
        return null;
    stripe ??= new stripe_1.default(env_1.env.stripeSecretKey);
    return stripe;
}
