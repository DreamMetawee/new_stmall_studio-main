import { Router } from "express"
import { HOST } from "../.."
import Categories from "./categories"
import Brands from "./brands"
import HeroProducts from "./hero-products"
import Products from "./products"
import Promotions from "./promotions"
import DecoByStyle from "./decobystyles"
import DECiT from "./decit"
import Catalogs from "./catalogs"
import CookiePolicy from "./cookies"
import PrivacyPolicy from "./privacies"
import ExchangePolicy from "./exchanges"
import ConditionPolicy from "./conditions"
import CCTVPolicy from "./cctvs"
import DeliveryTerm from "./delivery-term"
import FAQs from "./faqs"
import HTO from "./hto"
import AboutUs from "./about-us"
import ContactUs from "./contact"

const router = Router()

router.get("/", (req, res) => {
  const routing = {
    categories: `${HOST}categories`,
    brands: `${HOST}brands`,
    product: `${HOST}products`,
    hero_products: `${HOST}hero-products`,
    promotions: `${HOST}promotions`,
    deco_by_styles: `${HOST}dcbs`,
    decit: `${HOST}decit`,
    catalogs: `${HOST}catalogs`,
    cookiepolicy: `${HOST}cookies`,
    PrivacyPolicy: `${HOST}privacies`,
    ExchangePolicy: `${HOST}exchanges`,
    ConditionPolicy: `${HOST}conditions`,
    CCTVPolicy: `${HOST}cctvs`,
    DeliveryTerm: `${HOST}delivery-term`,
    FAQs: `${HOST}faqs`,
    HowtoOrder: `${HOST}hto`,
    AboutUs: `${HOST}about-us`,
    ContactUs: `${HOST}contact-us`,
  }

  res.json({ status: "ready", routing })
})
router.use("/categories", Categories)
router.use("/brands", Brands)
router.use("/hero-products", HeroProducts)
router.use("/products", Products)
router.use("/promotions", Promotions)
router.use("/dcbs", DecoByStyle)
router.use("/decit", DECiT)
router.use("/catalogs", Catalogs)
router.use("/cookies", CookiePolicy)
router.use("/privacies", PrivacyPolicy)
router.use("/exchanges", ExchangePolicy)
router.use("/conditions", ConditionPolicy)
router.use("/cctvs", CCTVPolicy)
router.use("/delivery-term", DeliveryTerm)
router.use("/faqs", FAQs)
router.use("/hto", HTO)
router.use("/about-us", AboutUs)
router.use("/contact-us", ContactUs)

export default router
