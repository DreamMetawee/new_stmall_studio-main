import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import ComponentCard from "../../components/common/ComponentCard"
import PageMeta from "../../components/common/PageMeta"
import UserTablesOne from "../../components/tables/UserTables/UserTablesOne"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"

export default function UserTables() {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการผู้ใช้งาน`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการผู้ใช้งาน" />
      <div className="space-y-6">
        <ComponentCard>
          <UserTablesOne />
        </ComponentCard>
      </div>
    </>
  )
}
