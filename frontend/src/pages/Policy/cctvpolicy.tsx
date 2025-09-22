import { useEffect, useState } from "react"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { CCTVPolicyProp } from "../../props/Policy"
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
import { SquarePenIcon } from "../../icons" // Import SquarePenIcon สำหรับแก้ไข
import EditCCTVForm from "../../components/policy/CCTVpolicy/edit_cctvPolicy"

export default function CCTVPolicy() {
  const [policies, setPolicies] = useState<CCTVPolicyProp[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectPolicyToEdit, setSelectPolicyToEdit] =
    useState<CCTVPolicyProp | null>(null)
  const [searchTerm] = useState("")
  const [currentPage] = useState(1)
  const [perPage] = useState(10)
  const [showCreateModal] = useState(false)


  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}cctv-policy`
      )

      console.log(showCreateModal)

      if (response.status === 200) {
        const data = response.data as CCTVPolicyProp[]
        const filtered = data.filter(p => p.type === "CCTV")
        setPolicies(filtered)
      } else {
        console.error("❌ Error fetching data:", response.statusText)
        toast.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${response.statusText}`)
      }
    } catch (error) {
      console.error("🔥 API error:", error)
      toast.error(`เกิดข้อผิดพลาดในการโหลดข้อมูล: ${(error as Error).message}`)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredPolicies = policies.filter(
    policy =>
      (policy.cctv_title?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      ) ||
      (policy.cctv_content?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      )
  )

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )


  const openEditModal = (policy: CCTVPolicyProp) => {
    setSelectPolicyToEdit(policy)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectPolicyToEdit(null)
  }


  

  const handleUpdatePolicy = async (updatedPolicy: CCTVPolicyProp) => {
    const toastId = toast.loading("กำลังบันทึกการแก้ไข...")
    try {
      const response = await AuthSending().patch(
        `${API_ENDPOINT}${API_VERSION}cctv-policy/${updatedPolicy.id}`,
        updatedPolicy
      )
      if (response.status === 200) {
        toast.update(toastId, {
          render: `แก้ไขนโยบาย "${updatedPolicy.cctv_title}" สำเร็จ ✅`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        fetchData()
      } else {
        console.error("❌ Error updating policy:", response.statusText)
        toast.update(toastId, {
          render: `เกิดข้อผิดพลาดในการแก้ไข "${updatedPolicy.cctv_title}" ❌: ${response.statusText}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error("🔥 API error:", error)
      toast.update(toastId, {
        render: `เกิดข้อผิดพลาดในการแก้ไข "${updatedPolicy.cctv_title}" ❌: ${(error as Error).message}`,
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
        title={`${WEBSITE_TITLE} | นโยบายการใช้กล้องวงจรปิด`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="นโยบายการใช้กล้องวงจรปิด" />
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
                      <TableCell className="px-5 py-4 text-gray-800 dark:text-white/90">
                        {policy.cctv_title}
                      </TableCell>

                      <TableCell className="px-5 py-4 text-end">
                        <div className="inline-flex gap-2">
                          <Button
                            size="xs"
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
                      <TableCell >
                        <div
                          className="prose dark:prose-invert max-h-full max-w-full rounded-2xl border-2 p-6 text-wrap dark:text-gray-100"
                          dangerouslySetInnerHTML={{
                            __html: policy.cctv_content,
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
          className="max-w-xl"
        >
          <EditCCTVForm
            policy={selectPolicyToEdit}
            onUpdate={handleUpdatePolicy}
            onClose={closeEditModal}
          />
        </Modal>
      )}
    </>
  )
}
