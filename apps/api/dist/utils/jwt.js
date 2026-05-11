"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccessToken = signAccessToken;
exports.signRefreshToken = signRefreshToken;
exports.verifyAccess = verifyAccess;
exports.verifyRefresh = verifyRefresh;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signAccessToken(payload) {
    const options = {
        expiresIn: env_1.env.jwtAccessExpires,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtAccessSecret, options);
}
function signRefreshToken(payload) {
    const options = {
        expiresIn: env_1.env.jwtRefreshExpires,
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.jwtRefreshSecret, options);
}
function verifyAccess(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
}
function verifyRefresh(token) {
    return jsonwebtoken_1.default.verify(token, env_1.env.jwtRefreshSecret);
}
