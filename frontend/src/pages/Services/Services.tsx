import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import ServiceList from "../../components/services/ServiceList"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"

const Services = () => {
  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} | บริการงานช่างมือ 1 DECiT`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="บริการงานช่างมือ 1 DECiT" />
      <div className="space-y-6">
        <ServiceList />
      </div>
    </div>
  )
}
export default Services
