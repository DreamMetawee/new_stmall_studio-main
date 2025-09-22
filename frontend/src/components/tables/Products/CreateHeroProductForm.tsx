import { useEffect, useState } from "react"
import Input from "../../form/input/InputField"
import Label from "../../form/Label"
import Button from "../../ui/button/Button"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"
import ImageDrop from "../../form/input/ImageDrop"
import TextArea from "../../form/input/TextArea"
import { HeroProductProps } from "../../../props/Product"
import { toast } from "react-toastify"
import { Dropdown } from "../../ui/dropdown/Dropdown"
import Badge from "../../ui/badge/Badge"
import { DropdownItem } from "../../ui/dropdown/DropdownItem"

type CreateHeroProductFormProps = {
  reFetching: () => void
  onClose: () => void
  editHeroProduct?: HeroProductProps
}

interface FormData {
  name: string
  unit: string // for website_link
  description: string
  displayStatus: number
}

const CreateHeroProductForm: React.FC<CreateHeroProductFormProps> = ({
  reFetching,
  onClose,
  editHeroProduct,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState({
    name: false,
    unit: false,
    description: false,
    image: false,
  })
  const [formData, setFormData] = useState<FormData>({
    name: "",
    unit: "",
    description: "",
    displayStatus: 0,
  })

  const [isOpenDropdown, setIsOpenDropdown] = useState<boolean>(false)

  const closeDropdown = () => {
    setIsOpenDropdown(false)
  }

  useEffect(() => {
    if (editHeroProduct) {
      setFormData({
        name: editHeroProduct.name || "",
        unit: editHeroProduct.link || "", // adapt if `website_link` is available
        description: editHeroProduct.description || "",
        displayStatus: Number(editHeroProduct.status) || 0,
      })
    }
  }, [editHeroProduct])

  function validateField(name: any, value: string) {
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
      unit: formData.unit.trim() === "",
      description: formData.description.trim() === "",
      image: !selectedFile && !editHeroProduct,
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
      data.append("status", String(formData.displayStatus))
      if (selectedFile) data.append("image", selectedFile)

      setIsUploading(true)

      const url = editHeroProduct
        ? `${API_ENDPOINT}${API_VERSION}hero-products/update/${editHeroProduct.id}`
        : `${API_ENDPOINT}${API_VERSION}hero-products/create`

      const method = editHeroProduct ? "patch" : "post"

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
      reFetching()
    }
  }

  return (
    <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {`${editHeroProduct ? "แก้ไข" : "เพิ่ม"}สินค้าหลัก`}
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

              <div className="col-span-2 lg:col-span-1">
                <Label>ชื่อสินค้า</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  error={error.name}
                  hint={error.name ? "โปรดระบุชื่อสินค้า" : ""}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
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

              <div className="col-span-2">
                <Label>การมองเห็น</Label>
                <div className="relative">
                  <Button
                    isButton
                    size="sm"
                    variant="outline"
                    onClick={() => setIsOpenDropdown(prev => !prev)}
                    className="dropdown-toggle flex w-full items-center !justify-between text-gray-700 dark:text-gray-400"
                  >
                    <span className="text-theme-sm mr-1 block font-medium">
                      {formData.displayStatus === 1 ? (
                        <Badge color="success">แสดง</Badge>
                      ) : (
                        <Badge color="error">ไม่แสดง</Badge>
                      )}
                    </span>
                    <svg
                      className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
                        isOpenDropdown ? "rotate-180" : ""
                      }`}
                      width="18"
                      height="20"
                      viewBox="0 0 18 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Button>

                  <Dropdown
                    isOpen={isOpenDropdown}
                    onClose={closeDropdown}
                    className="shadow-theme-lg dark:bg-gray-dark absolute left-0 flex w-full flex-col rounded-2xl border border-gray-200 bg-white px-3 dark:border-gray-800"
                  >
                    <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                      <li>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayStatus: 1,
                            }))
                            closeDropdown()
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          <Badge color="success">แสดง</Badge>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayStatus: 0,
                            }))
                            closeDropdown()
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          <Badge color="error">ไม่แสดง</Badge>
                        </DropdownItem>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
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
              (error.image && !editHeroProduct)
            }
            size="sm"
          >
            {isUploading
              ? "กำลังบันทึก..."
              : editHeroProduct
                ? "บันทึกการเปลี่ยนแปลง"
                : "เพิ่มสินค้า"}
          </Button>
          <Button isButton size="sm" variant="outline" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </form>
    </div>
  )
}
export default CreateHeroProductForm
