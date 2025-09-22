import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { AnimatePresence } from "motion/react"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../../utils/meta"
import { useQueryParam } from "../../../utils/string"
import PageMeta from "../../../components/common/PageMeta"
import PageBreadcrumb from "../../../components/common/PageBreadCrumb"
import Template from "../../../components/motions"
import ViewMainProduct from "../../../components/main-product/view-main-product"
import { GetMainProductById } from "../../../actions/main-product.action"
import MainProductForm from "../../../components/main-product/main-product-form"
import { toast } from "react-toastify"

const MainProduct = () => {
  const navigate = useNavigate()

  const mode = useQueryParam("mode") as "create" | "edit" | "view"
  const productId = Number(useQueryParam("v"))
  const [selected, setSelected] = useState<any | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await GetMainProductById(productId)
      setSelected(response)
      if (!response) {
        toast.warn("มีบางอย่างผิดพลาด: ไม่พบข้อมูลสินค้า")
        navigate("/products")
      }
    }

    if ((mode === "edit" || mode === "view") && productId) {
      fetchData()
    }
  }, [mode, productId])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} - สินค้าตามสไตล์`}
        description={`${WEBSITE_DESCRIPTION}`}
      />
      <PageBreadcrumb pageTitle="สินค้าตามสไตล์" />
      <div className="flex min-h-screen flex-col">
        <AnimatePresence mode="wait">
          {!mode ? (
            <Template key="view">
              <ViewMainProduct />
            </Template>
          ) : mode === "create" ? (
            <Template key="create">
              <MainProductForm mode="create" />
            </Template>
          ) : (
            <Template key={mode}>
              <MainProductForm mode={mode} existingData={selected} />
            </Template>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default MainProduct
