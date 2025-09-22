import { ChangeEvent, useEffect, useState } from "react"
import Button from "../../ui/button/Button"
import Label from "../../form/Label"
import Input from "../../form/input/InputField"
import { toast } from "react-toastify"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"
import ComboBox from "../../ui/combobox/ComboBox"
import { MainCategoryProps, SubCategoryProps } from "../../../props/Groups"

interface CreateSubCategoryFormProps {
  reFetching: () => void
  onClose: () => void
  isEdit?: boolean
  editData?: SubCategoryProps
}

const CreateSubCategoryForm: React.FC<CreateSubCategoryFormProps> = ({
  reFetching,
  onClose,
  isEdit,
  editData,
}) => {
  const [error, setError] = useState<{
    name: boolean
    main_category: boolean
  }>({
    name: false,
    main_category: false,
  })
  const [mainCategory, setMainCategory] = useState<MainCategoryProps[]>([])

  const fetchAllMainCategory = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}groups/main-category`
      )
      setMainCategory(response.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchAllMainCategory()
  }, [])

  useEffect(() => {
    if (editData) {
      setFormData({
        name: editData.name,
        main_category: editData.main_category_id,
      })
    }
  }, [editData])

  const [formData, setFormData] = useState({
    name: editData?.name || "",
    main_category: editData?.main_category_id || mainCategory[0]?.id,
  })

  function onSelected(id: number) {
    setFormData(prev => ({ ...prev, main_category: id }))
    setError(prev => ({ ...prev, main_category: false }))
  }

  function validateField(name: any, value: string) {
    setError(prev => ({ ...prev, [name]: value.trim() === "" }))
  }

  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // validate real-time
    validateField(name, value)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError(prev => ({ ...prev, name: true }))
      return
    } else if (!formData.main_category) {
      setError(prev => ({ ...prev, main_category: true }))
      return
    }

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.main_category,
      }

      let response

      if (editData) {
        // แก้ไข
        response = await AuthSending().patch(
          `${API_ENDPOINT}${API_VERSION}groups/sub-category/update/${editData.id}`,
          payload
        )
      } else {
        // สร้างใหม่
        response = await AuthSending().post(
          `${API_ENDPOINT}${API_VERSION}groups/sub-category/create`,
          payload
        )
      }

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      } else throw new Error(response.data.message)
    } catch (error: any) {
      console.error(error.message)
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
          เพิ่มหมวดหมู่ย่อย
        </h4>
      </div>
      <form onSubmit={handleSave} className="flex flex-col">
        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
          <div className="mt-7">
            <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
              รายละเอียด
            </h5>

            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-2">
                <Label>ชื่อหมวดหมู่ย่อย</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  error={error.name}
                  hint={error.name ? "โปรดระบุชื่อหมวดหมู่ย่อย" : ""}
                />
              </div>

              <div className="col-span-2 lg:col-span-2">
                <Label>เลือกหมวดหมู่หลัก</Label>
                <ComboBox
                  data={mainCategory}
                  onSelect={onSelected}
                  error={error.main_category}
                  hint={error.main_category ? "โปรดเลือกหมวดหมู่หลัก" : ""}
                  defaultId={Number(formData.main_category)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button disabled={error.name || error.main_category} size="sm">
            {isEdit ? "บันทึกการเปลี่ยนแปลง" : "เพิ่มข้อมูล"}
          </Button>
          <Button isButton size="sm" variant="outline" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </form>
    </div>
  )
}
export default CreateSubCategoryForm
