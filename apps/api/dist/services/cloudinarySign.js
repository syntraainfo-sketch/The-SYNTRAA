"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCloudinary = configureCloudinary;
exports.signUploadParams = signUploadParams;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
function configureCloudinary() {
    if (!env_1.env.cloudinary.cloudName || !env_1.env.cloudinary.apiKey || !env_1.env.cloudinary.apiSecret)
        return;
    cloudinary_1.v2.config({
        cloud_name: env_1.env.cloudinary.cloudName,
        api_key: env_1.env.cloudinary.apiKey,
        api_secret: env_1.env.cloudinary.apiSecret,
    });
}
function signUploadParams(opts) {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = String(opts?.folder ?? env_1.env.cloudinary.folder);
    const toSign = { timestamp, folder };
    const signature = cloudinary_1.v2.utils.api_sign_request(toSign, env_1.env.cloudinary.apiSecret);
    return { signature, timestamp, folder, apiKey: env_1.env.cloudinary.apiKey };
}
