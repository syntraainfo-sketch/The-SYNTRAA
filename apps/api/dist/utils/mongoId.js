"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toObjectId = toObjectId;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("./AppError");
function toObjectId(id) {
    if (!mongoose_1.default.isValidObjectId(id)) {
        throw new AppError_1.AppError(400, "Invalid id");
    }
    return new mongoose_1.default.Types.ObjectId(id);
}
