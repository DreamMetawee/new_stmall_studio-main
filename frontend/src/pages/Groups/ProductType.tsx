import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import ComponentCard from "../../components/common/ComponentCard"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import ProductTypeTable from "../../components/tables/GroupProductTables/ProductTypeTable"

export default function ProductType() {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการประเภทสินค้า`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการประเภทสินค้า" />
      <div className="space-y-6">
        <ComponentCard>
          <ProductTypeTable />
        </ComponentCard>
      </div>
    </>
  )
}
