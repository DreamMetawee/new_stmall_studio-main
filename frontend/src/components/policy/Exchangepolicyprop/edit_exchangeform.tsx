import { useState } from "react"
import Button from "../../ui/button/Button"
import { ExchangePolicyProp } from "../../../props/Policy"
import QuillEditor from "../../common/QuillEditor"

interface EditExchangePolicyFormProps {
  policy: ExchangePolicyProp
  onUpdate: (updatedPolicy: ExchangePolicyProp) => void
  onClose: () => void
}

const EditExchangePolicyForm: React.FC<EditExchangePolicyFormProps> = ({
  policy,
  onUpdate,
  onClose,
}) => {
  const [exchange_title, setTitle] = useState(policy.exchange_title)
  const [exchange_content, setContent] = useState(policy.exchange_content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      id: policy.id,
      exchange_title,
      exchange_content,
      type: "exchange",
      created: policy.created,
      updated: new Date(),
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
      <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        แก้นโยบายการแลกเปลี่ยน
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
            value={exchange_title}
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
            value={exchange_content}
            onChange={e => setContent(e)}
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

export default EditExchangePolicyForm
