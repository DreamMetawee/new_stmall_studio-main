import { Router } from "express"
import v1Routes from "./v1/v1"
import frontendRoutes from "./frontend"

const router = Router()

router.use("/v1", v1Routes)
router.use("/", frontendRoutes)

export default router
