import { useEffect, useState } from "react"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { ExchangePolicyProp } from "../../props/Policy"
import {  SquarePenIcon } from "../../icons"
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
import EditExchangePolicyForm from "../../components/policy/Exchangepolicyprop/edit_exchangeform"


export default function ExchangePolicy() {
  const [policies, setPolicies] = useState<ExchangePolicyProp[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectPolicyToEdit, setSelectPolicyToEdit] =
    useState<ExchangePolicyProp | null>(null)
  const [searchTerm] = useState("")
  const [currentPage] = useState(1)
  const [perPage] = useState(10)


  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}exchange-policy/`
      )
      if (response.status === 200) {
        const data = response.data as ExchangePolicyProp[]
        const filtered = data.filter(p => p.type === "exchange")
        setPolicies(filtered)
      } else {
        toast.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${response.statusText}`)
      }
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${(error as Error).message}`)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredPolicies = policies.filter(
    policy =>
      (policy.exchange_title?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      ) ||
      (policy.exchange_content?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      )
  )

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )






  const openEditModal = (policy: ExchangePolicyProp) => {
    setSelectPolicyToEdit(policy)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectPolicyToEdit(null)
  }


  
  const handleUpdatePolicy = async (updatedPolicy: ExchangePolicyProp) => {
    const toastId = toast.loading("กำลังบันทึกการแก้ไข...")
    try {
      const response = await AuthSending().patch(
        `${API_ENDPOINT}${API_VERSION}exchange-policy/exchangePolicy/${updatedPolicy.id}`,
        {
          title: updatedPolicy.exchange_title,
          content: updatedPolicy.exchange_content,
        }
      )
      if (response.status === 200) {
        toast.update(toastId, {
          render: `แก้ไขนโยบาย \"${updatedPolicy.exchange_title}\" สำเร็จ ✅`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        fetchData()
      } else {
        toast.update(toastId, {
          render: `เกิดข้อผิดพลาดในการแก้ไข \"${updatedPolicy.exchange_title}\" ❌: ${response.statusText}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        })
      }
    } catch (error) {
      toast.update(toastId, {
        render: `เกิดข้อผิดพลาดในการแก้ไข \"${updatedPolicy.exchange_title}\" ❌: ${(error as Error).message}`,
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
        title={`${WEBSITE_TITLE} | นโยบายการแลกเปลี่ยน`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="นโยบายการแลกเปลี่ยน" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto p-6">
          <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-6 py-4 text-start font-semibold text-gray-600 dark:text-gray-300"
                  >
                    หัวข้อ
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedPolicies.length > 0 ? (
                  paginatedPolicies.map(policy => (
                    <>
                      <TableRow
                        key={`header-${policy.id}`}
                        className="border-b border-gray-200"
                      >
                        <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {policy.exchange_title}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(policy)}
                          >
                            <SquarePenIcon /> แก้ไข
                          </Button>
                        </TableCell>
                      </TableRow>

                      <TableRow key={`content-${policy.id}`}>
                        <TableCell
                          colSpan={2}
                          
                        >
                          <div
                            className="prose dark:prose-invert max-h-full max-w-full rounded-2xl border-2 p-6 text-wrap dark:text-gray-100"
                            dangerouslySetInnerHTML={{
                              __html: policy.exchange_content,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    </>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <EmptyCell />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>



      {isEditModalOpen && selectPolicyToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          className="max-w-xl"
        >
          <EditExchangePolicyForm
            policy={selectPolicyToEdit}
            onUpdate={handleUpdatePolicy}
            onClose={closeEditModal}
          />
        </Modal>
      )}


    </>
  )
}
