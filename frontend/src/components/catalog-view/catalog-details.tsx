import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { getImageUrl } from "../../utils/helper"

import Button from "../ui/button/Button"
import { ArrowLeftIcon } from "../../icons"
import FileInput from "../form/input/FileInput"
import Input from "../form/input/InputField"

import { toast } from "react-toastify"
import { handleImageError } from "../../utils/image"
import { CatalogProps } from "../../props/Product"
import {
  CreateCatalogDetail,
  UpdateCatalogDetail,
} from "../../actions/catalog-details.action"
import ComboBox from "../ui/combobox/ComboBox"
import Label from "../form/Label"
import { MainCategoryProps } from "../../props/Groups"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"

interface CatalogViewDetailProps {
  mode: "create" | "edit"
  data?: Pick<CatalogProps, "id" | "image" | "name" | "category_id">
}

const CatalogViewDetail: React.FC<CatalogViewDetailProps> = ({
  mode,
  data,
}) => {
  const navigate = useNavigate()

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [mainCategory, setMainCategory] = useState<MainCategoryProps[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    number | undefined
  >(undefined) // เก็บ id ที่เลือก

  const handleFileChange = (file: File | null) => {
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else if (data?.image) {
      setPreview(getImageUrl("catalog", data?.image))
    } else {
      setPreview(null)
    }
  }

  // โหลดหมวดหมู่หลักจาก API ตอน mount component
  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const res = await AuthSending().get<MainCategoryProps[]>(
          `${API_ENDPOINT}${API_VERSION}groups/main-category`
        )
        setMainCategory(res.data)
      } catch (error) {
        console.error("Error loading main categories", error)
      }
    }
    fetchMainCategories()
  }, [mode, data])

  useEffect(() => {
    if (mode === "edit" && data) {
      setTitle(data.name)
      setPreview(getImageUrl("catalog", data.image))
      const selectedMC =
        mainCategory.find(i => i.id === data.category_id)?.id || undefined
      setSelectedCategoryId(selectedMC)
    }
  }, [data, mainCategory])

  const handlerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !selectedCategoryId) {
      toast.error("กรุณากรอกชื่อแคตตาล็อกและเลือกหมวดหมู่")
      return
    }
    const toastId = toast.loading("กำลังดำเนินการ")

    const formData = new FormData()
    formData.append("name", title.trim())
    formData.append("category_id", String(selectedCategoryId))
    if (imageFile) {
      formData.append("catalog_img", imageFile)
    }
    let response
    if (mode === "edit" && data?.id) {
      response = await UpdateCatalogDetail(data.id, formData)
    } else {
      response = await CreateCatalogDetail(formData)
    }

    if (response) {
      toast.update(toastId, {
        render: `${mode === "create" ? "เพิ่มข้อมูลสำเร็จ" : "อัปเดตข้อมูลสำเร็จ"}`,
        type: "success",
        isLoading: false,
        autoClose: 2000,
      })
      navigate(`/catalogs?mode=edit&v=${response.data.id}`)
    }
  }

  return (
    <div className="top-24 z-50 col-span-2 h-fit rounded-2xl border border-gray-200 bg-white transition duration-200 xl:sticky xl:col-span-1 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-6 py-5">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          {mode === "create" ? "ฟอร์มเพิ่มแคตตาล็อก" : "ฟอร์มแก้ไขแคตตาล็อก"}
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
                  ชื่อแคตตาล็อก
                </label>
                <div className="relative">
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>
                <div className="col-span-2 lg:col-span-1">
                  <Label>หมวดหมู่หลัก</Label>
                  <ComboBox
                    data={mainCategory}
                    onSelect={setSelectedCategoryId}
                    defaultId={selectedCategoryId}
                  />
                </div>
              </div>
              <div className="col-span-2 flex items-center justify-between">
                <Button
                  onClick={() => navigate("/catalogs")}
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
export default CatalogViewDetail
