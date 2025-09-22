import { useEffect, useState } from "react"
import { SquarePenIcon, TrashBinIcon } from "../../icons"
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"
import { ListProps } from "../../pages/DecoByStyles/DecoByStyles"
import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import FileInput from "../form/input/FileInput"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import Label from "../form/Label"
import ComboBox from "../ui/combobox/ComboBox"
import { getImageUrl } from "../../utils/helper"
import {
  CreateSubDecoByStyles,
  DeleteSubDCBSById,
  UpdateSubDecoByStyles,
} from "../../actions/sub-decobystyle.action"
import { useQueryParam } from "../../utils/string"
import DeleteDiaglog from "../common/DeleteDiaglog"
import { toast } from "react-toastify"
import { handleImageError } from "../../utils/image"
import {
  Table,
  TableBody,
  TableCell,
  tableCellStyle,
  TableControl,
  TableHeader,
  TableRow,
} from "../ui/table"
import { useTableControl } from "../../hooks/useTableControl"
import Alert from "../ui/alert/Alert"

interface DecoByStyleDetailListsProps {
  dataLists: ListProps[] | undefined
}

const LIMIT = 10

const DecoByStyleDetailLists: React.FC<DecoByStyleDetailListsProps> = ({
  dataLists,
}) => {
  const dcbsId = useQueryParam("v")

  const { isOpen, openModal, closeModal } = useModal()

  const [subCategories, setSubCategories] = useState<
    { id: number; name: string }[]
  >([])

  useEffect(() => {
    const fetchDecoByStyle = async () => {
      try {
        const res = await AuthSending().get(
          `${API_ENDPOINT}${API_VERSION}groups/sub-category`
        )
        setSubCategories(res.data)
      } catch (err) {
        console.error("Failed to fetch sub-categories:", err)
      }
    }

    fetchDecoByStyle()
  }, [])

  const [lists, setLists] = useState<ListProps[]>([])
  const [selectedSubDCBS, setSelectedSubDCBS] = useState<ListProps | null>(null)
  const [isDelete, setIsDelete] = useState<boolean>(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [subCategory, setSubCategory] = useState(subCategories[0]?.id)

  useEffect(() => {
    if (dataLists && dataLists.length > 0) {
      setLists(dataLists)
    }
  }, [dataLists])

  useEffect(() => {
    if (selectedSubDCBS)
      setPreview(getImageUrl("sub-decobystyles", selectedSubDCBS?.image))
  }, [selectedSubDCBS])

  const handleFileChange = (file: File | null) => {
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else if (selectedSubDCBS?.image) {
      setPreview(getImageUrl("sub_decobystyles", selectedSubDCBS?.image))
    } else {
      setPreview(null)
    }
  }

  console.log("SELECTED", selectedSubDCBS)
  const handlerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("SELECTED IN SUBMIT", selectedSubDCBS)

    try {
      const toastId = toast.loading("กำลังดำเนินการ")
      const formData = new FormData()

      // เพิ่มรูปภาพใหม่ถ้ามี
      if (imageFile) {
        formData.append("image", imageFile)
      }

      // ใช้ subCategory ถ้าเป็นการสร้างใหม่ หรือใช้ id ของ selectedSubDCBS ถ้าเป็นการอัปเดต
      formData.append(
        "sub_dcbs",
        String(subCategory ? subCategory : selectedSubDCBS?.id)
      )

      if (selectedSubDCBS) {
        // Update existing
        const response = await UpdateSubDecoByStyles(
          Number(selectedSubDCBS.id),
          formData
        )

        toast.update(toastId, {
          render: `อัปเดตข้อมูลสำเร็จ`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })

        setLists(prev =>
          prev.map(item =>
            item.id === selectedSubDCBS.id
              ? {
                  ...item,
                  image: response.image,
                  name:
                    subCategories.find(i => i.id === response.subCategoryId)
                      ?.name ?? "",
                }
              : item
          )
        )
      } else {
        formData.append("dcbsId", String(dcbsId))
        // Create new
        const response = await CreateSubDecoByStyles(formData)

        toast.update(toastId, {
          render: `เพิ่มข้อมูลสำเร็จ`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setLists(prev => [
          ...prev,
          {
            id: response.id,
            image: response.image,
            name:
              subCategories?.find(i => i.id === response.subCategoryId)?.name ??
              "",
          },
        ])
      }
    } catch (err) {
      console.error("Error saving sub-category:", err)
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล")
    } finally {
      // รีเซ็ตค่าหลังจากส่งข้อมูล
      setSelectedSubDCBS(null)
      setImageFile(null)
      setPreview(null)
      closeModal()
    }
  }

  const handleDelete = async () => {
    try {
      await DeleteSubDCBSById(Number(selectedSubDCBS?.id))
      toast.success("ลบข้อมูลสำหรับ")
      setLists(prev => prev.filter(item => item.id !== selectedSubDCBS?.id))
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  function onSelected(id: number) {
    setSubCategory(id)
  }

  const { searchTerm, onSearch, currentPage, perPage, setPerPage, paginated } =
    useTableControl(lists, 10)

  return (
    <div
      className={`col-span-2 flex flex-col rounded-2xl border border-gray-200 bg-white xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03] ${!dataLists ? "cursor-not-allowed" : null}`}
    >
      <div className="inline-flex w-full flex-col items-center justify-between gap-y-2 px-6 py-5 md:flex-row">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          รายการหมวดหมู่ย่อยภายในสไตล์
        </h3>
        <Badge color={`${lists.length === LIMIT ? "error" : "primary"}`}>
          {lists.length === 10
            ? `ครบจำนวนที่กำหนดแล้ว`
            : `จำกัด ${lists.length}/${LIMIT} หมวดหมู่ย่อย`}
        </Badge>
      </div>

      <div className="max-w-full overflow-x-auto p-4">
        <TableControl
          perPageLimit={perPage}
          setPerPage={setPerPage}
          search={searchTerm}
          onSearch={onSearch}
          options={[10]}
          onClick={() => {
            openModal()
          }}
          disable={!dataLists}
        />
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                #
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                รูปภาพ
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                ชื่อสไตล์
              </TableCell>
              <TableCell className={`${tableCellStyle["th"]}`} isHeader>
                จัดการ
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginated.length > 0 ? (
              paginated.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    {(currentPage - 1) * perPage + index + 1}
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <figure className="max-w-24">
                      <img
                        src={getImageUrl("sub-decobystyles", item.image) || ""}
                        alt="preview"
                        className="h-full w-full rounded-lg object-contain"
                        onError={e => handleImageError(e, "blank")}
                      />
                    </figure>
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    {item.name}
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setSelectedSubDCBS(item)
                          openModal()
                        }}
                      >
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          setSelectedSubDCBS(item)
                          setIsDelete(true)
                          openModal()
                        }}
                      >
                        <TrashBinIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  <Alert
                    variant="info"
                    title={`${!dataLists ? "ไม่พบสินค้าตามสไตล์นี้ในระบบ" : "ดูเหมือนว่าสไตล์นี้จะว่างเปล่า"}`}
                    message={`${!dataLists ? "กรุณาเพิ่มข้อมูลสินค้าตามสไตล์ก่อน!" : "โปรดเพิ่มหมวดหมู่ย่อย"}`}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setSelectedSubDCBS(null)
          setImageFile(null)
          setPreview(null)
          setIsDelete(false)
          closeModal()
        }}
        className={`top-0 max-w-[550px]`}
      >
        {selectedSubDCBS && isDelete ? (
          <DeleteDiaglog
            onClose={() => {
              closeModal()
              setIsDelete(false)
              setSelectedSubDCBS(null)
            }}
            target={{
              name: selectedSubDCBS.name,
            }}
            onDelete={handleDelete}
            prefix="หมวดหมู่ย่อย"
            text="(ภายในสไตล์นี้)"
          />
        ) : (
          <div className="no-scrollbar relative w-full rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
            <h4 className="text-title-sm mb-7 font-semibold text-gray-800 dark:text-white/90">
              {selectedSubDCBS ? "แก้ไขหมวดหมู่ย่อย" : "เพิ่มหมวดหมู่ย่อย"}
            </h4>
            <form onSubmit={handlerSubmit} className="flex flex-col">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                  {preview && (
                    <div className="flex flex-col items-center">
                      <img
                        src={preview}
                        alt="preview"
                        className="mb-4 w-40 rounded-lg object-contain"
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
                <div className="col-span-2 lg:col-span-2">
                  <Label>
                    {selectedSubDCBS
                      ? `หมวดหมู่ย่อยปัจจุบัน ${selectedSubDCBS?.name}`
                      : "เลือกหมวดหมู่ย่อย"}
                  </Label>
                  <ComboBox
                    data={subCategories}
                    onSelect={onSelected}
                    defaultId={
                      subCategories.find(i => i.name === selectedSubDCBS?.name)
                        ?.id ?? undefined
                    }
                  />
                </div>
              </div>
              <div className="mt-auto flex w-full items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    setSelectedSubDCBS(null)
                    closeModal()
                  }}
                  variant="outline"
                  isButton
                >
                  ปิด
                </Button>
                <Button variant="primary">
                  {!selectedSubDCBS && !isDelete ? "บันทึก" : "อัปเดต"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default DecoByStyleDetailLists
