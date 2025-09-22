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
import { ArrowRightIcon, SquarePenIcon, TrashBinIcon } from "../../../icons"
import { useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { API_ENDPOINT, API_VERSION } from "../../../utils/meta"
import { AuthSending } from "../../../utils/api"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"
import { toast } from "react-toastify"
import { ProductTypeProps } from "../../../props/Groups"
import { useQueryParam } from "../../../utils/string"
import DeleteCategoryDialog from "./DeleteCategory"
import CreateProductTypeForm from "./CreateProductTypeForm"
import Badge from "../../ui/badge/Badge"

export default function ProductTypeTable() {
  const { isOpen, openModal, closeModal } = useModal()
  const [productType, setProductType] = useState<ProductTypeProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const [editData, setEditData] = useState<ProductTypeProps | undefined>()

  const search = useQueryParam("s")
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  useEffect(() => {
    isCreate && openModal()
  }, [isCreate])

  const closeModalA = () => {
    navigate("/product-type")
    closeModal()
  }

  useEffect(() => {
    if (search) setSearchTerm(String(search))
  }, [])

  const fetchProductType = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}groups/product-type`
    )
    response && setProductType(response.data)
  }

  useEffect(() => {
    fetchProductType()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredProductType = productType.filter(
    type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      type.sub_category_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim())
  )

  const paginatedProductType = filteredProductType.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredProductType.length
  const totalPages = Math.ceil(totalItems / perPage)

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}groups/product-type/delete/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setProductType(prev =>
          prev.filter(item => item.id !== targetSelection?.id)
        )
      } else throw new Error(response.data.message)
    } catch (error: any) {
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
            setCurrentPage(1)
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
                ชื่อประเภทสินค้า
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                จำนวนสินค้า
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedProductType.length > 0 ? (
              paginatedProductType.map((type, index) => (
                <TableRow key={type.id} className="text-nowrap">
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div>
                      <p className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                        {type.name}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-xs font-normal text-gray-400 dark:text-gray-400">
                        {type.main_category_name} <ArrowRightIcon />{" "}
                        {type.sub_category_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <Badge>
                      {type.product_count > 0
                        ? `${type.product_count} รายการ`
                        : `ไม่มี`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-blue-500"
                        onClick={() => {
                          setEditData(type)
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
                          openModal()
                          setTargetSelection(type)
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

      {/* Modal */}
      <Modal
        isOpen={isOpen}
        onClose={closeModalA}
        showCloseButton={false}
        className="m-4 max-w-[507px]"
      >
        {editData ? (
          <CreateProductTypeForm
            editData={editData}
            reFetching={fetchProductType}
            onClose={() => {
              closeModalA()
              setEditData(undefined)
            }}
          />
        ) : isCreate ? (
          <CreateProductTypeForm
            reFetching={fetchProductType}
            onClose={closeModalA}
          />
        ) : (
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
