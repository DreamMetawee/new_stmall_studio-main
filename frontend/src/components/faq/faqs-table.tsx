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
import { ChevronRightIcon, TrashBinIcon } from "../../icons"
import { DELETE_FAQ, GET_FAQ_LIST } from "../../actions/faq.action"
import { FAQProps } from "../../props/FAQs"
import { useModal } from "../../hooks/useModal"
import { toast } from "react-toastify"
import { Modal } from "../ui/modal"
import DeleteDiaglog from "../common/DeleteDiaglog"

const FAQsTable = () => {
  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()

  const [FAQ, setFAQ] = useState<FAQProps[]>([])
  const [selected, setSelected] = useState<any | null>(null)

  const fetchData = async () => {
    const data = (await GET_FAQ_LIST()) || []
    setFAQ(data)
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
  } = useTableControl(FAQ, 10)

  const handlerDelete = async () => {
    await DELETE_FAQ(Number(selected?.id))
    toast.success("ลบข้อมูลสำเร็จ")
    setFAQ(prev => prev.filter(i => i.id !== selected.id))
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto pt-4">
        <TableControl
          perPageLimit={perPage}
          setPerPage={setPerPage}
          search={searchTerm}
          onSearch={onSearch}
          onClick={() => navigate("/faq?mode=create")}
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
                หัวข้อคำถาม
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
            {paginated.length > 0 ? (
              paginated.map((faq, index) => (
                <TableRow key={index} className="group relative text-nowrap">
                  <TableCell className="w-1/12 px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    {index + 1}
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <div className="flex items-center gap-3">
                      <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {faq.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                    <div
                      className="text-theme-sm line-clamp-1 max-w-sm font-medium text-wrap text-gray-800 dark:text-white/90"
                      dangerouslySetInnerHTML={{ __html: faq.answer }}
                    />
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(`/faq?mode=edit&v=${faq.id}`)}
                      >
                        <ChevronRightIcon />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          setSelected(faq)
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

export default FAQsTable
