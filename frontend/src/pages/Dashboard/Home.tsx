import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics"
import StatisticsChart from "../../components/ecommerce/StatisticsChart"
import RecentOrders from "../../components/ecommerce/RecentOrders"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"

export default function Home() {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | หน้าหลัก`}
        description={WEBSITE_DESCRIPTION}
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6">
          <EcommerceMetrics />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12">
          <RecentOrders />
        </div>
      </div>
    </>
  )
}
