import { Router } from "express";
import { AuthControllers } from "./auth.controller";

const router = Router()
const controller = new AuthControllers()

router.post('/create-admin', controller.createAdminController)



export default router