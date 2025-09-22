import { useEffect, useState } from "react"
import { useTableControl } from "../../hooks/useTableControl"
import { EyeIcon, SquarePenIcon, TrashBinIcon } from "../../icons"
import { handleImageError } from "../../utils/image"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../utils/meta"
import { formatNumber } from "../../utils/number"
import Badge from "../ui/badge/Badge"
import Button from "../ui/button/Button"
import {
  EmptyCell,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableControl,
  TableHeader,
  TableRow,
} from "../ui/table"
import { ProductProps } from "../../props/Product"
import { AuthSending } from "../../utils/api"
import { useNavigate } from "react-router"
import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import DeleteDiaglog from "../common/DeleteDiaglog"
import { toast } from "react-toastify"
import { DeleteMainProductById } from "../../actions/main-product.action"

const ViewMainProduct = () => {
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()

  const [products, setProducts] = useState<ProductProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )

  const {
    searchTerm,
    onSearch,
    currentPage,
    perPage,
    setPerPage,
    paginated,
    totalItems,
    totalPages,
    setCurrentPage,
  } = useTableControl(products, 10)

  const fetchProducts = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}products`
    )
    response && setProducts(response.data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await DeleteMainProductById(Number(targetSelection.id))
      if (response.success) {
        toast.update(toastId, {
          render: response.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setProducts(prev =>
          prev.filter(item => item.id !== targetSelection?.id)
        )
      }
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
          onSearch={onSearch}
          onClick={() => navigate("/products?mode=create")}
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
                ข้อมูลสินค้าหน้าร้าน
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                ราคาปกติ
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                ราคาโปรโมชั่น
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                สถานะสินค้า
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                การมองเห็น
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginated.length > 0 ? (
              paginated.map((product, index) => (
                <TableRow key={index} className="text-nowrap">
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <img
                          width={40}
                          height={40}
                          src={
                            product.image_url
                              ? `${PUBLIC_STATIC}products/${product.image_url}`
                              : "/blank-profile.png"
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={e => handleImageError(e, "product")}
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {product.name} ({product.unitname})
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/products?mode=view&v=${product.id}`)
                            }
                          >
                            <Badge size="sm" color="primary">
                              <EyeIcon /> ดูรายละเอียด
                            </Badge>
                          </button>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    <Badge size="sm" color="light">
                      {`${formatNumber(
                        Number(product.price)
                      )} ${product.currency}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    <Badge size="sm" color="light">
                      {`${formatNumber(
                        Number(product.regular_price)
                      )} ${product.currency.toString()}`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={
                        product.product_type === "TYPE_1"
                          ? "primary"
                          : product.product_type === "TYPE_2"
                            ? "error"
                            : product.product_type === "TYPE_3"
                              ? "success"
                              : product.product_type === "TYPE_4"
                                ? "light"
                                : product.product_type === "TYPE_5"
                                  ? "warning"
                                  : "light"
                      }
                    >
                      {product.product_type === "TYPE_1"
                        ? "สินค้าใหม่"
                        : product.product_type === "TYPE_2"
                          ? "สินค้าขายดี"
                          : product.product_type === "TYPE_3"
                            ? "สินค้าแนะนำ"
                            : product.product_type === "TYPE_4"
                              ? "สินค้าทั่วไป"
                              : product.product_type === "TYPE_5"
                                ? "สินค้าโปรโมชั่น"
                                : "ไม่ระบุประเภท"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={product.status ? "success" : "error"}
                    >
                      {product.status ? "แสดง" : "ไม่แสดง"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          navigate(`/products?mode=edit&v=${product.id}`)
                        }
                      >
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          openModal(), setTargetSelection(product)
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
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton
        className="top-0 m-4 max-w-[600px]"
      >
        <DeleteDiaglog
          prefix="สินค้า"
          target={targetSelection}
          onDelete={handlerDelete}
          onClose={closeModal}
        />
      </Modal>
    </div>
  )
}
export default ViewMainProduct
