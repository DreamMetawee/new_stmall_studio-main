import ComponentCard from "../../components/common/ComponentCard"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import PromotionsTable from "../../components/tables/Products/PromotionsTable"

const Promotions = () => {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการสไลด์โปรโมชั่น`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการสไลด์โปรโมชั่น" />
      <div className="space-y-6">
        <ComponentCard>
          <PromotionsTable />
        </ComponentCard>
      </div>
    </>
  )
}
export default Promotions
