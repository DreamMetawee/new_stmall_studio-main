import { useEffect, useState } from "react"
import Input from "../../form/input/InputField"
import Label from "../../form/Label"
import Button from "../../ui/button/Button"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"
import ImageDrop from "../../form/input/ImageDrop"
import { OurStoreProps } from "../../../props/Page"
import { toast } from "react-toastify"
import TextArea from "../../form/input/TextArea"

type CreateFormProps = {
  reFetching: () => void
  onClose: () => void
  editData?: OurStoreProps
}

const CreateOurStoreForm: React.FC<CreateFormProps> = ({
  reFetching,
  onClose,
  editData,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState({
    name: false,
    address: false,
    phone: false,
    email: false,
    opening_hours: false,
    map_embed: false,
    image: false,
  })
  const [formData, setFormData] = useState<
    Pick<
      OurStoreProps,
      "name" | "address" | "phone" | "email" | "opening_hours" | "map_embed"
    >
  >({
    name: "",
    address: "",
    phone: "",
    email: "",
    opening_hours: "",
    map_embed: "",
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name || "",
        address: editData.address || "",
        phone: editData.phone || "",
        email: editData.email || "",
        opening_hours: editData.opening_hours || "",
        map_embed: editData.map_embed || "",
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
      address: formData.address.trim() === "",
      phone: formData.phone.trim() === "",
      email: formData.email.trim() === "",
      opening_hours: formData.opening_hours.trim() === "",
      map_embed: formData.map_embed.trim() === "",
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
      data.append("address", formData.address)
      data.append("phone", formData.phone)
      data.append("email", formData.email)
      data.append("opening_hours", formData.opening_hours)
      data.append("map_embed", formData.map_embed)
      if (selectedFile) data.append("image", selectedFile)

      setIsUploading(true)

      const url = editData
        ? `${API_ENDPOINT}${API_VERSION}pages/our-store/update/${editData.id}`
        : `${API_ENDPOINT}${API_VERSION}pages/our-store/create`

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

  return (
    <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {editData ? "แก้ไขข้อมูลร้านค้า" : "เพิ่มข้อมูลร้านค้า"}
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
                <Label>ชื่อร้านค้า</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  error={error.name}
                  hint={error.name ? "โปรดระบุชื่อร้านค้า" : ""}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>เบอร์โทรศัพท์</Label>
                <Input
                  type="text"
                  value={formData.phone}
                  name="phone"
                  onChange={onChangeInput}
                  error={error.phone}
                  hint={error.phone ? "โปรดระบุเบอร์โทรศัพท์" : ""}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>อีเมล</Label>
                <Input
                  type="text"
                  value={formData.email}
                  name="email"
                  onChange={onChangeInput}
                  error={error.email}
                  hint={error.email ? "โปรดระบุอีเมล" : ""}
                />
              </div>

              <div className="col-span-2">
                <Label>ลิงค์แผนที่</Label>
                <Input
                  type="text"
                  value={formData.map_embed}
                  name="map_embed"
                  onChange={onChangeInput}
                  error={error.map_embed}
                  hint={error.map_embed ? "โปรดระบุลิงค์แผนที่" : ""}
                />
              </div>

              <div className="col-span-2">
                <Label>เวลาทำการ</Label>
                <TextArea
                  placeholder=""
                  className="custom-scrollbar h-40 resize-none"
                  value={formData.opening_hours}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, opening_hours: e }))
                    validateField("opening_hours", e)
                  }}
                  error={error.opening_hours}
                  hint={error.opening_hours ? "โปรดระบุเวลาทำการ" : ""}
                />
              </div>

              <div className="col-span-2">
                <Label>ที่อยู่ร้านค้า</Label>
                <TextArea
                  placeholder=""
                  className="custom-scrollbar h-40 resize-none"
                  value={formData.address}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, address: e }))
                    validateField("address", e)
                  }}
                  error={error.address}
                  hint={error.address ? "โปรดระบุที่อยู่ร้านค้า" : ""}
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
              error.address ||
              error.phone ||
              error.email ||
              error.opening_hours ||
              error.map_embed
            }
            size="sm"
          >
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
export default CreateOurStoreForm
