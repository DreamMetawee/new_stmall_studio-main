import { useParams } from "react-router"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { useEffect, useState } from "react"
import { ServiceItemProps } from "../../props/Page"
import ServiceItems from "../../components/services/ServiceItems"

const ViewAllServices = () => {
  const { serviceId } = useParams<{ serviceId: string }>()
  const [service, setService] = useState<
    | {
        id: string
        name: string
        description: string
      }
    | undefined
  >(undefined)
  const [services, setServices] = useState<ServiceItemProps[]>([])

  const fetchServiceCateData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}pages/services/${serviceId}`
      )
      setService({
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
      })
      setServices(response.data.service_items)
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  useEffect(() => {
    fetchServiceCateData()
  }, [])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} | บริการงานช่างมือ 1 DECiT - ${service?.name || "N/A"}`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb
        pageTitle={`บริการงานช่างมือ 1 DECiT - ${service?.name || "N/A"}`}
      />
      <div className="space-y-6">
        <ServiceItems
          serviceId={String(serviceId)}
          reFetching={fetchServiceCateData}
          items={services}
        />
      </div>
    </div>
  )
}
export default ViewAllServices
