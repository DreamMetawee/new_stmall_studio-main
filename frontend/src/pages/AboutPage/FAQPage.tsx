import { useNavigate } from "react-router"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import FAQsTable from "../../components/faq/faqs-table"
import { WEBSITE_DESCRIPTION, WEBSITE_TITLE } from "../../utils/meta"
import { useQueryParam } from "../../utils/string"
import { useEffect, useState } from "react"
import { AnimatePresence } from "motion/react"
import Template from "../../components/motions"
import FAQsForm from "../../components/faq/faqs-form"
import { FAQProps } from "../../props/FAQs"
import { GET_FAQ_BY_ID } from "../../actions/faq.action"

const FAQPage = () => {
  const navigate = useNavigate()

  const mode = useQueryParam("mode")
  const faqId = Number(useQueryParam("v"))
  const [selected, setSelected] = useState<Pick<
    FAQProps,
    "id" | "name" | "answer"
  > | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const response = await GET_FAQ_BY_ID(faqId)
      setSelected(response)
      if (!response) navigate("/faq?mode=create")
    }

    if (mode === "edit" && faqId) {
      fetchData()
    }
  }, [mode, faqId])

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} - คำถามที่พบบ่อย`}
        description={`${WEBSITE_DESCRIPTION}`}
      />
      <PageBreadcrumb pageTitle="คำถามที่พบบ่อย" />
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col">
        <AnimatePresence mode="wait">
          {!mode ? (
            <Template key="view">
              <FAQsTable />
            </Template>
          ) : mode === "create" ? (
            <Template key="create">
              <FAQsForm mode="create" />
            </Template>
          ) : (
            <Template key="edit">
              <FAQsForm mode="edit" existingData={selected!} />
            </Template>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FAQPage
