import { useEffect, useState } from "react"
import { SquarePenIcon, TrashBinIcon } from "../../icons"
import Button from "../ui/button/Button"

import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import { AuthSending } from "../../utils/api"
import { API_ENDPOINT, API_VERSION } from "../../utils/meta"
import { getImageUrl } from "../../utils/helper"

import { useQueryParam } from "../../utils/string"
import DeleteDiaglog from "../common/DeleteDiaglog"
import { toast } from "react-toastify"
import { handleImageError } from "../../utils/image"
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  tableCellStyle,
  TableControl,
  TableHeader,
  TableRow,
} from "../ui/table"
import Alert from "../ui/alert/Alert"
import { CatalogListProps } from "../../pages/Products/Catalog"
import {
  CreateCatlogs,
  UpdateCreateCatlogs,
} from "../../actions/catalogs-detail-lists.action"
import MultiImageDrop from "../form/input/MultiImageDrop"

interface CatalogViewDetailListsProps {
  dataLists: CatalogListProps[] | undefined
}
const CatalogViewDetailLists: React.FC<CatalogViewDetailListsProps> = ({
  dataLists,
}) => {
  const catalogId = useQueryParam("v")

  const { isOpen, openModal, closeModal } = useModal()

  const [lists, setLists] = useState<CatalogListProps[]>([])
  const [selectedCatalogs, setselectedCatalogs] =
    useState<CatalogListProps | null>(null)
  const [isDelete, setIsDelete] = useState<boolean>(false)

  const [imageFile, setImageFile] = useState<File[] | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (dataLists?.length) {
      setLists(dataLists)
    }
  }, [dataLists])

  const handleFileChange = (file: File | File[]) => {
    if (Array.isArray(file)) {
      setImageFile(file)
      if (file.length > 0) {
        setPreview(URL.createObjectURL(file[0]))
      }
    } else if (file) {
      setImageFile([file])
      setPreview(null)
    }
  }
  const handlerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const toastId = toast.loading("กำลังดำเนินการ")
      const formData = new FormData()
      if (imageFile && imageFile.length > 0) {
        imageFile.forEach(file => {
          formData.append("image", file) // ชื่อ field = "images" ต้องตรงกับ backend
        })
      }
      formData.append("catalogId", String(catalogId))


      if (selectedCatalogs) {
        // Update existing
        const response = await UpdateCreateCatlogs(
          selectedCatalogs.id,
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
            item.id === selectedCatalogs.id
              ? {
                  ...item,
                  image: response.image,
                }
              : item
          )
        )
      } else {
        // Create new
        const response = await CreateCatlogs(formData)

        toast.update(toastId, {
          render: `เพิ่มข้อมูลสำเร็จ`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        const newImages = response.map((img: CatalogListProps) => ({
          id: img.id,
          image: img.image,
        }))
        setLists(prev => [...prev, ...newImages])
      }

      setselectedCatalogs(null)
      setImageFile([])
      closeModal()
    } catch (err) {
      console.error("Error saving catalog:", err)
    }
  }

  const handleDelete = async () => {
    try {
      await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}catalog-images/${selectedCatalogs?.id}`
      )
      toast.success("ลบข้อมูลสำหรับ")
      setLists(prev => prev.filter(item => item.id !== selectedCatalogs?.id))
    } catch (err) {
      console.error("Delete failed:", err)
    }
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

    const handlePageChange = (page: number) => {
      setCurrentPage(page)
    }

    const filteredUsers = lists.filter(item =>
      item.image.toLowerCase().includes(searchTerm.toLowerCase().trim())
    )

    const paginatedCatalog = filteredUsers.slice(
      (currentPage - 1) * perPage,
      currentPage * perPage
    )

    const totalItems = filteredUsers.length
    const totalPages = Math.ceil(totalItems / perPage)
    

  return (
    <div
      className={`col-span-2 flex flex-col rounded-2xl border border-gray-200 bg-white xl:col-span-2 dark:border-gray-800 dark:bg-white/[0.03] ${!dataLists ? "cursor-not-allowed" : null}`}
    >
      <div className="inline-flex w-full flex-col items-center justify-between gap-y-2 px-6 py-5 md:flex-row">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          รายการแคตตาล็อก
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto p-4">
        <TableControl
          perPageLimit={perPage}
          setPerPage={setPerPage}
          search={searchTerm}
          onSearch={setSearchTerm}
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
                จัดการ
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedCatalog.length > 0 ? (
              paginatedCatalog.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    {(currentPage - 1) * perPage + index + 1}
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <figure className="max-w-24">
                      <img
                        src={getImageUrl("catalogImages", item.image) || ""}
                        alt="preview"
                        className="h-full w-full rounded-lg object-contain"
                        onError={e => handleImageError(e, "blank")}
                      />
                    </figure>
                  </TableCell>
                  <TableCell className={`${tableCellStyle["td"]}`}>
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setselectedCatalogs(item)
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
                          setselectedCatalogs(item)
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
                    title={`${!dataLists ? "ไม่พบแคตตาล็อกนี้ในระบบ" : "ดูเหมือนว่าแคตตาล็อกนี้จะว่างเปล่า"}`}
                    message={`${!dataLists ? "กรุณาเพิ่มข้อมูลแคตตาล็อกก่อน!" : "โปรดเพิ่มหมวดแคตตาล็อก"}`}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setselectedCatalogs(null)
          setIsDelete(false)
          closeModal()
        }}
        className={`top-0 max-w-[550px]`}
      >
        {selectedCatalogs && isDelete ? (
          <DeleteDiaglog
            onClose={() => {
              closeModal()
              setIsDelete(false)
              setselectedCatalogs(null)
            }}
            target={{
              name: selectedCatalogs.image,
            }}
            onDelete={handleDelete}
            prefix="หมวดแคตตาล็อก"
            text="(ภายในแคตตาล็อก)"
          />
        ) : (
          <div className="no-scrollbar relative mx-auto w-full max-w-3xl rounded-3xl bg-white p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
            <h4 className="text-title-sm mb-7 font-semibold text-gray-800 dark:text-white/90">
              {selectedCatalogs ? "แก้ไขหมวดแคตตาล็อก" : "เพิ่มหมวดแคตตาล็อก"}
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
                    <MultiImageDrop
                      multiFile={true}
                      fileLimit={10}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-auto flex w-full items-center justify-end gap-3">
                <Button
                  onClick={() => {
                    setselectedCatalogs(null)
                    closeModal()
                  }}
                  variant="outline"
                  isButton
                >
                  ปิด
                </Button>
                <Button variant="primary">
                  {!selectedCatalogs && !isDelete ? "บันทึก" : "อัปเดต"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
export default CatalogViewDetailLists
