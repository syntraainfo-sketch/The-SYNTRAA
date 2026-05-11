"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AppError_1 = require("../utils/AppError");
function errorHandler(err, _req, res, _next) {
    const status = err instanceof AppError_1.AppError ? err.statusCode : err instanceof Error ? 400 : 500;
    const message = err instanceof Error ? err.message : "Unexpected error";
    const code = err instanceof AppError_1.AppError ? err.code : undefined;
    console.error("[api]", err);
    res.status(status).json({ error: { message, code } });
}
