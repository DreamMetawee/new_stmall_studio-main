import {
  ExpandIcon,
  MapPinIcon,
  SquarePenIcon,
  TrashBinIcon,
} from "../../../icons"
import Badge from "../../ui/badge/Badge"
import {
  EmptyCell,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableControl,
  TableHeader,
  TableRow,
} from "../../ui/table"
import Button from "../../ui/button/Button"
import { useState } from "react"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"
import { OurStoreProps } from "../../../props/Page"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../../utils/meta"
import { AuthSending } from "../../../utils/api"
import DeleteDiaglog from "../../common/DeleteDiaglog"
import { toast } from "react-toastify"
import ResponsiveImage from "../../ui/images/ResponsiveImage"
import CreateOurStoreForm from "./CreateOurStoreForm"
import { Link } from "react-router"
import { handleImageError } from "../../../utils/image"

type Props = {
  data: OurStoreProps[]
  fetchData: () => void
}

const OurStoreTable = ({ data, fetchData }: Props) => {
  const { closeModal, isOpen, openModal } = useModal()
  const [isCreate, setIsCreate] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewImage, setViewImage] = useState<{
    image: string
    name: string
  } | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredUsers = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const paginatedData = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / perPage)

  // state ใหม่
  const [targetSelection, setTargetSelection] = useState<any | undefined>()

  const openEditModal = (item: OurStoreProps) => {
    setTargetSelection(item)
    openModal()
  }

  const handlerDelete = async () => {
    if (!targetSelection) return
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}pages/our-store/delete/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        fetchData()
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
      setTargetSelection(undefined)
    }
  }

  const closeModalA = () => {
    setIsCreate(false)
    setIsDeleting(false)
    closeModal()
  }

  const openDeleteModal = (item: OurStoreProps) => {
    setIsCreate(false)
    setIsDeleting(true)
    setTargetSelection(item)
    openModal()
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto pt-4">
        <TableControl
          perPageLimit={perPage}
          setPerPage={setPerPage}
          search={searchTerm}
          onSearch={value => {
            setSearchTerm(value)
            setCurrentPage(1) // รีเซ็ตหน้าเมื่อค้นหา
          }}
          options={[5, 10, 20]}
          onClick={() => {
            setTargetSelection(undefined), setIsCreate(true), openModal()
          }}
        />

        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                รูปภาพ
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                ข้อมูลร้านค้า
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                  <EmptyCell />
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setViewImage({
                            image: item.store_image,
                            name: item.name,
                          })
                        }
                        className="group relative h-16 w-16 overflow-hidden rounded-full"
                        title="ดูรูปภาพ"
                      >
                        <div className="text-theme-xl absolute flex h-full w-full items-center justify-center rounded-full text-white/90 opacity-0 backdrop-blur-sm duration-300 group-hover:opacity-100">
                          <ExpandIcon />
                        </div>
                        <img
                          width={50}
                          height={50}
                          src={`${PUBLIC_STATIC}our-store/${item.store_image}`}
                          alt={item.name}
                          className="h-full w-full object-cover object-top"
                          onError={e => handleImageError(e, "blank")}
                        />
                      </button>
                      <div className="space-y-1">
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {item.name}
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          <Badge size="sm">{item.email}</Badge>
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          <Badge size="sm">{item.phone}</Badge>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-xs w-1/2 px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                        {item.address}
                      </span>
                      <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                        <Badge size="sm">{item.opening_hours}</Badge>
                      </span>
                      <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                        <Badge size="sm">
                          <Link
                            to={item.map_embed}
                            target="_blank"
                            className="inline-flex items-center gap-1"
                          >
                            <MapPinIcon /> ลิงค์แผนที่
                          </Link>
                        </Badge>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => openEditModal(item)}
                      >
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => openDeleteModal(item)}
                      >
                        <TrashBinIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          perPage={perPage}
          onPageChange={handlePageChange}
        />

        <Modal
          isOpen={viewImage !== null}
          onClose={() => setViewImage(null)}
          showCloseButton={true}
          className="mb-4 max-w-[500px]"
        >
          <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
            <div className="px-2">
              <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
                {viewImage?.name}
              </h4>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2">
                  <ResponsiveImage
                    src={`${PUBLIC_STATIC}our-store/${viewImage?.image}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isOpen}
          onClose={closeModalA}
          showCloseButton={false}
          className={`mb-4 ${isCreate || !isDeleting ? "max-w-[700px]" : "max-w-[507px]"}`}
        >
          {isCreate || !isDeleting ? (
            <CreateOurStoreForm
              reFetching={fetchData}
              onClose={closeModalA}
              editData={targetSelection}
            />
          ) : (
            <DeleteDiaglog
              prefix="ร้านค้า"
              target={targetSelection}
              onDelete={handlerDelete}
              onClose={closeModalA}
            />
          )}
        </Modal>
      </div>
    </div>
  )
}
export default OurStoreTable
