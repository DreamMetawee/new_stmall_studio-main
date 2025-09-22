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
import { ExternalLinkIcon, SquarePenIcon, TrashBinIcon } from "../../../icons"
import { Link, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { useQueryParam } from "../../../utils/string"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../../utils/meta"
import { AuthSending } from "../../../utils/api"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"
import { toast } from "react-toastify"
import { useUser } from "../../../context/UserContext"
import NotFound from "../../../pages/OtherPage/NotFound"
import { HeroProductProps } from "../../../props/Product"
import DeleteDiaglog from "../../common/DeleteDiaglog"
import CreateHeroProductForm from "./CreateHeroProductForm"
import Badge from "../../ui/badge/Badge"
import { handleImageError } from "../../../utils/image"

const HeroProductsTable = () => {
  const { session } = useUser()
  const { isOpen, openModal, closeModal } = useModal()
  const [products, setProducts] = useState<HeroProductProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")
  const [isDeleting, setSetDeleting] = useState(false)

  useEffect(() => {
    isCreate && openModal()
  }, [isCreate])

  const closeModalA = () => {
    navigate("/hero-products")
    setTargetSelection(undefined)
    setSetDeleting(false)
    closeModal()
  }

  const fetchProducts = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}hero-products`
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

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}hero-products/delete/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setProducts(prev =>
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

  if (session?.permission !== "admin") {
    return <NotFound />
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
                ข้อมูลสินค้าหลัก
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                รายละเอียดสินค้า
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
                              ? `${PUBLIC_STATIC}hero-products/${product.image_url}`
                              : "/blank-profile.png"
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={e => handleImageError(e, "product")}
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {product.name}
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          {product.link ? (
                            <Link to={product.link} target="_blank">
                              <Badge size="sm" color="primary">
                                <ExternalLinkIcon />
                                ลิงค์เว็บไซต์
                              </Badge>
                            </Link>
                          ) : (
                            <Badge
                              size="sm"
                              color="light"
                              className="cursor-not-allowed select-none"
                            >
                              <ExternalLinkIcon />
                              ไม่พบลิงค์
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-xs px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {product.description ?? "ไม่พบข้อมูล"}
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
                        onClick={() => {
                          setTargetSelection(product)
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
                          openModal(),
                            setTargetSelection(product),
                            setSetDeleting(true)
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
        className={`mb-4 ${isCreate || !isDeleting ? "max-w-[700px]" : "max-w-[507px]"}`}
      >
        {isCreate || !isDeleting ? (
          <CreateHeroProductForm
            reFetching={fetchProducts}
            onClose={closeModalA}
            editHeroProduct={targetSelection} // << new
          />
        ) : (
          <DeleteDiaglog
            prefix="สินค้า"
            target={targetSelection}
            onDelete={handlerDelete}
            onClose={closeModalA}
          />
        )}
      </Modal>
    </div>
  )
}
export default HeroProductsTable
