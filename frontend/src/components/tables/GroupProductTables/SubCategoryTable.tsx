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
import Badge from "../../ui/badge/Badge"
import Button from "../../ui/button/Button"
import { SearchIcon, SquarePenIcon, TrashBinIcon } from "../../../icons"
import { Link, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { API_ENDPOINT, API_VERSION } from "../../../utils/meta"
import { AuthSending } from "../../../utils/api"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"
import { toast } from "react-toastify"
import { SubCategoryProps } from "../../../props/Groups"
import { useQueryParam } from "../../../utils/string"
import DeleteCategoryDialog from "./DeleteCategory"
import CreateSubCategoryForm from "./CreateSubCategoryForm"

export default function SubCategoryTable() {
  const { isOpen, openModal, closeModal } = useModal()
  const [subCategory, setSubCategory] = useState<SubCategoryProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const [modalType, setModalType] = useState<ModalType>(null)
  const search = useQueryParam("s")
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  type ModalType = "create" | "edit" | "delete" | null

  useEffect(() => {
    if (isCreate) openCreateModal()
  }, [isCreate])

  const openCreateModal = () => {
    setModalType("create")
    openModal()
  }

  const openEditModal = (data: SubCategoryProps) => {
    setTargetSelection(data)
    setModalType("edit")
    openModal()
  }

  const openDeleteModal = (data: SubCategoryProps) => {
    setTargetSelection(data)
    setModalType("delete")
    openModal()
  }

  const closeModalA = () => {
    setTargetSelection(undefined)
    setModalType(null)
    navigate("/sub-category") // reset URL query
    closeModal()
  }

  useEffect(() => {
    if (search) setSearchTerm(String(search))
  }, [])

  const fetchSubCategory = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}groups/sub-category`
    )
    response && setSubCategory(response.data)
  }

  useEffect(() => {
    fetchSubCategory()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredSubCategory = subCategory.filter(
    category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      category.main_category_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim())
  )

  const paginatedSubCategory = filteredSubCategory.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredSubCategory.length
  const totalPages = Math.ceil(totalItems / perPage)

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}groups/sub-category/delete/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setSubCategory(prev =>
          prev.filter(item => item.id !== targetSelection?.id)
        )
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
        />

        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                #
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                ชื่อหมวดหมู่
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                จำนวนประเภทสินค้า
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedSubCategory.length > 0 ? (
              paginatedSubCategory.map((category, index) => (
                <TableRow key={category.id} className="text-nowrap">
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div>
                      <p className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                        {category.name}
                      </p>
                      <span className="text-xs font-normal text-gray-400 dark:text-gray-400">
                        {category.main_category_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <Link to={`/product-type?s=${category.name}`}>
                      <Badge>
                        <SearchIcon />
                        {category.product_type_count > 0
                          ? `${category.product_type_count} รายการ`
                          : `ไม่มี`}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-blue-500"
                        onClick={() => openEditModal(category)}
                      >
                        <SquarePenIcon />
                      </Button>

                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => openDeleteModal(category)}
                      >
                        <TrashBinIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                  <EmptyCell />
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
        onClose={closeModalA}
        showCloseButton={false}
        className="m-4 max-w-[507px]"
      >
        {modalType === "create" && (
          <CreateSubCategoryForm
            reFetching={fetchSubCategory}
            onClose={closeModalA}
          />
        )}
        {modalType === "edit" && targetSelection && (
          <CreateSubCategoryForm
            isEdit
            editData={targetSelection}
            reFetching={fetchSubCategory}
            onClose={closeModalA}
          />
        )}
        {modalType === "delete" && targetSelection && (
          <DeleteCategoryDialog
            target={targetSelection}
            onDelete={handlerDelete}
            onClose={closeModalA}
          />
        )}
      </Modal>
    </div>
  )
}
