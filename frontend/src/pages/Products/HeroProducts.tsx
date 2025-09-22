import ComponentCard from "../../components/common/ComponentCard"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import HeroProductsTable from "../../components/tables/Products/HeroProductsTable"

const HeroProducts = () => {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการหมวดหมู่หลัก`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการสินค้าตัวหลัก" />
      <div className="space-y-6">
        <ComponentCard>
          <HeroProductsTable />
        </ComponentCard>
      </div>
    </>
  )
}
export default HeroProducts
