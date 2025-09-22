import { useEffect, useState } from "react"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { ConditionPolicyProp } from "../../props/Policy"
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
import EditConditionForm from "../../components/policy/conditionspolicyprop/edit_conditionsform"

export default function ConditionPolicy() {
  const [policies, setPolicies] = useState<ConditionPolicyProp[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectPolicyToEdit, setSelectPolicyToEdit] =
    useState<ConditionPolicyProp | null>(null)
  const [searchTerm] = useState("")
  const [currentPage] = useState(1)
  const [perPage ] = useState(10)


  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}condition-policy/`
      )
      if (response.status === 200) {
        const data = response.data as ConditionPolicyProp[]
        const filtered = data.filter(p => p.type === "condition")
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
      (policy.condition_title?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      ) ||
      (policy.condition_content?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      )
  )

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )



  const openEditModal = (policy: ConditionPolicyProp) => {
    setSelectPolicyToEdit(policy)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectPolicyToEdit(null)
  }


  const handleUpdatePolicy = async (updatedPolicy: ConditionPolicyProp) => {
    const toastId = toast.loading("กำลังบันทึกการแก้ไข...")
    try {
      const response = await AuthSending().patch(
        `${API_ENDPOINT}${API_VERSION}condition-policy/conditionPolicy/${updatedPolicy.id}`,
        {
          title: updatedPolicy.condition_title,
          content: updatedPolicy.condition_content,
        }
      )
      if (response.status === 200) {
        toast.update(toastId, {
          render: `แก้ไขนโยบาย \"${updatedPolicy.condition_title}\" สำเร็จ ✅`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        fetchData()
      } else {
        toast.update(toastId, {
          render: `เกิดข้อผิดพลาดในการแก้ไข \"${updatedPolicy.condition_title}\" ❌: ${response.statusText}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        })
      }
    } catch (error) {
      toast.update(toastId, {
        render: `เกิดข้อผิดพลาดในการแก้ไข \"${updatedPolicy.condition_title}\" ❌: ${(error as Error).message}`,
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
        title={`${WEBSITE_TITLE} | นโยบายเงื่อนไข`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="นโยบายเงื่อนไข" />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto p-6">
          <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    หัวข้อ
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedPolicies.length > 0 ? (
                  paginatedPolicies.map(policy => [
                    <TableRow
                      key={policy.id}
                      className="border-b border-gray-200"
                    >
                      <TableCell className="px-5 py-4 text-base text-gray-800 dark:text-white/90">
                        {policy.condition_title}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-end">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(policy)}
                          >
                            <SquarePenIcon />
                            แก้ไข
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>,
                    <TableRow>
                      <TableCell>
                        <div
                          className="prose dark:prose-invert max-h-full max-w-full rounded-2xl border-2 p-6 text-wrap dark:text-gray-100"
                          dangerouslySetInnerHTML={{
                            __html: policy.condition_content,
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

      {isEditModalOpen && selectPolicyToEdit && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          className="max-w-[650px]"
        >
          <EditConditionForm
            policy={selectPolicyToEdit}
            onClose={closeEditModal}
            onUpdate={handleUpdatePolicy}
          />
        </Modal>
      )}
    </>
  )
}
