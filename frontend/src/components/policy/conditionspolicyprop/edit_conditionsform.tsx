import { useState } from "react"
import Button from "../../ui/button/Button"
import { ConditionPolicyProp } from "../../../props/Policy"
import QuillEditor from "../../common/QuillEditor"

interface EditConditionFormProps {
  policy: ConditionPolicyProp
  onUpdate: (updatedPolicy: ConditionPolicyProp) => void
  onClose: () => void
}

const EditConditionForm: React.FC<EditConditionFormProps> = ({
  policy,
  onUpdate,
  onClose,
}) => {
  const [condition_title, setTitle] = useState(policy.condition_title)
  const [condition_content, setContent] = useState(policy.condition_content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      id: policy.id,
      condition_title,
      condition_content,
      type: "condition",
      created: policy.created,
      updated: new Date(),
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
      <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        แก้นโยบายเงื่อนไข
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
            value={condition_title}
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
            value={condition_content}
            onChange={e => setContent(e)}
            className="h-fit min-h-[150px] max-h-[400px] overflow-auto"
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

export default EditConditionForm
