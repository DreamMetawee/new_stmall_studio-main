import { useEffect, useState } from "react"
import { AboutChildProps } from "../../pages/AboutPage/AboutPage"
import Input from "../form/input/InputField"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import BusinessTable from "../tables/CoBusiness/BusinessTable"
import { CoBusinessProps } from "../../props/Page"
import QuillEditor from "../common/QuillEditor"

const CoBusiness = ({ data, onChange }: AboutChildProps) => {
  const [business, setBusiness] = useState<CoBusinessProps[]>([])

  const fetchData = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}pages/co-business`
    )
    const json = response.data
    setBusiness(json.data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
              ธุรกิจที่เกี่ยวข้อง
            </h3>
            <div className="space-y-6">
              <Input
                placeholder="Title"
                value={data.business_title}
                onChange={e => onChange("business_title", e.target.value)}
              />
              <QuillEditor
                value={data.business_content}
                onChange={value => onChange("business_content", value)}
              />
            </div>
          </div>
          <div className="col-span-2">
            <BusinessTable fetchData={fetchData} data={business} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default CoBusiness
