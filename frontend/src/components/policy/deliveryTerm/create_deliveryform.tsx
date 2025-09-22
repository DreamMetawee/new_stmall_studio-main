import { useState } from "react"
import Button from "../../ui/button/Button"

import QuillEditor from "../../common/QuillEditor"
import { DeliveryTermProp } from "../../../props/Policy"

interface CreateDeliveryFormProps {
  isOpen: boolean
  onCreate: (newDelivery: DeliveryTermProp) => void
  onClose: () => void
}

const CreateDeliveryForm: React.FC<CreateDeliveryFormProps> = ({
  onCreate,
  onClose,
}) => {
  const [delivery_term_title, setTitle] = useState("")
  const [delivery_term_content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      id: 0, // or generate a unique ID here
      delivery_term_title,
      delivery_term_content,
      type: "delivery",
      created: new Date(),
      updated: new Date(),
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
      <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        สร้างนโยบายการจัดส่งใหม่
      </h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-gray-600 dark:text-gray-300"
          >
            หัวข้อ
          </label>
          <input
            type="text"
            id="title"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none"
            value={delivery_term_title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-gray-600 dark:text-gray-300"
          >
            รายละเอียด
          </label>
          <QuillEditor
            value={delivery_term_content}
            onChange={setContent}
            className="h-fit max-h-[400px] min-h-[150px] overflow-auto"
          />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button onClick={() => handleSubmit}>บันทึก</Button>
        </div>
      </form>
    </div>
  )
}

export default CreateDeliveryForm
