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
import { MainCategoryProps } from "../../../props/Groups"
import { useQueryParam } from "../../../utils/string"
import DeleteCategoryDialog from "./DeleteCategory"
import CreateMainCategoryForm from "./CreateMainCategoryForm"
import { getImageUrl } from "../../../utils/helper"

export default function MainCategoryTable() {
  const { isOpen, openModal, closeModal } = useModal()
  const [Category, setMainCategory] = useState<MainCategoryProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  useEffect(() => {
    isCreate && openModal()
  }, [isCreate])

  const closeModalA = () => {
    navigate("/main-category")
    setIsDeleting(false)
    setTargetSelection(undefined)
    closeModal()
  }

  const fetchUsers = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}groups/main-category`
    )
    response && setMainCategory(response.data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredCategory = Category.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const paginatedCategory = filteredCategory.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredCategory.length
  const totalPages = Math.ceil(totalItems / perPage)

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}groups/main-category/delete/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setMainCategory(prev =>
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
                จำนวนหมวดหมู่ย่อย
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedCategory.length > 0 ? (
              paginatedCategory.map((category, index) => (
                <TableRow key={category.id} className="text-nowrap">
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <img
                        src={`${getImageUrl("category-icons", category.icon)}`}
                        alt="icon"
                        className="h-5 w-5"
                      />{" "}
                      {category.name}
                    </span>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <Link to={`/sub-category?s=${category.name}`}>
                      <Badge>
                        <SearchIcon />
                        {category.sub_category_count > 0
                          ? `${category.sub_category_count} รายการ`
                          : `ไม่มี`}
                      </Badge>
                    </Link>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setTargetSelection(category)
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
                          setTargetSelection(category)
                          setIsDeleting(true)
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
        {isCreate ? (
          <CreateMainCategoryForm
            reFetching={fetchUsers}
            onClose={closeModalA}
          />
        ) : isDeleting && targetSelection ? (
          <DeleteCategoryDialog
            target={targetSelection}
            onDelete={handlerDelete}
            onClose={() => {
              setIsDeleting(false)
              closeModalA()
            }}
          />
        ) : targetSelection ? (
          <CreateMainCategoryForm
            reFetching={fetchUsers}
            onClose={closeModalA}
            isEdit
            defaultData={{
              id: targetSelection.id,
              name: targetSelection.name,
              icon: targetSelection.icon,
            }}
          />
        ) : null}
      </Modal>
    </div>
  )
}
