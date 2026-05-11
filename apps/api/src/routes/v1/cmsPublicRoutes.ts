import { Router } from "express";
import { CMSPage } from "../../models/CMSPage";
import { Settings } from "../../models/Settings";
import { asyncHandler } from "../../middleware/asyncHandler";

export const cmsPublicRouter = Router();

cmsPublicRouter.get(
  "/cms/pages/:slug",
  asyncHandler(async (req, res) => {
    const page = await CMSPage.findOne({ slug: req.params.slug });
    if (!page) return res.status(404).json({ error: { message: "Not found" } });
    res.json({ data: page });
  })
);

cmsPublicRouter.get(
  "/cms/home",
  asyncHandler(async (_req, res) => {
    const s = await Settings.findById("global");
    res.json({ data: { sections: s?.homeSections ?? [] } });
  })
);
