import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "react-toastify"
import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableControl,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { AuthSending } from "../../utils/api"
import { EyeIcon, MessageIcon, TrashBinIcon } from "../../icons"
import { CustomerContactProps } from "../../props/SendEmail"
import { Modal } from "../../components/ui/modal"
import DeleteDiaglog from "../../components/common/DeleteDiaglog"
import { useModal } from "../../hooks/useModal"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../../utils/meta"
import Button from "../../components/ui/button/Button"
import PageMeta from "../../components/common/PageMeta"
import PageBreadcrumb from "../../components/common/PageBreadCrumb"

const CustomerContactPage = () => {
  const [search, setSearch] = useState<string>("")
  const [filteredData, setFilteredData] = useState<CustomerContactProps[]>([])
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [customerContact, setCustomerContact] = useState<
    CustomerContactProps[]
  >([])

  const navigate = useNavigate()
  const { isOpen, openModal, closeModal } = useModal()
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [perPage, setPerPage] = useState(10)

  const closeModalA = () => {
    navigate("/send-mail")
    closeModal()
    setTargetSelection(undefined)
    setIsDeleting(false)
  }

  const fetchServices = async () => {
    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}sendEmail`
      )
      setCustomerContact(response.data)
    } catch (error) {
      console.error("Error fetching email:", error)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  useEffect(() => {
    if (!Array.isArray(customerContact)) {
      console.error(
        "Error: serviceCategories is not an array!",
        customerContact
      )
      setFilteredData([]) // ป้องกัน error
      return
    }
  })
  const filteredItems = customerContact?.filter(customerContact =>
    (customerContact.name ?? "").toLowerCase().includes(search.toLowerCase())
  )

  const paginatedUsers = filteredItems.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredItems.length
  const totalPages = Math.ceil(totalItems / perPage)

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}sendEmail/delete/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setCustomerContact(prev =>
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
  return (
    <div>
      <div>
        <PageMeta
          title={`${WEBSITE_TITLE} | หน้าจัดการ Email`}
          description={WEBSITE_DESCRIPTION}
        />
        <PageBreadcrumb pageTitle="จัดการ Email" />
        <div className="space-y-6"></div>
        <div className="card bg-base-100 shadow">
          <div className="card-body">
            <TableControl
              perPageLimit={perPage}
              setPerPage={setPerPage}
              search={search}
              onSearch={value => {
                setSearch(value)
                setCurrentPage(1) // รีเซ็ตหน้าเมื่อค้นหา
              }}
              options={[5, 10, 20]}
              showOnClick={false}
            />

            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    ID
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    ชื่อ
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    อีเมล
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    เบอร์โทรศัพท์
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    หัวข้อเรื่อง
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    ข้อความ
                  </TableCell>
                  <TableCell
                    isHeader
                    className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
                  >
                    Status
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedUsers.length > 0
                  ? paginatedUsers.map((customerContact, index) => (
                      <TableRow key={index} className="text-nowrap">
                        <TableCell className="px-5 py-4 text-start text-gray-800 sm:px-6 dark:text-white/90">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {customerContact.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {customerContact.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {customerContact.phone}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {customerContact.subject}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-gray-100">
                              {customerContact.message}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-1 gap-2">
                            <Button
                              className="btn btn-sm btn-soft btn-warning rounded-lg"
                              size="sm"
                              onClick={() =>
                                navigate(`/send-mail/${customerContact.id}`)
                              }
                            >
                              <EyeIcon />
                            </Button>
                            <Button
                              className="btn btn-sm btn-ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/send-mail/${customerContact.id}/editor`,
                                  {
                                    state: {
                                      customer: customerContact, // ✅ ส่ง customer เข้าไปตรงๆ
                                    },
                                  }
                                )
                              }
                            >
                              <MessageIcon />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsDeleting(true)
                                setTargetSelection(customerContact)
                                openModal()
                              }}
                            >
                              <TrashBinIcon />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  : []}
              </TableBody>
            </Table>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredData.length}
              perPage={perPage}
            />
          </div>
        </div>
        {isDeleting && (
          <Modal
            isOpen={isOpen}
            onClose={closeModalA}
            showCloseButton={false}
            className={`mb-4 ${targetSelection ? "max-w-[700px]" : "max-w-[507px]"}`}
          >
            <DeleteDiaglog
              prefix="Review"
              target={targetSelection}
              onDelete={handlerDelete}
              onClose={closeModalA}
            />
          </Modal>
        )}
      </div>
    </div>
  )
}

export default CustomerContactPage
