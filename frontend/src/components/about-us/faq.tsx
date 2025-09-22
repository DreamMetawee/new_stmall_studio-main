import { useState, ChangeEvent, FormEvent } from "react"
import { toast } from "react-toastify"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import Button from "../ui/button/Button"


interface FAQFormProps {
  reFetching: () => void
  onClose: () => void
  isEdit?: boolean
  defaultData?: {
    id: number
    question: string
    answer: string
  }
}

const FAQForm: React.FC<FAQFormProps> = ({
  reFetching,
  onClose,
  isEdit,
  defaultData,
}) => {
  const [error, setError] = useState({ question: false, answer: false })
  const [formData, setFormData] = useState({
    question: defaultData?.question || "",
    answer: defaultData?.answer || "",
  })

  const validateField = (name: string, value: string) => {
    setError(prev => ({ ...prev, [name]: value.trim() === "" }))
  }

  const onChangeInput = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.question.trim() || !formData.answer.trim()) {
      setError({
        question: !formData.question.trim(),
        answer: !formData.answer.trim(),
      })
      return
    }

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const url = isEdit
        ? `${API_ENDPOINT}${API_VERSION}pages/faq/update/${defaultData?.id}`
        : `${API_ENDPOINT}${API_VERSION}pages/faq/create`

        const response = isEdit
          ? await AuthSending().patch(url, formData)
          : await AuthSending().post(url, formData)

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      } else {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      toast.update(toastId, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      reFetching()
      onClose()
    }
  }

  return (
    <div className="relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {isEdit ? "แก้ไขคำถามที่พบบ่อย" : "เพิ่มคำถามที่พบบ่อย"}
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="px-2 pb-3">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
              รายละเอียดคำถาม
            </h5>
            <div className="grid grid-cols-1 gap-y-5">
              <div>
                <Label>คำถาม</Label>
                <Input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={onChangeInput}
                  error={error.question}
                  hint={error.question ? "โปรดกรอกคำถาม" : ""}
                />
              </div>
              <div>
                <Label>คำตอบ</Label>
                <textarea
                className="w-full max-h-fit min-h-fit "
                  name="answer"
                  value={formData.answer}
                  onChange={onChangeInput}
                  rows={6}
                />
                {error.answer && <p className="mt-1 text-sm text-red-500">โปรดกรอกคำตอบ</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button size="sm">
            {isEdit ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มข้อมูล"}
          </Button>
          <Button isButton size="sm" variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  )
}

export default FAQForm
