import PageMeta from "../../components/common/PageMeta"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import { AnimatePresence } from "motion/react"
import Template from "../../components/motions"
import { useNavigate } from "react-router"
import { useQueryParam } from "../../utils/string"
import { useEffect, useState } from "react"
import { GetCatalogDetailWithId } from "../../actions/catalog-details.action"
import CatalogForm from "../../components/catalog-view/catalog-from"
import { CatalogProps } from "../../props/Product"
import ViewCatalog from "../../components/catalog-view/ViewCatalog"

export interface CatalogListProps {
  id: number
  image: string
}

const Catalog = () => {
  const navigate = useNavigate()

  const mode = useQueryParam("mode")
  const CatalogID = Number(useQueryParam("v"))
  const [selected, setSelected] = useState<
    | (Pick<CatalogProps, "id" | "image" | "name" | "category_id"> & {
        lists: CatalogListProps[]
      })
    | null
  >(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await GetCatalogDetailWithId(CatalogID)
      setSelected(response)
      if (!response) navigate("/catalogs?mode=create")
    }

    if (mode === "edit" && CatalogID) {
      fetchData()
    }
  }, [mode, CatalogID])
  


  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} - แคตตาล็อก`}
        description={`${WEBSITE_DESCRIPTION}`}
      />
      <PageBreadcrumb pageTitle="แคตตาล็อก" />
      <div className="flex min-h-screen flex-col">
        <AnimatePresence mode="wait">
          {!mode ? (
            <Template key="view">
              <ViewCatalog />
            </Template>
          ) : mode === "create" ? (
            <Template key="create">
              <CatalogForm mode="create" />
            </Template>
          ) : (
            <Template key="edit">
              <CatalogForm mode="edit" existingData={selected!} />
            </Template>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default Catalog
