import { Router } from "express";
import { authRouter } from "./authRoutes";
import { catalogRouter } from "./catalogRoutes";
import { cartRouter } from "./cartRoutes";
import { checkoutRouter } from "./checkoutRoutes";
import { adminRouter } from "./adminRoutes";
import { cmsPublicRouter } from "./cmsPublicRoutes";
import { wishlistRouter } from "./wishlistRoutes";

export const v1Router = Router();

v1Router.use(authRouter);
v1Router.use(catalogRouter);
v1Router.use(cmsPublicRouter);
v1Router.use(cartRouter);
v1Router.use(wishlistRouter);
v1Router.use(checkoutRouter);
v1Router.use(adminRouter);
