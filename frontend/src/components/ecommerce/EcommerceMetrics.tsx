import { useEffect, useState } from "react"
import { BoxesIcon, BoxIconLine, EyeIcon } from "../../icons"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"

interface Metrics {
  products: number
  brands: number
  visitors: number
  trends: {
    visitors: number
    products: number
    brands: number
  }
}

export default function EcommerceMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchMetrics = async () => {
    setLoading(true)

    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}dashboard/metrics`
      )

      if (response.status === 200) {
        setMetrics(response.data)
      } else {
        console.error("Error fetching metrics:", response.statusText)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <EyeIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ยอดผู้เข้าชมสินค้า
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? (
                <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <span>{Number(metrics?.visitors).toLocaleString()}</span>
              )}{" "}
            </h4>
            <small>ครั้ง</small>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxesIcon className="size-6 text-gray-800 dark:text-white/90" />
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              จำนวนสินค้า
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? (
                <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <span>{Number(metrics?.products).toLocaleString()}</span>
              )}
            </h4>
            <small>รายการ</small>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}

      {/* <!-- Metric Item Start --> */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 md:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
          <BoxIconLine className="size-6 text-gray-800 dark:text-white/90" />
        </div>

        <div className="mt-5 flex items-end justify-between">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              จำนวนแบรนด์สินค้า
            </span>
            <h4 className="text-title-sm mt-2 font-bold text-gray-800 dark:text-white/90">
              {loading ? (
                <div className="h-4 w-16 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
              ) : (
                <span>{Number(metrics?.brands).toLocaleString()}</span>
              )}
            </h4>
            <small>แบรนด์</small>
          </div>
        </div>
      </div>
      {/* <!-- Metric Item End --> */}
    </div>
  )
}
