import AboutUs from "../../components/about-us/AboutUs"
import WhoWeAre from "../../components/about-us/WhoWeAre"
import CoBusiness from "../../components/about-us/CoBusiness"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import PageMeta from "../../components/common/PageMeta"
import {
  API_ENDPOINT,
  API_VERSION,
  IS_PEDDING_TEXT,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import SaleTeam from "../../components/about-us/SaleTeam"
import {
  PageUpdateProvider,
  usePageUpdate,
} from "../../context/PageUpdateContext"
import { AnimatePresence, motion } from "motion/react"
import Notify from "../../components/ui/notifications"
import { useEffect, useState } from "react"
import { AuthSending } from "../../utils/api"
import { toast } from "react-toastify"

export default function AboutPage() {
  return (
    <PageUpdateProvider>
      <AboutPageContent />
    </PageUpdateProvider>
  )
}

interface AboutFormDataProps {
  our_vision: string
  our_mission: string
  record_title: string
  record_subtitle: string
  business_title: string
  business_content: string
}

interface AboutImageProps {
  hero_image: File | string
  contact_image: File | string
  record_image_1st: File | string
  record_image_2nd: File | string
  record_image_3rd: File | string
  record_image_4th: File | string
  record_image_5th: File | string
  record_image_6th: File | string
}

export interface AboutChildProps {
  data: AboutFormDataProps & AboutImageProps
  onChange: (name: string, value: File | string) => void
}

function AboutPageContent() {
  const { isDirty, setDirty } = usePageUpdate()

  const [initialState, setInitialState] = useState<
    AboutFormDataProps & AboutImageProps
  >({
    our_vision: "",
    our_mission: "",
    record_title: "",
    record_subtitle: "",
    business_title: "",
    business_content: "",
    hero_image: "",
    contact_image: "",
    record_image_1st: "",
    record_image_2nd: "",
    record_image_3rd: "",
    record_image_4th: "",
    record_image_5th: "",
    record_image_6th: "",
  })
  const [formData, setFormData] = useState<
    AboutFormDataProps & AboutImageProps
  >({
    our_vision: "",
    our_mission: "",
    record_title: "",
    record_subtitle: "",
    business_title: "",
    business_content: "",
    hero_image: "",
    contact_image: "",
    record_image_1st: "",
    record_image_2nd: "",
    record_image_3rd: "",
    record_image_4th: "",
    record_image_5th: "",
    record_image_6th: "",
  })

  const fetchData = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}pages/about-us`
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
    const hasImageChanged = Boolean(
      formData.hero_image ||
        formData.record_image_1st ||
        formData.record_image_2nd ||
        formData.record_image_3rd ||
        formData.record_image_4th ||
        formData.record_image_5th ||
        formData.record_image_6th
    )
    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      let res

      if (hasImageChanged) {
        const form = new FormData()
        form.append("vision", formData.our_vision.trim())
        form.append("mission", formData.our_mission.trim())
        form.append("record_title", formData.record_title.trim())
        form.append("record_subtitle", formData.record_subtitle.trim())
        form.append("business_title", formData.business_title.trim())
        form.append("business_content", formData.business_content.trim())

        // Optional: append images only if they are File objects
        if (formData.hero_image instanceof File)
          form.append("hero_image", formData.hero_image)

        if (formData.record_image_1st instanceof File)
          form.append("record_image_1st", formData.record_image_1st)

        if (formData.record_image_2nd instanceof File)
          form.append("record_image_2nd", formData.record_image_2nd)

        if (formData.record_image_3rd instanceof File)
          form.append("record_image_3rd", formData.record_image_3rd)

        if (formData.record_image_4th instanceof File)
          form.append("record_image_4th", formData.record_image_4th)

        if (formData.record_image_5th instanceof File)
          form.append("record_image_5th", formData.record_image_5th)

        if (formData.record_image_6th instanceof File)
          form.append("record_image_6th", formData.record_image_6th)

        res = await AuthSending().patch(
          `${API_ENDPOINT}${API_VERSION}pages/about-us`,
          form,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
      } else {
        res = await AuthSending().patch(
          `${API_ENDPOINT}${API_VERSION}pages/about-us`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        )
      }

      if (res.status !== 200) throw new Error("Failed to update About Us page.")

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
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    }
  }

  return (
    <div>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการหน้าเกี่ยวกับเรา`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="เกี่ยวกับเรา" />
      <div className="space-y-6">
        <AboutUs data={formData} onChange={handlerChange} />
        <WhoWeAre data={formData} onChange={handlerChange} />
        <CoBusiness data={formData} onChange={handlerChange} />
        <SaleTeam />
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
