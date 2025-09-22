import { Router } from "express"
import dashboardRoutes from "./dashboard"
import userRoutes from "./users/users"
import inPaymentRoutes from "./inpayment/inpayment"
import groupRoutes from "./groups"
import promotionRoute from "./products/promotions"
import brandRoute from "./products/brands"
import productRoutes from "./products/products"
import heroProductRoute from "./products/hero-products"
import DecoByStyleRoute from "./decobystyles"
import SubDecoByStyleRoute from "./sub_dcbs"
import CatalogRoute from "./products/catalog/catalog"
import pageRoute from "./pages"
import sendEmailRoute from "./sendEmail/sendEmail"
import CookiePolicyRoute from "./policy/cookiePolicy"
import PrivacyPolicyRoute from "./policy/privacyPolicy"
import ExchangePolicyRoute from "./policy/exchangePolicy"
import ConditionPolicyRoute from "./policy/conditionPolicy"
import CCTVPolicyRoute from "./policy/cctvPolicy"
import CatalogImage from "./products/catalog/catalogImage"
import FAQRoutes from "./faqs"
import HowToOrderRoutes from "./howto-order"
import DeliveryTerm from "./policy/delivery-terms"
import DECiTPorjectsRoutes from "./decit-projects"

const router = Router()

router.use("/dashboard", dashboardRoutes)
router.use("/users", userRoutes)
router.use("/inpayment", inPaymentRoutes)
router.use("/groups", groupRoutes)
router.use("/promotions", promotionRoute)
router.use("/brands", brandRoute)
router.use("/products", productRoutes)
router.use("/hero-products", heroProductRoute)
router.use("/dcbs", DecoByStyleRoute)
router.use("/subdcbs", SubDecoByStyleRoute)
router.use("/catalog", CatalogRoute)
router.use("/catalog-images", CatalogImage)
router.use("/pages", pageRoute)
router.use("/sendEmail", sendEmailRoute)
router.use("/cookie-policy", CookiePolicyRoute)
router.use("/privacy-policy", PrivacyPolicyRoute)
router.use("/exchange-policy", ExchangePolicyRoute)
router.use("/condition-policy", ConditionPolicyRoute)
router.use("/cctv-policy", CCTVPolicyRoute)
router.use("/faqs", FAQRoutes)
router.use("/how-to-order", HowToOrderRoutes)
router.use("/delivery-terms", DeliveryTerm)
router.use("/decit-projects", DECiTPorjectsRoutes)

export default router
