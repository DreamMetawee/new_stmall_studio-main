import { ChangeEvent, useEffect, useState } from "react"
import Button from "../../ui/button/Button"
import Label from "../../form/Label"
import Input from "../../form/input/InputField"
import { toast } from "react-toastify"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"
import { ProductTypeProps } from "../../../props/Groups"
import ComboBox from "../../ui/combobox/ComboBox"

interface CreateProductTypeFormProps {
  reFetching: () => void
  onClose: () => void
  editData?: ProductTypeProps
}

const CreateProductTypeForm: React.FC<CreateProductTypeFormProps> = ({
  reFetching,
  onClose,
  editData,
}) => {
  const [error, setError] = useState({ name: false, sub_category: false })
  const [subCategories, setSubCategories] = useState<
    { id: number; name: string }[]
  >([])
  const [formData, setFormData] = useState({
    name: "",
    sub_category: editData?.sub_category || subCategories[0]?.id,
  })

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData?.name,
        sub_category: editData?.sub_category,
      })
    }
  }, [])

  const validateField = (name: string, value: string) => {
    setError(prev => ({ ...prev, [name]: value.trim() === "" }))
  }

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    validateField(name, value)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError(prev => ({ ...prev, name: true }))
      return
    } else if (!formData.sub_category) {
      setError(prev => ({ ...prev, sub_category: true }))
      return
    }

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const url = editData
        ? `${API_ENDPOINT}${API_VERSION}groups/product-type/update/${editData.id}`
        : `${API_ENDPOINT}${API_VERSION}groups/product-type/create`

      const method = editData ? AuthSending().patch : AuthSending().post

      const response = await method(url, {
        name: formData.name.trim(),
        sub_category: formData.sub_category,
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

  function onSelected(id: number) {
    setFormData(prev => ({ ...prev, sub_category: id }))
    setError(prev => ({ ...prev, sub_category: false }))
  }

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await AuthSending().get(
          `${API_ENDPOINT}${API_VERSION}groups/sub-category`
        )
        setSubCategories(res.data)
      } catch (err) {
        console.error("Failed to fetch sub-categories:", err)
      }
    }

    fetchCatalog()
  }, [])

  return (
    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          {editData ? "แก้ไขประเภทสินค้า" : "เพิ่มประเภทสินค้า"}
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
                <Label>ชื่อประเภทสินค้า</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  className={`${
                    error.name ? "border-2 border-red-500" : ""
                  } mt-2`}
                />
                {error.name && (
                  <p className="text-xs text-red-500">
                    กรุณากรอกชื่อประเภทสินค้า
                  </p>
                )}
              </div>

              <div className="col-span-2 lg:col-span-2">
                <Label>เลือกหมวดหมู่ย่อย</Label>
                <ComboBox
                  data={subCategories}
                  onSelect={onSelected}
                  error={error.sub_category}
                  hint={error.sub_category ? "โปรดเลือกหมวดหมู่ย่อย" : ""}
                  defaultId={Number(formData.sub_category)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-4 pt-6">
          <Button disabled={error.name || error.sub_category} variant="primary">
            {editData ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มข้อมูล"}
          </Button>
          <Button isButton variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
        </div>
      </form>
    </div>
  )
}

export default CreateProductTypeForm
