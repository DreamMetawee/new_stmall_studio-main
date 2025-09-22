import { useState } from "react"
import Button from "../../ui/button/Button"
import { cookiePolicyProps } from "../../../props/Policy"
import QuillEditor from "../../common/QuillEditor"

interface CreateCookiePolicyFormProps {
  onCreate: (newPolicy: cookiePolicyProps) => void
  onClose: () => void
}

const CreateCookiePolicyForm: React.FC<CreateCookiePolicyFormProps> = ({
  onCreate,
  onClose,
}) => {
  const [cookie_title, setTitle] = useState("")
  const [cookie_content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({
      id:Date.now() ,
      cookie_title,
      cookie_content,
      created: new Date(),
      updated: new Date(),
      type: "cookie",
    })
  }

  return (
    <div className="rounded-3xl bg-white p-6 dark:bg-gray-900">
      <h4 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">
        สร้างนโยบายคุกกี้ใหม่
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
            value={cookie_title}
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
            value={cookie_content}
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

export default CreateCookiePolicyForm
