import { Router } from "express"
import mainCategory from "./mainCategory"
import subCategory from "./subCategory"
import productType from "./productType"

const router = Router()

router.use("/main-category", mainCategory)
router.use("/sub-category", subCategory)
router.use("/product-type", productType)

export default router
