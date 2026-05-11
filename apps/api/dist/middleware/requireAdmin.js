"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = requireAdmin;
const AppError_1 = require("../utils/AppError");
function requireAdmin(req, _res, next) {
    if (!req.user)
        throw new AppError_1.AppError(401, "Unauthorized");
    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
        throw new AppError_1.AppError(403, "Forbidden");
    }
    next();
}
