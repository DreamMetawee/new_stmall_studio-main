import { EyeIcon, SquarePenIcon, TrashBinIcon } from "../../icons"
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
import { useEffect, useState } from "react"
import { AuthSending } from "../../utils/api"
import { ProductProps } from "../../props/Product"
import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import ResponsiveImage from "../ui/images/ResponsiveImage"

const ProductPage = () => {
  const { isOpen, openModal, closeModal } = useModal()

  const [products, setProducts] = useState<ProductProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )

  const fetchProducts = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}products`
    )
    response && setProducts(response.data)
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredUsers = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / perPage)

  return (
    <div>
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
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((product, index) => (
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
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {product.name} ({product.unitname})
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          <button
                            type="button"
                            onClick={() => {
                              setTargetSelection(product), openModal()
                            }}
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
                            : "success"
                      }
                    >
                      {product.product_type === "TYPE_1"
                        ? "สินค้าใหม่"
                        : product.product_type === "TYPE_2"
                          ? "สินค้าขายดี"
                          : "สินค้าแนะนำ"}
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
                      <Button size="xs" variant="outline">
                        <SquarePenIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
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
        onClose={closeModal}
        showCloseButton={true}
        className={`mb-4 h-screen max-h-[800px] max-w-[1140px]`}
      >
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              รายละเอียดสินค้า
            </h4>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <ResponsiveImage
                  src={`${PUBLIC_STATIC}products/${targetSelection?.image_url}`}
                />
              </div>
              <div className="col-span-2 flex h-72 flex-col lg:col-span-1">
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  {targetSelection?.name}
                </h5>
                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  {targetSelection?.description}
                </p>
                <div className="mt-auto inline-flex items-center justify-between">
                  <Badge>
                    ราคาปกติ{" "}
                    {`${formatNumber(
                      Number(targetSelection?.price)
                    )} ${targetSelection?.currency}`}
                  </Badge>
                  {Number(targetSelection?.regular_price) > 0 && (
                    <Badge color="error">
                      ราคาโปรโมชั่น{" "}
                      {`${formatNumber(
                        Number(targetSelection?.regular_price)
                      )} ${targetSelection?.currency}`}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
export default ProductPage
