import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import ComponentCard from "../../components/common/ComponentCard"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import MainCategoryTable from "../../components/tables/GroupProductTables/MainCategoryTable"

export default function MainCategory() {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการหมวดหมู่หลัก`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการหมวดหมู่หลัก" />
      <div className="space-y-6">
        <ComponentCard>
          <MainCategoryTable />
        </ComponentCard>
      </div>
    </>
  )
}
