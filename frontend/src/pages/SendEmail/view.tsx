import { useNavigate, useParams } from "react-router"
import { useEffect, useState } from "react"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import { ArrowLeftIcon } from "../../icons"

const ViewContactPage = () => {
  const navigate = useNavigate()
  const { sendEmailId } = useParams()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await AuthSending().get(
          `${API_ENDPOINT}${API_VERSION}sendEmail/${sendEmailId}`
        )
        const { data } = response || {}
        if (data) setFormData(data)
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }

    if (sendEmailId) fetchContactData()
  }, [sendEmailId])

  return (
    <div className="p-6 sm:p-10">
      <ArrowLeftIcon
        className="mb-6 cursor-pointer text-gray-500 hover:text-gray-700 transition-transform transform hover:scale-110"
        onClick={() => navigate(-1)}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            readOnly
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Email
          </label>
          <input
            type="text"
            value={formData.email}
            readOnly
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Phone
          </label>
          <input
            type="text"
            value={formData.phone}
            readOnly
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
          />
        </div>

        <div className="col-span-2 sm:col-span-1">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Subject
          </label>
          <input
            type="text"
            value={formData.subject}
            readOnly
            className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 bg-transparent text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Message
          </label>
          <textarea
            value={formData.message}
            readOnly
            rows={6}
            className="w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden bg-gray-50  text-gray-900  border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          />
        </div>
      </div>
    </div>
  )
}

export default ViewContactPage
