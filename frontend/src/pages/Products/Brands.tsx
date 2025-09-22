import ComponentCard from "../../components/common/ComponentCard"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import BrandsTable from "../../components/tables/Products/BrandsTable"

const Brands = () => {
  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการแบรนด์สินค้า`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการแบรนด์สินค้า" />
      <div className="space-y-6">
        <ComponentCard>
          <BrandsTable />
        </ComponentCard>
      </div>
    </>
  )
}
export default Brands
