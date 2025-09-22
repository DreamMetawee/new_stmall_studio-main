import { useEffect, useState } from "react"
import Input from "../../form/input/InputField"
import Label from "../../form/Label"
import Button from "../../ui/button/Button"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"
import ImageDrop from "../../form/input/ImageDrop"
import { SaleTeamProps } from "../../../props/Page"
import { toast } from "react-toastify"
import TextArea from "../../form/input/TextArea"
import ComboBox from "../../ui/combobox/ComboBox"

type CreateFormProps = {
  reFetching: () => void
  onClose: () => void
  editData?: SaleTeamProps
}

const CreateEmployeeForm: React.FC<CreateFormProps> = ({
  reFetching,
  onClose,
  editData,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState({
    name: false,
    position: false,
    description: false,
    image: false,
  })
  const [formData, setFormData] = useState<
    Pick<SaleTeamProps, "name" | "position" | "description">
  >({
    name: "",
    position: "",
    description: "",
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        position: editData.position || "",
        description: editData.description || "",
      })
    }
  }, [editData])

  const validateField = (name: string, value: string) => {
    setError(prev => ({ ...prev, [name]: value.trim() === "" }))
  }

  const onChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const isFormValid = (): boolean => {
    const newErrors = {
      name: formData.name.trim() === "",
      position: formData.position.trim() === "",
      description: formData.description.trim() === "",
      image: !selectedFile && !editData,
    }

    setError(newErrors)

    return !Object.values(newErrors).some(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid()) return
    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const data = new FormData()
      data.append("name", formData.name)
      data.append("position", formData.position)
      data.append("description", formData.description)
      if (selectedFile) data.append("image", selectedFile)

      setIsUploading(true)

      const url = editData
        ? `${API_ENDPOINT}${API_VERSION}pages/sale-team/update/${editData.id}`
        : `${API_ENDPOINT}${API_VERSION}pages/sale-team/create`

      const method = editData ? "patch" : "post"

      const response = await AuthSending()[method](url, data, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        reFetching()
        onClose()
      } else throw new Error(response.data.message)
    } catch (error: any) {
      console.error(error)
      toast.update(toastId, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const positionOptions = [
    // thai lang
    { id: 1, name: "กรรมการผู้จัดการ" },
    { id: 2, name: "รองกรรมการผู้จัดการ" },
    { id: 3, name: "ผู้จัดการฝ่ายขาย" },
    { id: 4, name: "ฝ่ายขาย" },
  ]

  return (
    <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {editData ? "แก้ไขข้อมูลฝ่ายขาย" : "เพิ่มข้อมูลฝ่ายขาย"}
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
              รายละเอียด
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2">
                <Label>รูปภาพ</Label>
                <ImageDrop
                  onChange={file => {
                    setSelectedFile(file)
                    setError(prev => ({ ...prev, image: false }))
                  }}
                />
                {error.image && (
                  <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                    โปรดเลือกไฟล์รูปภาพ
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label>ชื่อ</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  error={error.name}
                  hint={error.name ? "โปรดระบุชื่อบริษัท" : ""}
                />
              </div>

              <div className="col-span-2">
                <Label>ตำแหน่ง</Label>
                <ComboBox
                  data={positionOptions}
                  onSelect={id =>
                    setFormData(prev => ({
                      ...prev,
                      position:
                        positionOptions.find(i => i.id === id)?.name || "",
                    }))
                  }
                  defaultId={
                    Number(
                      positionOptions.find(i => i.name === formData.position)
                        ?.id
                    ) || undefined
                  }
                />
              </div>

              <div className="col-span-2">
                <Label>รายละเอียด</Label>
                <TextArea
                  placeholder=""
                  className="custom-scrollbar h-40 resize-none"
                  value={formData.description}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, description: e }))
                    validateField("description", e)
                  }}
                  error={error.description}
                  hint={error.description ? "โปรดระบุรายละเอียด" : ""}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button disabled={isUploading || error.name || error.position}>
            {isUploading
              ? "กำลังบันทึก..."
              : editData
                ? "บันทึกการเปลี่ยนแปลง"
                : "เพิ่มข้อมูล"}
          </Button>
          <Button isButton size="sm" variant="outline" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </form>
    </div>
  )
}
export default CreateEmployeeForm
