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

import Badge from "../../ui/badge/Badge"
import Button from "../../ui/button/Button"
import { SquarePenIcon, TrashBinIcon } from "../../../icons"
import { Link, useNavigate } from "react-router"
import { useEffect, useState } from "react"
import { UserProps } from "../../../props/User"
import { formatPhoneNumber, useQueryParam } from "../../../utils/string"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../../utils/meta"
import { AuthSending } from "../../../utils/api"
import { Modal } from "../../ui/modal"
import { useModal } from "../../../hooks/useModal"
import { toast } from "react-toastify"
import { useUser } from "../../../context/UserContext"
import NotFound from "../../../pages/OtherPage/NotFound"
import DeleteUserDialog from "./DeleteUserDialog"
import CreateUserForm from "./CreateUserForm"
import { handleImageError } from "../../../utils/image"

export default function UserTablesOne() {
  const { session } = useUser()
  const { isOpen, openModal, closeModal } = useModal()
  const [Users, setUsers] = useState<UserProps[]>([])
  const [targetSelection, setTargetSelection] = useState<any | undefined>(
    undefined
  )
  const navigate = useNavigate()
  const isCreate = useQueryParam("create")

  useEffect(() => {
    isCreate && openModal()
  }, [isCreate])

  const closeModalA = () => {
    navigate("/users")
    closeModal()
  }

  const fetchUsers = async () => {
    const response = await AuthSending().get(
      `${API_ENDPOINT}${API_VERSION}users`
    )
    response && setUsers(response.data)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const filteredUsers = Users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  )

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  )

  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / perPage)

  const handlerDelete = async () => {
    const toastId = toast.loading("กรุณารอสักครู่...")

    try {
      const response = await AuthSending().delete(
        `${API_ENDPOINT}${API_VERSION}users/${targetSelection?.id}`
      )
      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        setUsers(prev => prev.filter(item => item.id !== targetSelection?.id))
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

  if (session?.permission !== "admin") {
    return <NotFound />
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
                รายละเอียดผู้ใช้
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                ข้อมูลติดต่อ
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                สิทธิ์การใช้งาน
              </TableCell>
              <TableCell
                isHeader
                className="text-theme-xs px-5 py-3 text-start font-medium text-gray-500 dark:text-gray-400"
              >
                สถานะบัญชี
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <TableRow key={user.id} className="text-nowrap">
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
                            user.avatar
                              ? `${PUBLIC_STATIC}users/${user.avatar}`
                              : "/blank-profile.png"
                          }
                          alt={user.name}
                          onError={e => handleImageError(e, "profile")}
                        />
                      </div>
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {user.id !== session?.id
                            ? `${user.name} (${user.nickname})`
                            : "บัญชีของคุณ"}
                        </span>
                        <span className="text-theme-xs block text-gray-500 dark:text-gray-400">
                          {user.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-theme-xs px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    {formatPhoneNumber(user.phone)}
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={user.permission === "admin" ? "success" : "error"}
                    >
                      {user.permission === "admin"
                        ? "ผู้ดูแลระบบ"
                        : "ผู้ใช้งาน"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-start text-gray-500 dark:text-gray-400">
                    <Badge size="sm" color={user.status ? "success" : "error"}>
                      {user.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-theme-sm px-4 py-3 text-gray-500 dark:text-gray-400">
                    <div className="inline-flex gap-1">
                      <Link
                        to={`/users/${user.id}`}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-gray-700 ring-1 ring-gray-300 transition ring-inset hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                      >
                        <SquarePenIcon />
                      </Link>
                      <Button
                        size="xs"
                        variant="outline"
                        className="hover:text-error-500"
                        onClick={() => {
                          openModal(), setTargetSelection(user)
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
        onClose={closeModalA}
        showCloseButton={false}
        className={`mb-4 ${isCreate ? "max-w-[700px]" : "max-w-[507px]"}`}
      >
        {isCreate ? (
          <CreateUserForm reFetching={fetchUsers} onClose={closeModalA} />
        ) : (
          <DeleteUserDialog
            target={targetSelection}
            onDelete={handlerDelete}
            onClose={closeModalA}
          />
        )}
      </Modal>
    </div>
  )
}
