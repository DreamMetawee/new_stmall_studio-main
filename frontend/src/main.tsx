import { createRoot } from "react-dom/client"
import "./index.css"
import "swiper/swiper-bundle.css"
import "flatpickr/dist/flatpickr.css"
import "react-toastify/ReactToastify.css"
import App from "./App.tsx"
import { AppWrapper } from "./components/common/PageMeta.tsx"
import { ThemeProvider } from "./context/ThemeContext.tsx"
import { UserProvider } from "./context/UserContext.tsx"

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <ThemeProvider>
      <AppWrapper>
        <App />
      </AppWrapper>
    </ThemeProvider>
  </UserProvider>
)
