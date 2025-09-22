import { useEffect, useState } from "react"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import ContactInfo from "../../components/contacts/ContactInfo"
import OurStore from "../../components/contacts/OurStore"
import {
  PageUpdateProvider,
  usePageUpdate,
} from "../../context/PageUpdateContext"
import {
  API_ENDPOINT,
  API_VERSION,
  IS_PEDDING_TEXT,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { motion, AnimatePresence } from "motion/react"
import Notify from "../../components/ui/notifications"
import { toast } from "react-toastify"

const ContactPage = () => {
  return (
    <PageUpdateProvider>
      <ContactPageContext />
    </PageUpdateProvider>
  )
}

interface ContactFormDataProps {
  contact_name: string
  sub_contact_name: string
  contact_description: string
  contact_position: string
  contact_mobile: string
  contact_phone: string
  contact_email: string
  contact_hour: string
  contact_line: string
  contact_facebook: string
  contact_website: string
  contact_google_map: string
}

interface ContactImageProps {
  contact_image: File | string
}

export interface ContactChildProps {
  data: ContactFormDataProps & ContactImageProps
  onChange: (name: string, value: File | string) => void
}

const ContactPageContext = () => {
  const { isDirty, setDirty } = usePageUpdate()

  const [initialState, setInitialState] = useState<
    ContactFormDataProps & ContactImageProps
  >({
    contact_image: "",
    contact_name: "",
    sub_contact_name: "",
    contact_description: "",
    contact_position: "",
    contact_mobile: "",
    contact_phone: "",
    contact_email: "",
    contact_hour: "",
    contact_line: "",
    contact_facebook: "",
    contact_website: "",
    contact_google_map: "",
  })
  const [formData, setFormData] = useState<
    ContactFormDataProps & ContactImageProps
  >({
    contact_image: "",
    contact_name: "",
    sub_contact_name: "",
    contact_description: "",
    contact_position: "",
    contact_mobile: "",
    contact_phone: "",
    contact_email: "",
    contact_hour: "",
    contact_line: "",
    contact_facebook: "",
    contact_website: "",
    contact_google_map: "",
  })

  const fetchData = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}pages/contact`
    )
    if (response.status === 200) {
      const data = response.data
      setInitialState(data)
      setFormData(data)
    } else {
      console.error("Error fetching data:", response.statusText)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (JSON.stringify(initialState) !== JSON.stringify(formData)) {
      setDirty(true)
    } else {
      setDirty(false)
    }
  }, [formData])

  const resetHandler = () => {
    setFormData(initialState)
    setDirty(false)
  }

  const handlerChange = (name: string, value: File | string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlerSave = async () => {
    const hasImageChanged = Boolean(formData.contact_image)
    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      let res

      if (hasImageChanged) {
        const form = new FormData()
        form.append("contact_name", formData.contact_name)
        form.append("sub_contact_name", formData.sub_contact_name)
        form.append("contact_description", formData.contact_description)
        form.append("contact_position", formData.contact_position)
        form.append("contact_mobile", formData.contact_mobile)
        form.append("contact_phone", formData.contact_phone)
        form.append("contact_email", formData.contact_email)
        form.append("contact_hour", formData.contact_hour)
        form.append("contact_line", formData.contact_line)
        form.append("contact_facebook", formData.contact_facebook)
        form.append("contact_website", formData.contact_website)
        form.append("contact_google_map", formData.contact_google_map)

        if (formData.contact_image instanceof File)
          form.append("contact_image", formData.contact_image)

        res = await AuthSending().patch(
          `${API_ENDPOINT}${API_VERSION}pages/contact`,
          form
        )
      } else {
        res = await AuthSending().patch(
          `${API_ENDPOINT}${API_VERSION}pages/contact`,
          {
            contact_name: formData.contact_name,
            sub_contact_name: formData.sub_contact_name,
            contact_description: formData.contact_description,
            contact_position: formData.contact_position,
            contact_mobile: formData.contact_mobile,
            contact_phone: formData.contact_phone,
            contact_email: formData.contact_email,
            contact_hour: formData.contact_hour,
            contact_line: formData.contact_line,
            contact_facebook: formData.contact_facebook,
            contact_website: formData.contact_website,
            contact_google_map: formData.contact_google_map,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (res.status !== 200) throw new Error("Failed to update Contact page.")

      const result = res.data
      toast.update(toastId, {
        render: result.message,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      })

      setInitialState(formData)
      setDirty(false)
    } catch (error: any) {
      console.error(error)
      toast.update(toastId, {
        render: error.response?.data?.message || error.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    }
  }

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการข้อมูลติดต่อ`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="เกี่ยวกับเรา" />
      <div className="space-y-6">
        <ContactInfo data={formData} onChange={handlerChange} />
        <OurStore />
      </div>

      <AnimatePresence>
        {isDirty && (
          <motion.div
            className="fixed bottom-4 left-1/2 flex w-full -translate-x-1/2 items-center justify-center px-4"
            initial={{ zIndex: 9999, opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <Notify
              title="พบการเปลี่ยนแปลงข้อมูล"
              message="ต้องการบันทึกการเปลี่ยนแปลงหรือไม่?"
              onLater={resetHandler}
              onUpdate={handlerSave}
              laterText="คืนค่าเดิม"
              updateText="บันทึก"
              className="shadow-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
export default ContactPage
