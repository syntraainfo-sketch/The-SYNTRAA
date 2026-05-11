"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCartIds = resolveCartIds;
exports.cartQueryFilter = cartQueryFilter;
function resolveCartIds(req, guestToken) {
    const userId = req.user?.sub;
    if (!userId && !guestToken) {
        return {};
    }
    return userId ? { userId } : { guestToken };
}
function cartQueryFilter(ids) {
    if (ids.userId)
        return { userId: ids.userId };
    if (ids.guestToken)
        return { guestToken: ids.guestToken };
    return null;
}
