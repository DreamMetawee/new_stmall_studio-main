import { useEffect, useState } from "react"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { PrivacyPolicyProp } from "../../props/Policy"

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
import EditPrivacyPolicyForm from "../../components/policy/Privacypolicy/edit_privacyform"


export default function CookiePolicy() {
  const [policies, setPolicies] = useState<PrivacyPolicyProp[]>([])


  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectPolicyToEdit, setSelectPolicyToEdit] =
    useState<PrivacyPolicyProp | null>(null)
  const [searchTerm] = useState("")
  const [currentPage] = useState(1)
  const [perPage] = useState(10)
  const [showCreateModal] = useState(false)


  const fetchData = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}privacy-policy/`
      )

      console.log(showCreateModal)

      if (response.status === 200) {
        const data = response.data as PrivacyPolicyProp[]
        const filtered = data.filter(p => p.type === "privacy")
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
      (policy.privacy_title?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      ) ||
      (policy.privacy_content?.toLowerCase() ?? "").includes(
        searchTerm.toLowerCase().trim()
      )
  )

  const paginatedPolicies = filteredPolicies.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )


  
  

  const openEditModal = (policy: PrivacyPolicyProp) => {
    setSelectPolicyToEdit(policy)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setSelectPolicyToEdit(null)
  }


  const handleUpdatePolicy = async (updatedPolicy: PrivacyPolicyProp) => {
    const toastId = toast.loading("กำลังบันทึกการแก้ไข...")
    try {
      const response = await AuthSending().patch(
        `${API_ENDPOINT}${API_VERSION}privacy-policy/privacyPolicy/${updatedPolicy.id}`,
        {
          title: updatedPolicy.privacy_title,
          content: updatedPolicy.privacy_content,
        }
      )
      if (response.status === 200) {
        toast.update(toastId, {
          render: `แก้ไขนโยบาย "${updatedPolicy.privacy_title}" สำเร็จ ✅`,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        fetchData()
      } else {
        console.error("❌ Error updating policy:", response.statusText)
        toast.update(toastId, {
          render: `เกิดข้อผิดพลาดในการแก้ไข "${updatedPolicy.privacy_title}" ❌: ${response.statusText}`,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error("🔥 API error:", error)
      toast.update(toastId, {
        render: `เกิดข้อผิดพลาดในการแก้ไข "${updatedPolicy.privacy_title}" ❌: ${(error as Error).message}`,
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
        title={`${WEBSITE_TITLE} | นโยบายความเป็นส่วนตัว`}
        description={WEBSITE_DESCRIPTION}
      />

      <PageBreadcrumb pageTitle="นโยบายความเป็นส่วนตัว" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto p-6 pt-4">
          <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
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
                {paginatedPolicies.length > 0 ? (
                  paginatedPolicies.map(policy => [
                    // Row 1: Title + Edit button
                    <TableRow
                      key={`${policy.id}-title`}
                      className="border-b border-gray-200"
                    >
                      <TableCell className="text-primary px-3 py-4 text-left text-base font-semibold dark:text-gray-300">
                        {policy.privacy_title}
                      </TableCell>

                      <TableCell className="px-3 py-4 text-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="items-end p-2"
                          onClick={() => openEditModal(policy)}
                        >
                          <SquarePenIcon />
                          แก้ไข
                        </Button>
                      </TableCell>
                    </TableRow>,

                    // Row 2: Content
                    <TableRow key={`${policy.id}-content`}>
                      <TableCell
                        colSpan={2}
                        
                      >
                        <div
                          className="prose dark:prose-invert max-h-full max-w-full rounded-2xl border-2 p-6 text-wrap dark:text-gray-100"
                          dangerouslySetInnerHTML={{
                            __html: policy.privacy_content,
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
          <EditPrivacyPolicyForm
            policy={selectPolicyToEdit}
            onUpdate={handleUpdatePolicy}
            onClose={closeEditModal}
          />
        </Modal>
      )}
    </>
  )
}
