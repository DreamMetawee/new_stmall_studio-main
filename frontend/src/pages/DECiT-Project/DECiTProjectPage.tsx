import { useEffect, useState } from "react"
import { useQueryParam } from "../../utils/string"
import { useNavigate } from "react-router"
import { GET_DECIT_PROJECT_BY_ID } from "../../actions/decit-project.action"
import PageMeta from "../../components/common/PageMeta"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import { AnimatePresence } from "motion/react"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import Template from "../../components/motions"
import DECiTProjectTable from "../../components/decit-projects/decit-project-table"
import { DECiTProjectProps } from "../../props/DECiTProject"
import DECiTProjectForm from "../../components/decit-projects/decit-project-form"

const DECiTProjectPage = () => {
  const navigate = useNavigate()

  const mode = useQueryParam("mode")
  const paramId = Number(useQueryParam("v"))
  const [selected, setSelected] = useState<DECiTProjectProps | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await GET_DECIT_PROJECT_BY_ID(paramId)
      setSelected(response)
      if (!response) navigate("/decit-projects?mode=create")
    }

    if (mode === "edit" && paramId) {
      fetchData()
    }
  }, [mode, paramId])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} - ผลงานช่าง DECiT`}
        description={`${WEBSITE_DESCRIPTION}`}
      />
      <PageBreadcrumb pageTitle="ผลงานช่าง DECiT" />
      <div className="flex min-h-screen flex-col">
        <AnimatePresence mode="wait">
          {!mode ? (
            <Template key="view">
              <DECiTProjectTable />
            </Template>
          ) : mode === "create" ? (
            <Template key="create">
              <DECiTProjectForm mode="create" />
            </Template>
          ) : (
            <Template key="edit">
              <DECiTProjectForm mode="edit" existingData={selected!} />
            </Template>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default DECiTProjectPage
