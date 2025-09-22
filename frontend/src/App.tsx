import { createBrowserRouter, RouterProvider } from "react-router"
import NotFound from "./pages/OtherPage/NotFound"
import UserProfiles from "./pages/UserProfiles"
import AppLayout from "./layout/AppLayout"
import Home from "./pages/Dashboard/Home"
import UserTables from "./pages/Users/UsersTables"
import ProtectedRoute from "./components/auth/ProtectedRoute"
import SignIn from "./pages/AuthPages/SignIn"
import Inpayment from "./pages/Inpayment/Inpayment"
import MainCategory from "./pages/Groups/MainCategory"
import SubCategory from "./pages/Groups/SubCategory"
import ProductType from "./pages/Groups/ProductType"
import HeroProducts from "./pages/Products/HeroProducts"
import Brands from "./pages/Products/Brands"
import Promotions from "./pages/Products/Promotions"
import AboutPage from "./pages/AboutPage/AboutPage"
import Contacts from "./pages/Contacts/Contacts"
import Services from "./pages/Services/Services"
import ViewAllServices from "./pages/Services/ViewAllServices"
import SendEmail from "./pages/SendEmail/sendEmail"
import ViewEmail from "./pages/SendEmail/view"
import EmailEditor from "./pages/SendEmail/emailEditor"
import Catalog from "./pages/Products/Catalog"
import DecoByStyles from "./pages/DecoByStyles/DecoByStyles"
import CookiePolicy from "./pages/Policy/cookiePolicy"
import UserPolicy from "./pages/Policy/privacyPolicy"
import ExchangePolicy from "./pages/Policy/return_and_ExchangePolicy"
import Condition from "./pages/Policy/terms_and_conditions"
import MainProduct from "./pages/Products/MainProduct/MainProduct"
import CCTVPolicy from "./pages/Policy/cctvpolicy"
import FAQPage from "./pages/AboutPage/FAQPage"
import HowToOrderPage from "./pages/AboutPage/HowToOrderPage"
import ShoppingTerm from "./pages/AboutPage/Delivery-Terms"
import DECiTProjects from "./pages/DECiT-Project/DECiTProjectPage"

const router = createBrowserRouter([
  { path: "*", element: <NotFound /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      //* Dashboard
      { path: "", element: <Home /> },
      //* Users Management
      { path: "users", element: <UserTables /> },
      { path: "users/:userId", element: <UserProfiles /> },
      //* Self Profile Management
      { path: "profile", element: <UserProfiles /> },
      { path: "Inpayment", element: <Inpayment /> },
      //* Products Group Management
      { path: "main-category", element: <MainCategory /> },
      { path: "sub-category", element: <SubCategory /> },
      { path: "product-type", element: <ProductType /> },
      //* Products Management
      { path: "promotions", element: <Promotions /> },
      { path: "brands", element: <Brands /> },
      { path: "hero-products", element: <HeroProducts /> },
      { path: "products", element: <MainProduct /> },
      { path: "catalogs", element: <Catalog /> },
      {
        path: "decobystyles",
        element: <DecoByStyles />,
      },
      //* Pages Management
      { path: "decit", element: <Services /> },
      { path: "decit/:serviceId", element: <ViewAllServices /> },
      { path: "decit-projects", element: <DECiTProjects /> },
      { path: "about-us", element: <AboutPage /> },
      { path: "contacts", element: <Contacts /> },
      { path: "faq", element: <FAQPage /> },
      { path: "howto-order", element: <HowToOrderPage /> },
      { path: "delivery-term", element: <ShoppingTerm /> },
      //* Mail Sender for Customers
      { path: "send-mail", element: <SendEmail /> },
      { path: "send-mail/:sendEmailId", element: <ViewEmail /> },
      { path: "send-mail/:sendEmailId/editor", element: <EmailEditor /> },
      //* Policy Management
      { path: "cookie-policy", element: <CookiePolicy /> },
      { path: "privacy-policy", element: <UserPolicy /> },
      { path: "exchange-policy", element: <ExchangePolicy /> },
      { path: "condition", element: <Condition /> },
      { path: "cctv-policy", element: <CCTVPolicy /> },
    ],
  },
  {
    path: "/signin",
    element: <SignIn />,
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
