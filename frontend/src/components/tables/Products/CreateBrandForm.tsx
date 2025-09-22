import { useEffect, useState } from "react"
import Input from "../../form/input/InputField"
import Label from "../../form/Label"
import Button from "../../ui/button/Button"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"
import ImageDrop from "../../form/input/ImageDrop"
import TextArea from "../../form/input/TextArea"
import { BrandProps } from "../../../props/Product"
import { toast } from "react-toastify"

type CreateBrandsFormProps = {
  reFetching: () => void
  onClose: () => void
  editBrand?: BrandProps
}

interface FormData {
  name: string
  unit: string // for website_link
  description: string
}

// ชื่ออย่างน้อย 3 ตัวอักษร และต้องเป็นภาษาอังกฤษ/ตัวเลข/บางสัญลักษณ์
const ENGLISH_REGEX = /^[A-Za-z0-9\s\-_.()]{3,}$/

const CreateBrandForm: React.FC<CreateBrandsFormProps> = ({
  reFetching,
  onClose,
  editBrand,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState({
    name: false,
    unit: false,
    description: false,
    image: false,
    nameNotEnglishOrShort: false,
  })
  const [formData, setFormData] = useState<FormData>({
    name: "",
    unit: "",
    description: "",
  })

  useEffect(() => {
    if (editBrand) {
      setFormData({
        name: editBrand.name || "",
        unit: editBrand.website_link || "",
        description: editBrand.brand_description || "",
      })
    }
  }, [editBrand])

  function validateField(field: string, value: string) {
    if (field === "name") {
      setError(prev => ({
        ...prev,
        name: value.trim() === "",
        nameNotEnglishOrShort:
          value.trim() !== "" && !ENGLISH_REGEX.test(value.trim()),
      }))
    } else {
      setError(prev => ({ ...prev, [field]: value.trim() === "" }))
    }
  }

  const onChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const isFormValid = (): boolean => {
    const nameEmpty = formData.name.trim() === ""
    const nameNotEnglishOrShort =
      formData.name.trim() !== "" && !ENGLISH_REGEX.test(formData.name.trim())
    const newErrors = {
      name: nameEmpty,
      nameNotEnglishOrShort,
      unit: formData.unit.trim() === "",
      description: formData.description.trim() === "",
      image: !selectedFile && !editBrand,
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
      data.append("unit", formData.unit)
      data.append("description", formData.description)
      if (selectedFile) data.append("image", selectedFile)

      setIsUploading(true)

      const url = editBrand
        ? `${API_ENDPOINT}${API_VERSION}brands/update/${editBrand.id}`
        : `${API_ENDPOINT}${API_VERSION}brands/create`

      const method = editBrand ? "patch" : "post"

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

  return (
    <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {editBrand ? "แก้ไขแบรนด์สินค้า" : "เพิ่มแบรนด์สินค้า"}
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
              รายละเอียดแบรนด์
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
                  error={error.name || error.nameNotEnglishOrShort}
                  hint={
                    error.name
                      ? "โปรดระบุชื่อแบรนด์"
                      : error.nameNotEnglishOrShort
                        ? "ชื่อแบรนด์ต้องเป็นภาษาอังกฤษ (อย่างน้อย 3 ตัวอักษร)"
                        : ""
                  }
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  ชื่อแบรนด์ต้องเป็นภาษาอังกฤษ (อย่างน้อย 3 ตัวอักษร)
                </p>
              </div>

              <div className="col-span-2">
                <Label>ลิงค์เว็บไซต์</Label>
                <Input
                  type="text"
                  value={formData.unit}
                  name="unit"
                  onChange={onChangeInput}
                  error={error.unit}
                  hint={error.unit ? "โปรดระบุลิงค์เว็บไซต์" : ""}
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
          <Button
            disabled={
              isUploading ||
              error.name ||
              error.unit ||
              error.description ||
              (error.image && !editBrand) ||
              error.nameNotEnglishOrShort
            }
            size="sm"
          >
            {isUploading
              ? "กำลังบันทึก..."
              : editBrand
                ? "บันทึกการเปลี่ยนแปลง"
                : "เพิ่มแบรนด์"}
          </Button>
          <Button isButton size="sm" variant="outline" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateBrandForm
