"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const AppError_1 = require("./AppError");
function validateBody(schema, req) {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
        throw new AppError_1.AppError(422, JSON.stringify(parsed.error.flatten().fieldErrors) || "Validation failed", "VALIDATION_ERROR");
    }
    return parsed.data;
}
