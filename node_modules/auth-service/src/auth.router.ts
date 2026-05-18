import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router()
const controller = new AuthControllers()

router.post('/admin/register', controller.createAdminController)
router.post('/admin/login',controller.loginController)


export default router