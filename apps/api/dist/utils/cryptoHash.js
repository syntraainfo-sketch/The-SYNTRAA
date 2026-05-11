"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hmacSha256Hex = hmacSha256Hex;
const crypto_1 = __importDefault(require("crypto"));
/** Placeholder hashing for PSP callbacks — swap for official JazzCash/Easypaisa algorithm per merchant docs */
function hmacSha256Hex(secret, payload) {
    return crypto_1.default.createHmac("sha256", secret).update(payload).digest("hex");
}
