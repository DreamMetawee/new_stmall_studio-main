import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { UPDATE_EMPLOYEE_ORDER } from "../../../actions/employee.action"
import { useModal } from "../../../hooks/useModal"
import { useTableControl } from "../../../hooks/useTableControl"
import {
  ChevronDownIcon,
  ChevronUpIcon,
  ExpandIcon,
  SquarePenIcon,
  TrashBinIcon,
} from "../../../icons"
import { SaleTeamProps } from "../../../props/Page"
import { AuthSending } from "../../../utils/api"
import { handleImageError } from "../../../utils/image"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../../utils/meta"
import DeleteDiaglog from "../../common/DeleteDiaglog"
import Badge from "../../ui/badge/Badge"
import Button from "../../ui/button/Button"
import ResponsiveImage from "../../ui/images/ResponsiveImage"
import { Modal } from "../../ui/modal"
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
import CreateEmployeeForm from "./CreateEmployeeForm"

const SaleTeamTable = () => {
  const { closeModal, isOpen, openModal } = useModal()

  const [members, setMembers] = useState<SaleTeamProps[]>([])
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}pages/sale-team`
      )
      const { data } = response
      setMembers(data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const [isCreate, setIsCreate] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewImage, setViewImage] = useState<{
    image: string
    name: string
  } | null>(null)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // state ใหม่
  const [targetSelection, setTargetSelection] = useState<any | undefined>()

  const openEditModal = (item: SaleTeamProps) => {
    setTargetSelection(item)
    openModal()
  }

  const handlerDelete = async () => {
    if (!targetSelection) return
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}pages/sale-team/${targetSelection?.id}`
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

  const openDeleteModal = (item: SaleTeamProps) => {
    setIsCreate(false)
    setIsDeleting(true)
    setTargetSelection(item)
    openModal()
  }

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
  } = useTableControl(members, 10)

  const moveItem = async (direction: "up" | "down", index: number) => {
    if (isUpdatingOrder) return

    setIsUpdatingOrder(true)

    try {
      const newItems = [...members]
      const item = newItems[index]

      if (direction === "up" && index > 0) {
        // สลับลำดับกับ item ก่อนหน้า
        const prevItem = newItems[index - 1]
        const tempOrder = item.order_step
        item.order_step = prevItem.order_step
        prevItem.order_step = tempOrder

        // สลับตำแหน่งใน array
        newItems[index] = prevItem
        newItems[index - 1] = item
      } else if (direction === "down" && index < newItems.length - 1) {
        // สลับลำดับกับ item ถัดไป
        const nextItem = newItems[index + 1]
        const tempOrder = item.order_step
        item.order_step = nextItem.order_step
        nextItem.order_step = tempOrder

        // สลับตำแหน่งใน array
        newItems[index] = nextItem
        newItems[index + 1] = item
      } else {
        return
      }

      // อัปเดต state ทันทีเพื่อให้ UI เปลี่ยนแปลง
      setMembers(newItems)

      // ส่งข้อมูลไปยัง API
      const updatePayload = newItems.map((item, idx) => ({
        id: item.id,
        order_step: idx + 1, // หรือใช้ item.order_step ถ้าเก็บค่าเดิม
      }))

      await UPDATE_EMPLOYEE_ORDER(updatePayload)
      toast.success("จัดลำดับขั้นตอนสำเร็จ")
    } catch (error) {
      console.error("Error updating order:", error)
      toast.error("เกิดข้อผิดพลาดในการจัดลำดับ")
      // Rollback ถ้าเกิด error
      fetchData()
    } finally {
      setIsUpdatingOrder(false)
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
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                  <EmptyCell />
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="w-1/12 px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <div className="inline-flex w-full items-center justify-between gap-1">
                      <div className="flex flex-col gap-1">
                        <Button
                          isButton
                          variant="outline"
                          size="xs"
                          onClick={() => moveItem("up", index)}
                          aria-label="Move step up"
                          disabled={index === 0 || isUpdatingOrder}
                        >
                          <ChevronUpIcon />
                        </Button>
                        <Button
                          isButton
                          variant="outline"
                          size="xs"
                          onClick={() => moveItem("down", index)}
                          disabled={
                            index === members.length - 1 || isUpdatingOrder
                          }
                        >
                          <ChevronDownIcon />
                        </Button>
                      </div>
                      <span className="text-xl font-bold">
                        {item.order_step}.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start sm:px-6">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setViewImage({
                            image: item.image_path,
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
                          src={`${PUBLIC_STATIC}employees/${item.image_path}`}
                          alt={item.name}
                          className="h-full w-full object-cover object-top"
                          onError={e => handleImageError(e, "profile")}
                        />
                      </button>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {item.name}
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          <Badge size="sm">{item.position}</Badge>
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-xs w-1/2 px-4 py-3 text-gray-500 dark:text-gray-400">
                    <p>{item.description}</p>
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
                    src={`${PUBLIC_STATIC}employees/${viewImage?.image}`}
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
            <CreateEmployeeForm
              reFetching={fetchData}
              onClose={closeModalA}
              editData={targetSelection}
            />
          ) : (
            <DeleteDiaglog
              prefix="พนักงาน"
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
export default SaleTeamTable
