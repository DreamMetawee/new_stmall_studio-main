import { Link, useNavigate } from "react-router"
import { ExternalLinkIcon, SquarePenIcon, TrashBinIcon } from "../../../icons"
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
import { useEffect, useState } from "react"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"
import { useQueryParam } from "../../../utils/string"
import CreateBusinessForm from "./CreateBusinessForm"
import { CoBusinessProps } from "../../../props/Page"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../../utils/meta"
import { AuthSending } from "../../../utils/api"
import DeleteDiaglog from "../../common/DeleteDiaglog"
import { toast } from "react-toastify"
import { handleImageError } from "../../../utils/image"

type Props = {
  data: CoBusinessProps[]
  fetchData: () => void
}

const BusinessTable = ({ data, fetchData }: Props) => {
  const { closeModal, isOpen, openModal } = useModal()
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  useEffect(() => {
    isCreate && openModal()
  }, [isCreate])

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
  const [editData, setEditData] = useState<CoBusinessProps | undefined>()
  const [targetSelection, setTargetSelection] = useState<any | undefined>()
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const openEditModal = (item: CoBusinessProps) => {
    setEditData(item)
    openModal()
  }

  const openDeleteDialog = (item: CoBusinessProps) => {
    setTargetSelection(item)
    setIsDeleteOpen(true)
  }

  const handlerDelete = async () => {
    if (!targetSelection) return
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}pages/co-business/${targetSelection?.id}`
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
    setEditData(undefined)
    closeModal()
    navigate("/about-us")
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
                      <div className="h-16 w-16 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={`${PUBLIC_STATIC}co-business/${item.logo_path}`}
                          alt={item.name}
                          className="h-full w-full rounded-full object-cover object-top"
                          onError={e => handleImageError(e, "blank")}
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {item.name}
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          {item.website_url ? (
                            <Link to={item.website_url} target="_blank">
                              <Badge size="sm" color="primary">
                                <ExternalLinkIcon />
                                ลิงค์เว็บไซต์
                              </Badge>
                            </Link>
                          ) : (
                            <Badge
                              size="sm"
                              color="light"
                              className="select-none"
                            >
                              <ExternalLinkIcon />
                              ไม่พบลิงค์
                            </Badge>
                          )}
                        </span>
                      </div>
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
                        onClick={() => openDeleteDialog(item)}
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
          isOpen={isOpen}
          onClose={closeModalA}
          showCloseButton={false}
          className="mb-4 max-w-[700px]"
        >
          <CreateBusinessForm
            reFetching={fetchData}
            onClose={closeModalA}
            editData={editData}
          />
        </Modal>

        <Modal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          className="mb-4 max-w-[507px]"
        >
          <DeleteDiaglog
            prefix="บริษัท"
            target={targetSelection}
            onDelete={handlerDelete}
            onClose={() => setIsDeleteOpen(false)}
          />
        </Modal>
      </div>
    </div>
  )
}
export default BusinessTable
