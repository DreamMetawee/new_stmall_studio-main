import { toast } from "react-toastify"
import { HowToOrderProps } from "../../props/HowToOrder"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import Button from "../ui/button/Button"
import { ArrowLeftIcon } from "../../icons"
import QuillEditor from "../common/QuillEditor"
import Input from "../form/input/InputField"
import {
  PATCH_HOW_TO_ORDER,
  POST_HOW_TO_ORDER,
} from "../../actions/how-to-order.action"
import Label from "../form/Label"
import FileInput from "../form/input/FileInput"
import { handleImageError } from "../../utils/image"
import { PUBLIC_STATIC } from "../../utils/meta"
import ResponsiveImage from "../ui/images/ResponsiveImage"

interface HowToOrderFormProps {
  mode: "create" | "edit"
  existingData?: HowToOrderProps
}

const HowToOrderForm: React.FC<HowToOrderFormProps> = ({
  mode,
  existingData,
}) => {
  const navigate = useNavigate()

  const [howToOrderData, setHowToOrderData] = useState({
    name: "",
    sub_name: "",
    description: "",
  })

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (mode === "edit" && existingData) {
      setHowToOrderData({
        name: existingData.name,
        sub_name: existingData.sub_name,
        description: existingData.description,
      })
    }
  }, [existingData, mode])

  const handlerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setHowToOrderData(prev => ({ ...prev, [name]: value }))
  }

  const createPreview = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (file: File | null) => {
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB")
        return
      }
      // Check file type
      if (
        !["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          file.type
        )
      ) {
        toast.error("รองรับเฉพาะไฟล์รูปภาพประเภท JPG, PNG, GIF, WEBP")
        return
      }
      setSelectedFile(file)
      createPreview(file)
    } else {
      setSelectedFile(null)
      setPreviewImage(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (
      !howToOrderData.name ||
      !howToOrderData.sub_name ||
      !howToOrderData.description
    ) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน")
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("name", howToOrderData.name)
      formData.append("sub_name", howToOrderData.sub_name)
      formData.append("description", howToOrderData.description)

      if (selectedFile) {
        formData.append("image", selectedFile)
      }

      let res

      if (mode === "edit" && existingData) {
        res = await PATCH_HOW_TO_ORDER(Number(existingData.id), formData)
      } else {
        res = await POST_HOW_TO_ORDER(formData)
      }

      if (res) {
        toast.success(
          mode === "create" ? "เพิ่มข้อมูลสำเร็จ" : "อัปเดตข้อมูลสำเร็จ"
        )
        navigate("/howto-order")
      } else {
        toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast.error("เกิดข้อผิดพลาดในการส่งข้อมูล")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="top-24 z-20 col-span-2 mx-auto h-fit max-w-3xl rounded-2xl border border-gray-200 bg-white transition duration-200 xl:sticky xl:col-span-1 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-2xl font-medium text-gray-800 dark:text-white/90">
          {mode === "create"
            ? "ฟอร์มเพิ่มขั้นตอนการสั่งซื้อ"
            : "ฟอร์มแก้ไขขั้นตอนการสั่งซื้อ"}
        </h3>
      </div>
      <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>รูปภาพขั้นตอนการสั่งซื้อ</Label>
                {previewImage ? (
                  <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : existingData?.image ? (
                  <ResponsiveImage
                    src={`${PUBLIC_STATIC}hto-image/${existingData.image}`}
                    alt={existingData.name}
                    className="max-w-sm"
                    onError={e => handleImageError(e, "blank")}
                  />
                ) : (
                  <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <p className="text-gray-500 dark:text-gray-400">
                      ไม่มีรูปภาพ
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label>อัปโหลดรูปภาพใหม่</Label>
                <FileInput onChange={handleFileChange} />
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  ไฟล์รูปภาพที่รองรับ: JPG, PNG, GIF ขนาดไม่เกิน 5MB
                </p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <Label>หัวข้อขั้นตอนสั่งซื้อ</Label>
              <Input
                id="name"
                name="name"
                value={howToOrderData.name}
                onChange={handlerChange}
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <Label>หัวข้อย่อย</Label>
              <Input
                id="sub_name"
                name="sub_name"
                value={howToOrderData.sub_name}
                onChange={handlerChange}
              />
            </div>

            <div className="col-span-2">
              <Label>รายละเอียดขั้นตอนการสั่งซื้อ</Label>
              <QuillEditor
                value={howToOrderData.description}
                onChange={value =>
                  setHowToOrderData(prev => ({
                    ...prev,
                    description: value,
                  }))
                }
              />
            </div>

            <div className="col-span-2 flex items-center justify-between">
              <Button
                onClick={() => navigate("/howto-order")}
                variant="outline"
                isButton
                disabled={isSubmitting}
              >
                <ArrowLeftIcon /> ย้อนกลับ
              </Button>
              <Button variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? "กำลังประมวลผล..."
                  : mode === "create"
                    ? "เพิ่มข้อมูล"
                    : "อัปเดตข้อมูล"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HowToOrderForm
