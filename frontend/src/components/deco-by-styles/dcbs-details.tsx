import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { getImageUrl } from "../../utils/helper"
import { DecoByStyleProps } from "../../props/DecoByStyle"
import Button from "../ui/button/Button"
import { ArrowLeftIcon } from "../../icons"
import FileInput from "../form/input/FileInput"
import Input from "../form/input/InputField"
import {
  CreateDecoByStyle,
  UpdateDecoByStyle,
} from "../../actions/decobystyles.action"
import { toast } from "react-toastify"
import { handleImageError } from "../../utils/image"

interface DecoByStyleDetailsProps {
  mode: "create" | "edit"
  data?: Pick<DecoByStyleProps, "id" | "image" | "name">
}

const DecoByStyleDetails: React.FC<DecoByStyleDetailsProps> = ({
  mode,
  data,
}) => {
  const navigate = useNavigate()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")

  const handleFileChange = (file: File | null) => {
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else if (data?.image) {
      setPreview(getImageUrl("decobystyles", data?.image))
    } else {
      setPreview(null)
    }
  }

  useEffect(() => {
    if (mode === "edit" && data) {
      setTitle(data.name)
      setPreview(getImageUrl("decobystyles", data.image))
    }
  }, [data])

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const toastId = toast.loading("กำลังดำเนินการ")

    const formData = new FormData()
    if (imageFile) formData.append("image", imageFile)
    formData.append("name", title)

    let response
    if (mode === "edit" && data?.id) {
      response = await UpdateDecoByStyle(data.id, formData)
    } else {
      response = await CreateDecoByStyle(formData)
    }

    if (response) {
      toast.update(toastId, {
        render: `${mode === "create" ? "เพิ่มข้อมูลสำเร็จ" : "อัปเดตข้อมูลสำเร็จ"}`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      })
      navigate(`/decobystyles?mode=edit&v=${response.id}`)
    }
  }

  return (
    <div className="top-24 z-20 col-span-2 h-fit rounded-2xl border border-gray-200 bg-white transition duration-200 xl:sticky xl:col-span-1 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {mode === "create"
            ? "ฟอร์มเพิ่มสินค้าตามสไตล์"
            : "ฟอร์มแก้ไขสินค้าตามสไตล์"}
        </h3>
      </div>
      <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
        <div className="space-y-6">
          <form onSubmit={handlerSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2">
                {preview && (
                  <div className="flex flex-col items-center">
                    <img
                      src={preview}
                      alt="preview"
                      className="mb-4 h-fit w-52 rounded-lg object-contain"
                      onError={e => handleImageError(e, "blank")}
                    />
                  </div>
                )}
                <label
                  htmlFor="image"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  รูปภาพ
                </label>
                <div className="relative">
                  <FileInput id="image" onChange={handleFileChange} />
                </div>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400"
                >
                  ชื่อหมวดหมู่สไตล์
                </label>
                <div className="relative">
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <Button
                  onClick={() => navigate("/decobystyles")}
                  variant="outline"
                  isButton
                >
                  <ArrowLeftIcon /> ย้อนกลับ
                </Button>
                <Button variant="primary">
                  {mode === "create" ? "เพิ่มข้อมูล" : "อัปเดตข้อมูล"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
export default DecoByStyleDetails
