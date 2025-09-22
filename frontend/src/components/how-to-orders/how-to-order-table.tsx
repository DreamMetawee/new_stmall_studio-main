import { useEffect, useState } from "react"
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
import { useTableControl } from "../../hooks/useTableControl"
import { useNavigate } from "react-router"
import Button from "../ui/button/Button"
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  TrashBinIcon,
} from "../../icons"
import { useModal } from "../../hooks/useModal"
import { toast } from "react-toastify"
import { Modal } from "../ui/modal"
import DeleteDiaglog from "../common/DeleteDiaglog"
import {
  DELETE_HOW_TO_ORDER,
  GET_HOW_TO_ORDER,
  UPDATE_HOW_TO_ORDER_ORDER,
} from "../../actions/how-to-order.action"
import { HowToOrderProps } from "../../props/HowToOrder"
import { getImageUrl } from "../../utils/helper"
import { handleImageError } from "../../utils/image"

const HowToOrderTable = () => {
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()

  const [howToItems, setHowToItems] = useState<HowToOrderProps[]>([])
  const [selected, setSelected] = useState<any | null>(null)
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false)

  const fetchData = async () => {
    const data = (await GET_HOW_TO_ORDER()) || []
    // เรียงลำดับตาม order_step
    const sortedData = [...data].sort((a, b) => a.order_step - b.order_step)
    setHowToItems(sortedData)
  }

  useEffect(() => {
    fetchData()
  }, [])

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
  } = useTableControl(howToItems, 10)

  const handlerDelete = async () => {
    if (!selected?.id) return
    await DELETE_HOW_TO_ORDER(selected.id)
    toast.success("ลบข้อมูลสำเร็จ")
    setHowToItems(prev => prev.filter(i => i.id !== selected.id))
  }

  const moveItem = async (direction: "up" | "down", index: number) => {
    if (isUpdatingOrder) return

    setIsUpdatingOrder(true)

    try {
      const newItems = [...howToItems]
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
      setHowToItems(newItems)

      // ส่งข้อมูลไปยัง API
      const updatePayload = newItems.map((item, idx) => ({
        id: item.id,
        order_step: idx + 1, // หรือใช้ item.order_step ถ้าเก็บค่าเดิม
      }))

      await UPDATE_HOW_TO_ORDER_ORDER(updatePayload)
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
          onClick={() => navigate("/howto-order?mode=create")}
        />

        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                ลำดับขั้นตอน
              </TableCell>
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
                หัวข้อขั้นตอน
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs max-w-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                รายละเอียด
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginated.length > 0 ? (
              paginated.map((hto, index) => (
                <TableRow key={hto.id} className="group relative text-nowrap">
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
                            index === howToItems.length - 1 || isUpdatingOrder
                          }
                        >
                          <ChevronDownIcon />
                        </Button>
                      </div>
                      <span className="text-xl font-bold">
                        {hto.order_step}.
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-1/12 px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <figure className="max-w-40 min-w-20 rounded-lg p-2 dark:bg-white">
                      <img
                        src={getImageUrl("hto-image", hto.image)}
                        alt="preview"
                        className="h-full w-full rounded-lg object-cover"
                        onError={e => handleImageError(e, "blank")}
                      />
                    </figure>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <div>
                      <p className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                        {hto.name}
                      </p>
                      <span className="inline-flex items-center gap-0.5 text-xs font-normal text-gray-400 dark:text-gray-400">
                        {hto.sub_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <div
                      className="text-theme-sm line-clamp-2 font-medium text-wrap text-gray-800 dark:text-white/90"
                      dangerouslySetInnerHTML={{ __html: hto.description }}
                    />
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() =>
                          navigate(`/howto-order?mode=edit&v=${hto.id}`)
                        }
                      >
                        <ChevronRightIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          setSelected(hto)
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
          onPageChange={setCurrentPage}
        />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className={`mb-4 max-w-[550px]`}
      >
        <DeleteDiaglog
          target={selected}
          onDelete={handlerDelete}
          onClose={closeModal}
          prefix="หัวข้อคำถาม"
        />
      </Modal>
    </div>
  )
}

export default HowToOrderTable
