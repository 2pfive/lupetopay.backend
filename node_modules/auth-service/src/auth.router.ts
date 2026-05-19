import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router()
const controller = new AuthControllers()

// routes adminstrateurs 
router.post('/admin/register', controller.createAdminController)
router.post('/admin/login',controller.loginController)
router.post('/admin/refresh',controller.refreshTokenController)
router.post("/admin/refresh-access",controller.refreshAccessTokenController)
router.patch("/admin/status",controller.updateAdminStatusController)

// routes client API
router.post("/client/register", controller.createClientController)
router.post("/client/login",controller.loginClientController)
router.patch("/client/status",controller.updateClientStatusController)

export default router