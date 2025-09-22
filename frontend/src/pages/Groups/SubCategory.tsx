import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import ComponentCard from "../../components/common/ComponentCard"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import SubCategoryTable from "../../components/tables/GroupProductTables/SubCategoryTable"

export default function SubCategory() {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการหมวดหมู่ย่อย`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการหมวดหมู่ย่อย" />
      <div className="space-y-6">
        <ComponentCard>
          <SubCategoryTable />
        </ComponentCard>
      </div>
    </>
  )
}
