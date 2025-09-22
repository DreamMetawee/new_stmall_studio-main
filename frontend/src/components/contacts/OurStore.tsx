import { useEffect, useState } from "react"
import OurStoreTable from "../tables/Contacts/OurStoreTable"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import { OurStoreProps } from "../../props/Page"

const OurStore = () => {
  const [stores, setStores] = useState<OurStoreProps[]>([])

  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}pages/our-store`
      )
      const { data } = response
      setStores(data)
    } catch (error) {
      console.error("Error fetching stores:", error)
    }
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
              ร้านค้า
            </h3>
          </div>
          <div className="col-span-2">
            <OurStoreTable data={stores} fetchData={fetchData} />
          </div>
        </div>
      </div>
    </div>
  )
}
export default OurStore
