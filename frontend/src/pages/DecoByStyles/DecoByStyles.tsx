import { AnimatePresence } from "motion/react"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import DecoByStyleForm from "../../components/deco-by-styles/dcbs-form"
import ViewDecoByStyles from "../../components/deco-by-styles/ViewDecoByStyles"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import { useQueryParam } from "../../utils/string"
import Template from "../../components/motions"
import { useEffect, useState } from "react"
import { DecoByStyleProps } from "../../props/DecoByStyle"
import { GetDecoByStyleWithId } from "../../actions/decobystyles.action"
import { useNavigate } from "react-router"

export interface ListProps {
  id: number
  image: string
  name: string
}

const DecoByStyles = () => {
  const navigate = useNavigate()

  const mode = useQueryParam("mode")
  const dcbsId = Number(useQueryParam("v"))
  const [selected, setSelected] = useState<
    | (Pick<DecoByStyleProps, "id" | "image" | "name"> & {
        lists: ListProps[]
      })
    | null
  >(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await GetDecoByStyleWithId(dcbsId)
      setSelected(response)
      if (!response) navigate("/decobystyles?mode=create")
    }

    if (mode === "edit" && dcbsId) {
      fetchData()
    }
  }, [mode, dcbsId])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} - สินค้าตามสไตล์`}
        description={`${WEBSITE_DESCRIPTION}`}
      />
      <PageBreadcrumb pageTitle="สินค้าตามสไตล์" />
      <div className="flex min-h-screen flex-col">
        <AnimatePresence mode="wait">
          {!mode ? (
            <Template key="view">
              <ViewDecoByStyles />
            </Template>
          ) : mode === "create" ? (
            <Template key="create">
              <DecoByStyleForm mode="create" />
            </Template>
          ) : (
            <Template key="edit">
              <DecoByStyleForm mode="edit" existingData={selected!} />
            </Template>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default DecoByStyles
