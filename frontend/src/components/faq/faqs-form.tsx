import { useNavigate } from "react-router"
import { ArrowLeftIcon } from "../../icons"
import { FAQProps } from "../../props/FAQs"
import Input from "../form/input/InputField"
import Button from "../ui/button/Button"
import { useEffect, useState } from "react"
import QuillEditor from "../common/QuillEditor"
import { PATCH_FAQ, POST_FAQ } from "../../actions/faq.action"
import { toast } from "react-toastify"

interface FAQsFormProps {
  mode: "create" | "edit"
  existingData?: Pick<FAQProps, "id" | "name" | "answer">
}

const FAQsForm: React.FC<FAQsFormProps> = ({ mode, existingData }) => {
  const navigate = useNavigate()

  const [faqsData, setFAQsData] = useState({
    name: "",
    answer: "",
  })

  useEffect(() => {
    if (mode === "edit" && existingData) {
      setFAQsData({
        name: existingData?.name,
        answer: existingData?.answer,
      })
    }
  }, [existingData])

  const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFAQsData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!faqsData.name || !faqsData.answer) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
      return
    }

    try {
      const payload = {
        question: faqsData.name,
        answer: faqsData.answer,
      }

      if (mode === "create" && !existingData) {
        const res = await POST_FAQ(payload)
        console.log(res)
        toast.success("เพิ่มข้อมูลสำเร็จ")
      } else {
        const res = await PATCH_FAQ(Number(existingData?.id), payload)
        console.log(res)
        toast.success("อัปเดตข้อมูลสำเร็จ")
      }
      navigate("/faq")
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div className="top-24 z-20 col-span-2 mx-auto h-fit rounded-2xl border border-gray-200 bg-white transition duration-200 xl:sticky xl:col-span-1 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-2xl font-medium text-gray-800 dark:text-white/90">
          {mode === "create"
            ? "ฟอร์มเพิ่มคำถามที่พบบ่อย"
            : "ฟอร์มแก้ไขคำถามที่พบบ่อย"}
        </h3>
      </div>
      <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2">
              <label
                htmlFor="question"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                หัวข้อคำถาม
              </label>
              <div className="relative">
                <Input
                  id="question"
                  name="name"
                  value={faqsData.name}
                  onChange={handlerChange}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label
                htmlFor="question"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
              >
                รายละเอียด
              </label>
              <div className="relative">
                <QuillEditor
                  value={faqsData.answer}
                  onChange={value =>
                    setFAQsData(prev => ({ ...prev, answer: value }))
                  }
                />
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-between">
              <Button
                onClick={() => navigate("/faq")}
                variant="outline"
                isButton
              >
                <ArrowLeftIcon /> ย้อนกลับ
              </Button>
              <Button variant="primary">
                {mode === "create" ? "เพิ่มข้อมูล" : "อัปเดตข้อมูล"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
export default FAQsForm
