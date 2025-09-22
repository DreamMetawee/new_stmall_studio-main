import { Router } from "express"
import aboutUs from "./about-us"
import services from "./services"
import serviceItem from "./service-item"
import coBusiness from "./co-business"
import saleTeam from "./sale-team"
import contact from "./contact"
import ourStore from "./ourstore"
import FAQ from "./faq"

const router = Router()

router.use("/about-us", aboutUs)
router.use("/services", services)
router.use("/service-item", serviceItem)
router.use("/co-business", coBusiness)
router.use("/sale-team", saleTeam)
router.use("/contact", contact)
router.use("/our-store", ourStore)
router.use("/faq",FAQ)

export default router
