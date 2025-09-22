import { useState } from "react"
import Button from "../../ui/button/Button"
import { CCTVPolicyProp } from "../../../props/Policy"
import QuillEditor from "../../common/QuillEditor"

interface EditCCTVFormProps {
  policy: CCTVPolicyProp
  onUpdate: (updatedPolicy: CCTVPolicyProp) => void
  onClose: () => void
}

const EditCCTVForm: React.FC<EditCCTVFormProps> = ({
  policy,
  onUpdate,
  onClose,
}) => {
  const [cctv_title, setTitle] = useState(policy.cctv_title)
  const [cctv_content, setContent] = useState(policy.cctv_content)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({
      id: policy.id,
      cctv_title,
      cctv_content,
      type: "CCTV",
      created: policy.created,
      updated: new Date(),
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
      <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        แก้นโยบายกล้องวงจรปิด
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
            value={cctv_title}
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
            value={cctv_content}
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

export default EditCCTVForm
