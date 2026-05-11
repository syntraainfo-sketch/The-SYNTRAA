"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const AppError_1 = require("../utils/AppError");
const jwt_1 = require("../utils/jwt");
function requireAuth(req, _res, next) {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer ")) {
        throw new AppError_1.AppError(401, "Unauthorized");
    }
    const token = h.slice("Bearer ".length);
    req.user = (0, jwt_1.verifyAccess)(token);
    next();
}
function optionalAuth(req, _res, next) {
    const h = req.headers.authorization;
    if (h?.startsWith("Bearer ")) {
        try {
            req.user = (0, jwt_1.verifyAccess)(h.slice("Bearer ".length));
        }
        catch {
            /* ignore invalid token for optional flows */
        }
    }
    next();
}
