"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmsPublicRouter = void 0;
const express_1 = require("express");
const CMSPage_1 = require("../../models/CMSPage");
const Settings_1 = require("../../models/Settings");
const asyncHandler_1 = require("../../middleware/asyncHandler");
exports.cmsPublicRouter = (0, express_1.Router)();
exports.cmsPublicRouter.get("/cms/pages/:slug", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = await CMSPage_1.CMSPage.findOne({ slug: req.params.slug });
    if (!page)
        return res.status(404).json({ error: { message: "Not found" } });
    res.json({ data: page });
}));
exports.cmsPublicRouter.get("/cms/home", (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const s = await Settings_1.Settings.findById("global");
    res.json({ data: { sections: s?.homeSections ?? [] } });
}));
