// DeliveryTerms.tsx
import { useEffect, useState } from "react"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { DeliveryTermProp } from "../../props/Policy"
import { SquarePenIcon } from "../../icons"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Modal } from "../../components/ui/modal"
import PageMeta from "../../components/common/PageMeta"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"
import {
  EmptyCell,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import Button from "../../components/ui/button/Button"
import EditDeliveryForm from "../../components/policy/deliveryTerm/edit_deliveryform"


export default function DeliveryTerms() {
  const [terms, setTerms] = useState<DeliveryTermProp[]>([])

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedToEdit, setSelectedToEdit] = useState<DeliveryTermProp | null>(
    null
  )
  const [searchTerm] = useState("")
  const [currentPage] = useState(1)
  const [perPage] = useState(10)

  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}delivery-terms`
      )
      if (response.status === 200) {
        setTerms(response.data as DeliveryTermProp[])
      } else {
        toast.error(`โหลดข้อมูลผิดพลาด: ${response.statusText}`)
      }
    } catch (error) {
      toast.error(`โหลดข้อมูลผิดพลาด: ${(error as Error).message}`)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filtered = terms.filter(
    term =>
      (term.delivery_term_title?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      ) ||
      (term.delivery_term_content?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      )
  )

  const paginated = filtered.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )


  const openEditModal = (term: DeliveryTermProp) => {
    setSelectedToEdit(term)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setSelectedToEdit(null)
    setIsEditModalOpen(false)
  }





  const handleUpdate = async (term: DeliveryTermProp) => {
    const toastId = toast.loading("กำลังบันทึกการแก้ไข...")
    try {
      const response = await AuthSending().patch(
        `${API_ENDPOINT}${API_VERSION}delivery-terms/${term.id}`,
        {
          delivery_term_title: term.delivery_term_title,
          delivery_term_content: term.delivery_term_content,
        }
      )
      if (response.status === 200) {
        toast.update(toastId, {
          render: `แก้ไข "${term.delivery_term_title}" สำเร็จ ✅`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        fetchData()
      } else {
        toast.update(toastId, {
          render: `แก้ไขไม่สำเร็จ ❌: ${response.statusText}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        })
      }
    } catch (error) {
      toast.update(toastId, {
        render: `แก้ไขไม่สำเร็จ ❌: ${(error as Error).message}`,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      closeEditModal()
    }
  }

  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | นโยบายการจัดส่ง`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="นโยบายการจัดส่ง" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto p-6 pt-4">
          <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800 ">
            <Table> 
              <div className="space-y-6">
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-left text-sm whitespace-nowrap text-gray-700 dark:text-gray-300"
                    >
                      หัวข้อ
                    </TableCell>
                  </TableRow>
                </TableHeader>
              </div>

              <TableBody>
                {paginated.length > 0 ? (
                  paginated.map(term => [
                    // แถวแรก: Title
                    <TableRow
                      key={`${term.id}-title`}
                      className="hover:bg-muted/50 border-b transition"
                    >
                      <TableCell className="text-primary px-3 py-4 text-left text-sm font-semibold  dark:text-gray-300">
                        {term.delivery_term_title}
                      </TableCell>

                      <TableCell className="px-3 py-4 text-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="items-end p-2"
                          onClick={() => openEditModal(term)}
                        >
                          <SquarePenIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>,

                    // แถวสอง: Content
                    <TableRow key={`${term.id}-content`}>
                      <TableCell
                        colSpan={2}
                        className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <div
                          className="prose dark:prose-invert max-h-full max-w-full rounded-2xl border-2 p-6 text-wrap dark:text-gray-100"
                          dangerouslySetInnerHTML={{
                            __html: term.delivery_term_content,
                          }}
                        />
                      </TableCell>
                    </TableRow>,
                  ])
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <EmptyCell />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isEditModalOpen && selectedToEdit && (
        <Modal isOpen onClose={closeEditModal} className="max-w-[650px]">
          <EditDeliveryForm
            isOpen={true}
            deliveryData={selectedToEdit}
            onClose={closeEditModal}
            onUpdate={handleUpdate}
          />
        </Modal>
      )}

    </>
  )
}
