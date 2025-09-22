import { useEffect, useState } from "react"
import QuillEditor from "../common/QuillEditor"
import Input from "../form/input/InputField"
import Label from "../form/Label"
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"
import ComboBox from "../ui/combobox/ComboBox"
import { Dropdown } from "../ui/dropdown/Dropdown"
import { DropdownItem } from "../ui/dropdown/DropdownItem"
import {
  API_ENDPOINT,
  API_VERSION,
  IS_PEDDING_TEXT,
  PUBLIC_STATIC,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { toast } from "react-toastify"
import { ArrowLeftIcon } from "../../icons"
import { useNavigate } from "react-router"
import ResponsiveImage from "../ui/images/ResponsiveImage"
import { handleImageError } from "../../utils/image"
import FileInput from "../form/input/FileInput"
import {
  MainCategoryProps,
  ProductTypeProps,
  SubCategoryProps,
} from "../../props/Groups"

interface FormDataProps {
  id?: number
  name: string
  unit: string
  description: string
  price: string
  discountPrice: string
  productType: string
  displayType: "TYPE_1" | "TYPE_2" | "TYPE_3" | "TYPE_4" | "TYPE_5"
  displayStatus: string
  mainCategory: string
  subCategory: string
  brand: string
  imageUrl?: string
  productLink?: string | null
  currency?: string
  reviews?: number
  weight: string
  size: string
}

interface SizeInput {
  width: string
  length: string
  height: string
}

interface MainProductFormProps {
  mode: "create" | "edit" | "view"
  existingData?: any
}

// --- REGEX ---
const NAME_REGEX = /^[\u0E00-\u0E7Fa-zA-Z0-9\s\-_.()]{3,}$/
const UNIT_REGEX = /^.{1,}$/ // at least 1 character

const MainProductForm: React.FC<MainProductFormProps> = ({
  mode = "create",
  existingData,
}) => {
  const navigate = useNavigate()

  type DropdownKey = keyof typeof initialState

  const initialState = {
    displayStatus: false,
    displayType: false,
  }

  const [error, setError] = useState({
    name: false,
    nameNotValid: false,
    unit: false,
    description: false,
    image: false,
    price: false,
    size: false,
    weight: false,
  })

  const [isOpenDropdown, setIsOpenDropdown] = useState(initialState)

  const toggleDropdown = (key: DropdownKey) => {
    setIsOpenDropdown(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const closeDropdown = (key: DropdownKey) => {
    setIsOpenDropdown(prev => ({ ...prev, [key]: false }))
  }

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState<FormDataProps>({
    name: "",
    unit: "",
    description: "",
    price: "0",
    discountPrice: "0",
    productType: "",
    displayType: "TYPE_1",
    displayStatus: "1",
    mainCategory: "",
    subCategory: "",
    brand: "",
    weight: "0",
    size: "",
  })

  const [sizeInput, setSizeInput] = useState<SizeInput>({
    width: "",
    length: "",
    height: "",
  })

  const [mainCategory, setMainCategory] = useState<MainCategoryProps[]>([])
  const [subCategory, setSubCategory] = useState<SubCategoryProps[]>([])
  const [productType, setProductType] = useState<ProductTypeProps[]>([])
  const [brands, setBrands] = useState([])

  const initialOptions = async () => {
    try {
      const mainCategory = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}groups/main-category`
      )
      const subCategory = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}groups/sub-category`
      )
      const productType = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}groups/product-type`
      )
      const brands = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}brands`
      )
      setMainCategory(mainCategory.data || [])
      setSubCategory(subCategory.data || [])
      setProductType(productType.data || [])
      setBrands(brands.data || [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    initialOptions()
  }, [])

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  // ฟังก์ชันสำหรับสร้าง URL ภาพ preview
  const createPreview = (file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (existingData) {
      setFormData({
        name: existingData.name || "",
        unit: existingData.unitname || "",
        description: existingData.description || "",
        price: existingData.price?.toString() || "",
        discountPrice: existingData.regular_price?.toString() || "",
        displayType: existingData.product_type || "TYPE_1",
        displayStatus: existingData.status ? "1" : "0",
        mainCategory: existingData.type?.categorysub?.category_id || "",
        subCategory: existingData.type?.categorysub?.id || "",
        productType: existingData.type?.id || "",
        brand: existingData.brand_id || "",
        weight:
          existingData.weight !== undefined && existingData.weight !== null
            ? String(existingData.weight)
            : "0",
        size: existingData.size || "",
      })
      // parse size string to width, length, height
      let width = "",
        length = "",
        height = ""
      if (existingData.size && typeof existingData.size === "string") {
        ;[width, length, height] = existingData.size.split("x")
      }
      setSizeInput({
        width: width || "",
        length: length || "",
        height: height || "",
      })
      if (existingData.image_url) {
        setPreviewImage(`${PUBLIC_STATIC}products/${existingData.image_url}`)
      }
    }
  }, [existingData])

  // Validate ขนาด 3 ช่อง
  const validateSize = (values: SizeInput) => {
    return (
      values.width.trim() !== "" &&
      values.length.trim() !== "" &&
      values.height.trim() !== "" &&
      !isNaN(Number(values.width)) &&
      !isNaN(Number(values.length)) &&
      !isNaN(Number(values.height)) &&
      Number(values.width) > 0 &&
      Number(values.length) > 0 &&
      Number(values.height) > 0
    )
  }

  const onChangeSize = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const newSize = { ...sizeInput, [name]: value }
    setSizeInput(newSize)
    setFormData(prev => ({
      ...prev,
      size: `${newSize.width}x${newSize.length}x${newSize.height}`,
    }))
    setError(prev => ({
      ...prev,
      size: !validateSize(newSize),
    }))
  }

  const handleFileChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file)
      setError(prev => ({ ...prev, image: false }))
      createPreview(file) // สร้าง preview เมื่อเลือกไฟล์ใหม่
    } else {
      setSelectedFile(null)
      setPreviewImage(null) // ลบ preview เมื่อไม่มีไฟล์
    }
  }

  const validateField = (name: string, value: string) => {
    switch (name) {
      case "name":
        setError(prev => ({
          ...prev,
          name: value.trim() === "",
          nameNotValid: value.trim() !== "" && !NAME_REGEX.test(value.trim()),
        }))
        break
      case "unit":
        setError(prev => ({
          ...prev,
          unit: value.trim() === "" || !UNIT_REGEX.test(value.trim()),
        }))
        break
      case "weight":
        setError(prev => ({
          ...prev,
          weight:
            value.trim() === "" || isNaN(Number(value)) || Number(value) < 0,
        }))
        break
      case "description":
        setError(prev => ({
          ...prev,
          description: value.trim() === "",
        }))
        break
      case "discountPrice":
      case "price": {
        const price = parseFloat(name === "price" ? value : formData.price) || 0
        const discountPrice =
          parseFloat(
            name === "discountPrice" ? value : formData.discountPrice
          ) || 0
        setError(prev => ({
          ...prev,
          price: discountPrice > price,
        }))
        break
      }
      default:
        break
    }
  }

  const onChangeInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    validateField(name, value)
    setFormData(prev => ({ ...prev, [name]: value }))

    // ตรวจสอบราคาโปรโมชั่นไม่ให้น้อยกว่าราคาปกติ
    if (name === "discountPrice" || name === "price") {
      const price = parseFloat(name === "price" ? value : formData.price) || 0
      const discountPrice =
        parseFloat(name === "discountPrice" ? value : formData.discountPrice) ||
        0

      if (discountPrice > price) {
        setError(prev => ({ ...prev, price: true }))
        toast.error("ราคาโปรโมชั่นต้องต้องน้อยกว่าราคาปกติเท่านั้น")
        return
      } else {
        setError(prev => ({ ...prev, price: false }))
      }
    }
  }

  // ตรวจสอบฟิลด์ทั้งหมดก่อน submit
  const validateAllFields = () => {
    const nameEmpty = formData.name.trim() === ""
    const nameNotValid =
      formData.name.trim() !== "" && !NAME_REGEX.test(formData.name.trim())
    const unitError =
      formData.unit.trim() === "" || !UNIT_REGEX.test(formData.unit.trim())
    const descriptionError = formData.description.trim() === ""
    const price = parseFloat(formData.price) || 0
    const discountPrice = parseFloat(formData.discountPrice) || 0
    const priceError = discountPrice > price
    const sizeError = !validateSize(sizeInput)
    const weightError =
      formData.weight.trim() === "" ||
      isNaN(Number(formData.weight)) ||
      Number(formData.weight) < 0
    const imageError = !selectedFile && !existingData

    setError({
      name: nameEmpty,
      nameNotValid,
      unit: unitError,
      description: descriptionError,
      price: priceError,
      size: sizeError,
      weight: weightError,
      image: imageError,
    })

    // ถ้ามี error ใดๆ return false
    return !(
      nameEmpty ||
      nameNotValid ||
      unitError ||
      descriptionError ||
      priceError ||
      sizeError ||
      weightError ||
      imageError
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAllFields()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง")
      return
    }

    const price = parseFloat(formData.price) || 0
    const discountPrice = parseFloat(formData.discountPrice) || 0

    if (discountPrice > price) {
      toast.error("ราคาโปรโมชั่นต้องต้องน้อยกว่าราคาปกติเท่านั้น")
      setError(prev => ({ ...prev, price: true }))
      return
    }

    const toastId = toast.loading(IS_PEDDING_TEXT)
    try {
      const data = new FormData()
      data.append("name", formData.name)
      data.append("unit", formData.unit)
      data.append("description", formData.description)
      data.append("price", formData.price)
      data.append("discountPrice", formData.discountPrice)
      data.append("productType", formData.productType)
      data.append("displayType", formData.displayType)
      data.append("displayStatus", formData.displayStatus)
      data.append("brand", formData.brand)
      data.append("weight", formData.weight)
      data.append(
        "size",
        `${sizeInput.width}x${sizeInput.length}x${sizeInput.height}`
      )

      if (selectedFile) data.append("image", selectedFile)

      setIsUploading(true)

      const url = existingData
        ? `${API_ENDPOINT}${API_VERSION}products/update/${existingData.id}`
        : `${API_ENDPOINT}${API_VERSION}products/create`

      const method = existingData ? "patch" : "post"

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

        if (mode === "create") {
          navigate("/products")
          setTimeout(() => {
            navigate("/products?mode=create")
          }, 500)
        }
      } else throw new Error(response.data.message)
    } catch (error: any) {
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
    <div className="relative mx-auto w-full max-w-[960px] rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="mb-6 px-2">
        <h4 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
          {mode === "create"
            ? "เพิ่มข้อมูลสินค้าใหม่"
            : mode === "edit"
              ? "แก้ไขข้อมูลสินค้า"
              : "รายละเอียดสินค้า"}
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="pb-20">
          <div className="mt-7">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label>รูปภาพสินค้า{existingData ? "ปัจจุบัน" : ""}</Label>
                  {previewImage ? (
                    <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : existingData?.image_url ? (
                    <ResponsiveImage
                      src={`${PUBLIC_STATIC}products/${existingData.image_url}`}
                      alt={existingData.name}
                      className="max-w-sm"
                      onError={e => handleImageError(e, "product")}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                      <p className="text-gray-500 dark:text-gray-400">
                        ไม่มีรูปภาพ
                      </p>
                    </div>
                  )}
                  {error.image && (
                    <p className="text-error-400 mt-2 text-sm">
                      กรุณาอัปโหลดรูปภาพสินค้า
                    </p>
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

              <div className="col-span-2 lg:col-span-1">
                <Label>หมวดหมู่หลัก</Label>
                <ComboBox
                  data={mainCategory}
                  onSelect={val =>
                    setFormData(prev => ({
                      ...prev,
                      mainCategory: String(val),
                    }))
                  }
                  defaultId={Number(formData?.mainCategory)}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>หมวดหมู่ย่อย</Label>
                <ComboBox
                  data={subCategory.filter(
                    i =>
                      Number(i.main_category_id) ===
                      Number(formData.mainCategory)
                  )}
                  onSelect={val =>
                    setFormData(prev => ({ ...prev, subCategory: String(val) }))
                  }
                  defaultId={Number(formData?.subCategory)}
                  disabled={!formData.mainCategory || mode === "view"}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>ประเภทสินค้า</Label>
                <ComboBox
                  data={productType.filter(
                    i => Number(i.sub_category) === Number(formData.subCategory)
                  )}
                  onSelect={val =>
                    setFormData(prev => ({ ...prev, productType: String(val) }))
                  }
                  defaultId={Number(formData?.productType)}
                  disabled={!formData.subCategory || mode === "view"}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>แบรนด์สินค้า</Label>
                <ComboBox
                  data={brands}
                  onSelect={val =>
                    setFormData(prev => ({ ...prev, brand: String(val) }))
                  }
                  defaultId={Number(existingData?.brand_id)}
                  disabled={mode === "view"}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>ชื่อสินค้า</Label>
                <Input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={onChangeInput}
                  disabled={mode === "view"}
                  error={error.name || error.nameNotValid}
                  hint={
                    error.name
                      ? "กรุณาระบุชื่อสินค้า"
                      : error.nameNotValid
                        ? "ชื่อสินค้าต้องเป็นภาษาไทยหรือภาษาอังกฤษ (อย่างน้อย 3 ตัวอักษร)"
                        : ""
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>หน่วย</Label>
                <Input
                  type="text"
                  value={formData.unit}
                  name="unit"
                  onChange={onChangeInput}
                  disabled={mode === "view"}
                  error={error.unit}
                  hint={error.unit ? "กรุณาระบุหน่วยสินค้า" : ""}
                />
              </div>

              <div className="col-span-2">
                <Label>รายละเอียดสินค้า</Label>
                <QuillEditor
                  value={formData.description}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, description: e }))
                    validateField("description", e)
                  }}
                  className="h-fit min-h-[150px]"
                />
                {error.description && (
                  <p className="text-error-400 mt-1 text-sm">
                    กรุณาระบุรายละเอียดสินค้า
                  </p>
                )}
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label className="text-success-400">ราคาปกติ</Label>
                <div className="relative">
                  <Input
                    type="number"
                    className="pr-[62px]"
                    value={formData.price}
                    name="price"
                    onChange={onChangeInput}
                    disabled={mode === "view"}
                    step={0.01}
                    min="0"
                    error={error.price}
                  />
                  <span className="absolute top-1/2 right-0 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    บาท
                  </span>
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label className="text-error-400">ราคาโปรโมชั่น</Label>
                <div className="relative">
                  <Input
                    type="number"
                    className={`pr-[62px] ${error.price ? "border-error-400" : ""}`}
                    value={formData.discountPrice}
                    name="discountPrice"
                    onChange={onChangeInput}
                    disabled={mode === "view"}
                    step={0.01}
                    min="0"
                    max={formData.price}
                    error={error.price}
                  />
                  <span className="absolute top-1/2 right-0 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    บาท
                  </span>
                  {error.price && (
                    <p className="text-error-400 mt-1 text-sm">
                      ราคาโปรโมชั่นต้องต้องน้อยกว่าราคาปกติเท่านั้น
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>น้ำหนัก</Label>
                <div className="relative">
                  <Input
                    type="number"
                    className="pr-[70px]"
                    value={formData.weight}
                    name="weight"
                    onChange={onChangeInput}
                    disabled={mode === "view"}
                    step={0.01}
                    min="0"
                    error={error.weight}
                  />
                  <span className="absolute top-1/2 right-0 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    กิโลกรัม
                  </span>
                  {error.weight && (
                    <p className="text-error-400 mt-1 text-sm">
                      น้ำหนักต้องเป็นตัวเลขและไม่ติดลบ
                    </p>
                  )}
                </div>
              </div>

              {/* ขนาด 3 input */}
              <div className="col-span-2 lg:col-span-1">
                <Label>ขนาด (กว้าง x ยาว x สูง)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    name="width"
                    min="0"
                    step={0.01}
                    placeholder="กว้าง"
                    value={sizeInput.width}
                    onChange={onChangeSize}
                    disabled={mode === "view"}
                    error={error.size && !sizeInput.width}
                  />
                  <span className="self-center">x</span>
                  <Input
                    type="number"
                    name="length"
                    min="0"
                    step={0.01}
                    placeholder="ยาว"
                    value={sizeInput.length}
                    onChange={onChangeSize}
                    disabled={mode === "view"}
                    error={error.size && !sizeInput.length}
                  />
                  <span className="self-center">x</span>
                  <Input
                    type="number"
                    name="height"
                    min="0"
                    step={0.1}
                    placeholder="สูง"
                    value={sizeInput.height}
                    onChange={onChangeSize}
                    disabled={mode === "view"}
                    error={error.size && !sizeInput.height}
                  />
                  <span className="self-center">ซม.</span>
                </div>
                {error.size && (
                  <p className="text-error-400 mt-1 text-sm">
                    กรุณากรอกขนาด กว้าง x ยาว x สูง (ตัวเลขมากกว่า 0)
                  </p>
                )}
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>สถานะสินค้า</Label>
                <div className="relative">
                  <Button
                    isButton
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDropdown("displayType")}
                    className="dropdown-toggle flex w-full items-center !justify-between text-gray-700 dark:text-gray-400"
                    disabled={mode === "view"}
                  >
                    <span className="text-theme-sm mr-1 block font-medium">
                      {formData.displayType === "TYPE_1" ? (
                        <Badge color="primary">สินค้าใหม่</Badge>
                      ) : formData.displayType === "TYPE_2" ? (
                        <Badge color="error">สินค้าขายดี</Badge>
                      ) : formData.displayType === "TYPE_3" ? (
                        <Badge color="success">สินค้าแนะนำ</Badge>
                      ) : formData.displayType === "TYPE_4" ? (
                        <Badge color="dark">สินค้าทั่วไป</Badge>
                      ) : (
                        <Badge color="warning">สินค้าโปรโมชั่น</Badge>
                      )}
                    </span>
                  </Button>

                  <Dropdown
                    isOpen={isOpenDropdown.displayType}
                    onClose={() => closeDropdown("displayType")}
                    className="shadow-theme-lg dark:bg-gray-dark absolute bottom-[110%] left-0 flex w-full flex-col rounded-2xl border border-gray-200 bg-white px-3 dark:border-gray-800"
                  >
                    <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                      <li>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayType: "TYPE_1",
                            }))
                            closeDropdown("displayType")
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                        >
                          <Badge color="primary">สินค้าใหม่</Badge>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayType: "TYPE_2",
                            }))
                            closeDropdown("displayType")
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                        >
                          <Badge color="error">สินค้าขายดี</Badge>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayType: "TYPE_3",
                            }))
                            closeDropdown("displayType")
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                        >
                          <Badge color="success">สินค้าแนะนำ</Badge>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayType: "TYPE_4",
                            }))
                            closeDropdown("displayType")
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                        >
                          <Badge color="dark">สินค้าทั่วไป</Badge>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayType: "TYPE_5",
                            }))
                            closeDropdown("displayType")
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium"
                        >
                          <Badge color="warning">สินค้าโปรโมชั่น</Badge>
                        </DropdownItem>
                      </li>
                    </ul>
                  </Dropdown>
                </div>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>การมองเห็น</Label>
                <div className="relative">
                  <Button
                    isButton
                    size="sm"
                    variant="outline"
                    onClick={() => toggleDropdown("displayStatus")}
                    className="dropdown-toggle flex w-full items-center !justify-between text-gray-700 dark:text-gray-400"
                    disabled={mode === "view"}
                  >
                    <span className="text-theme-sm mr-1 block font-medium">
                      {Number(formData.displayStatus) === 1 ? (
                        <Badge color="success">แสดง</Badge>
                      ) : (
                        <Badge color="error">ไม่แสดง</Badge>
                      )}
                    </span>
                    <svg
                      className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
                        isOpenDropdown.displayStatus ? "rotate-180" : ""
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
                    isOpen={isOpenDropdown.displayStatus}
                    onClose={() => closeDropdown("displayStatus")}
                    className="shadow-theme-lg dark:bg-gray-dark absolute left-0 flex w-full flex-col rounded-2xl border border-gray-200 bg-white px-3 dark:border-gray-800"
                  >
                    <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                      <li>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayStatus: "1",
                            }))
                            closeDropdown("displayStatus")
                          }}
                          className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                        >
                          <Badge color="success">แสดง</Badge>
                        </DropdownItem>
                        <DropdownItem
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              displayStatus: "0",
                            }))
                            closeDropdown("displayStatus")
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
        <div className="mt-6 flex items-center justify-between gap-3 px-2">
          <Button
            isButton
            variant="outline"
            onClick={() => navigate("/products")}
          >
            <ArrowLeftIcon /> ย้อนกลับ
          </Button>
          {mode === "view" ? (
            <Button
              onClick={() =>
                navigate(`/products?mode=edit&v=${existingData.id}`)
              }
              isButton
            >
              แก้ไขสินค้านี้
            </Button>
          ) : (
            <Button
              disabled={
                isUploading ||
                error.price ||
                error.name ||
                error.unit ||
                error.size ||
                error.weight ||
                error.nameNotValid ||
                error.description ||
                error.image
              }
            >
              {isUploading
                ? "กำลังบันทึก..."
                : existingData
                  ? "อัปเดตข้อมูล"
                  : "เพิ่มสินค้า"}
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

export default MainProductForm
