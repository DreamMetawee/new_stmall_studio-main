import { useNavigate } from "react-router"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import { useQueryParam } from "../../utils/string"
import { useEffect, useState } from "react"
import { AnimatePresence } from "motion/react"
import Template from "../../components/motions"
import HowToOrderTable from "../../components/how-to-orders/how-to-order-table"
import HowToOrderForm from "../../components/how-to-orders/how-to-order-form"
import { HowToOrderProps } from "../../props/HowToOrder"
import { GET_HOW_TO_ORDER_BY_ID } from "../../actions/how-to-order.action"

const HowToOrderPage = () => {
  const navigate = useNavigate()

  const mode = useQueryParam("mode")
  const htoId = Number(useQueryParam("v"))
  const [selected, setSelected] = useState<HowToOrderProps | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await GET_HOW_TO_ORDER_BY_ID(htoId)
      setSelected(response)
      if (!response) navigate("/howto-order?mode=create")
    }

    if (mode === "edit" && htoId) {
      fetchData()
    }
  }, [mode, htoId])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} - ขั้นตอนการสั่งซื้อ`}
        description={`${WEBSITE_DESCRIPTION}`}
      />
      <PageBreadcrumb pageTitle="ขั้นตอนการสั่งซื้อ" />
      <div className="flex min-h-screen flex-col">
        <AnimatePresence mode="wait">
          {!mode ? (
            <Template key="view">
              <HowToOrderTable />
            </Template>
          ) : mode === "create" ? (
            <Template key="create">
              <HowToOrderForm mode="create" />
            </Template>
          ) : (
            <Template key="edit">
              <HowToOrderForm mode="edit" existingData={selected!} />
            </Template>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default HowToOrderPage
