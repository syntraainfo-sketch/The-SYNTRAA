"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderNumber = generateOrderNumber;
const crypto_1 = __importDefault(require("crypto"));
function generateOrderNumber() {
    const t = Date.now().toString(36).toUpperCase();
    const r = crypto_1.default.randomBytes(4).toString("hex").toUpperCase();
    return `SYN-${t}-${r}`;
}
