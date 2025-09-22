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
import { PromotionProps } from "../../../props/Product"
import DeleteDiaglog from "../../common/DeleteDiaglog"
import Badge from "../../ui/badge/Badge"
import CreatePromotionForm from "./CreatePromotionForm"
import { handleImageError } from "../../../utils/image"

const PromotionsTable = () => {
  const { isOpen, openModal, closeModal } = useModal()
  const [products, setProducts] = useState<PromotionProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const [editData, setEditData] = useState<PromotionProps | undefined>(
    undefined
  )
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  useEffect(() => {
    isCreate && openModal()
  }, [isCreate])

  const closeModalA = () => {
    navigate("/promotions")
    closeModal()
  }

  const fetchBrands = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}promotions`
    )
    response && setProducts(response.data)
  }

  useEffect(() => {
    fetchBrands()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredPromotions = products.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredPromotions.length
  const totalPages = Math.ceil(totalItems / perPage)

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}promotions/delete/${targetSelection?.id}`
      )

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
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
      fetchBrands()
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
                รายละเอียดสินค้า
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                รายละเอียด
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((slide, index) => (
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
                            slide.image_url
                              ? `${PUBLIC_STATIC}promotions/${slide.image_url}`
                              : "/blank-profile.png"
                          }
                          className="h-full w-full object-cover"
                          alt={slide.name}
                          onError={e => handleImageError(e, "product")}
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {slide.name}
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          {slide.link ? (
                            <Link to={slide.link} target="_blank">
                              <Badge size="sm" color="primary">
                                <ExternalLinkIcon />
                                ลิงค์เว็บไซต์
                              </Badge>
                            </Link>
                          ) : (
                            <Badge size="sm" color="light">
                              <ExternalLinkIcon />
                              ไม่พบลิงค์เว็บไซต์
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-xs px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {slide.description ?? "ไม่พบข้อมูล"}
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          setEditData(slide)
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
                          openModal(), setTargetSelection(slide)
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
        onClose={() => {
          closeModalA()
          setEditData(undefined)
          navigate("/brands") // reset query if needed
        }}
        showCloseButton={false}
        className={`mb-4 max-w-[700px]`}
      >
        {editData ? (
          <CreatePromotionForm
            reFetching={fetchBrands}
            onClose={() => {
              closeModalA()
              setEditData(undefined)
              navigate("/promotions")
            }}
            editData={editData}
          />
        ) : isCreate ? (
          <CreatePromotionForm
            reFetching={fetchBrands}
            onClose={() => {
              closeModalA()
              navigate("/promotions")
            }}
          />
        ) : (
          <DeleteDiaglog
            prefix="โปรโมชั่น"
            target={targetSelection}
            onDelete={handlerDelete}
            onClose={() => {
              closeModalA()
              navigate("/promotions")
            }}
          />
        )}
      </Modal>
    </div>
  )
}
export default PromotionsTable
