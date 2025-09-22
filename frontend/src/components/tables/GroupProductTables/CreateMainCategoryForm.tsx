import { ChangeEvent, useState, useRef } from "react"
import Button from "../../ui/button/Button"
import Label from "../../form/Label"
import Input from "../../form/input/InputField"
import { toast } from "react-toastify"
import { AuthSending } from "../../../utils/api"
import {
  API_ENDPOINT,
  API_VERSION,
  IS_PEDDING_TEXT,
  PUBLIC_STATIC,
} from "../../../utils/meta"

interface CreateMainCategoryFormProps {
  reFetching: () => void
  onClose: () => void
  isEdit?: boolean
  defaultData?: {
    id: number
    name: string
    icon?: string
  }
}

const CreateMainCategoryForm: React.FC<CreateMainCategoryFormProps> = ({
  reFetching,
  onClose,
  isEdit,
  defaultData,
}) => {
  const [error, setError] = useState({ name: false, icon: false })
  const [formData, setFormData] = useState({
    name: defaultData?.name || "",
    icon: null as File | null,
    iconPreview: defaultData?.icon
      ? `${PUBLIC_STATIC}category-icons/${defaultData.icon}` // Full URL for existing icons
      : "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateField = (name: string, value: string) => {
    setError(prev => ({ ...prev, [name]: value.trim() === "" }))
  }

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (file) {
      // Validate file type
      if (!file.type.match("image.*")) {
        toast.error("กรุณาเลือกไฟล์รูปภาพเท่านั้น")
        return
      }

      // Validate file size (e.g., 2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("ขนาดไฟล์ต้องไม่เกิน 2MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          icon: file,
          iconPreview: reader.result as string,
        }))
      }
      reader.readAsDataURL(file)
      setError(prev => ({ ...prev, icon: false }))
    } else {
      setFormData(prev => ({
        ...prev,
        icon: null,
        iconPreview:
          isEdit && defaultData?.icon
            ? `${API_ENDPOINT}${defaultData.icon}`
            : "",
      }))
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError(prev => ({ ...prev, name: true }))
      return
    }

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const url = isEdit
        ? `${API_ENDPOINT}${API_VERSION}groups/main-category/update/${defaultData?.id}`
        : `${API_ENDPOINT}${API_VERSION}groups/main-category/create`

      const method = isEdit ? AuthSending().patch : AuthSending().post

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name.trim())

      // Only append icon if it's a new file in edit mode or creating new
      if (formData.icon) {
        formDataToSend.append("icon", formData.icon)
      } else if (!isEdit) {
        // Handle case when creating new without icon (if required)
        // formDataToSend.append("icon", "") or skip if optional
      }

      const response = await method(url, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      } else throw new Error(response.data.message)
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
    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {isEdit ? "แก้ไขหมวดหมู่หลัก" : "เพิ่มหมวดหมู่หลัก"}
        </h4>
      </div>
      <form onSubmit={handleSave} className="flex flex-col">
        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
              รายละเอียด
            </h5>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2">
                <Label>ชื่อหมวดหมู่หลัก</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  error={error.name}
                  hint={error.name ? "โปรดระบุชื่อหมวดหมู่" : ""}
                />
              </div>

              <div className="col-span-2">
                <Label>ไอคอนหมวดหมู่</Label>

                {/* Preview Section */}
                {formData.iconPreview && (
                  <div className="mb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <img
                          src={formData.iconPreview}
                          alt="Icon preview"
                          className="h-full w-full object-contain p-1"
                          onError={e => {
                            // Fallback if image fails to load
                            ;(e.target as HTMLImageElement).style.display =
                              "none"
                          }}
                        />
                      </div>
                    </div>
                    {isEdit && !formData.icon && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        กำลังใช้ไอคอนปัจจุบัน
                      </p>
                    )}
                  </div>
                )}

                {/* Upload Field */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`focus:border-ring-brand-300 shadow-theme-xs focus:file:ring-brand-300 h-11 w-full overflow-hidden rounded-lg border border-gray-300 bg-transparent text-sm text-gray-500 transition-colors file:mr-5 file:border-collapse file:cursor-pointer file:rounded-l-lg file:border-0 file:border-r file:border-solid file:border-gray-200 file:bg-gray-50 file:py-3 file:pr-3 file:pl-3.5 file:text-sm file:text-gray-700 placeholder:text-gray-400 hover:file:bg-gray-100 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:file:border-gray-800 dark:file:bg-white/[0.03] dark:file:text-gray-400 dark:placeholder:text-gray-400 ${
                      error.icon ? "border-red-500" : ""
                    }`}
                  />
                  {error.icon && (
                    <p className="mt-1 text-sm text-red-500">
                      โปรดอัปโหลดไอคอน
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    รูปภาพควรเป็นสแควร์และขนาดไม่เกิน 2MB
                    <br />
                    รองรับไฟล์: JPG, PNG, SVG
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button disabled={error.name} size="sm">
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

export default CreateMainCategoryForm
