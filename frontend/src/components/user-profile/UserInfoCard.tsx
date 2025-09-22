import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import Button from "../ui/button/Button"
import Input from "../form/input/InputField"
import Label from "../form/Label"
import { UserProfilePageProps } from "../../pages/UserProfiles"
import { formatPhoneNumber } from "../../utils/string"
import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { UserProps } from "../../props/User"
import { DropdownItem } from "../ui/dropdown/DropdownItem"
import { Dropdown } from "../ui/dropdown/Dropdown"
import { toast } from "react-toastify"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import Badge from "../ui/badge/Badge"

type UserFormData = Pick<UserProps, "name" | "nickname" | "phone" | "username">

export default function UserInfoCard({
  user,
  session,
  reFetching,
}: UserProfilePageProps) {
  const { isOpen, openModal, closeModal } = useModal()
  const [error, setError] = useState<{
    name: boolean
    nickname: boolean
    username: boolean
    phone: boolean
  }>({
    name: false,
    nickname: false,
    username: false,
    phone: false,
  })
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    nickname: "",
    username: "",
    phone: "",
  })
  const [permission, setPermission] = useState<"member" | "admin">("member")
  const [statusAccount, setStatusAccount] = useState<boolean>(true)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name,
        nickname: user?.nickname,
        username: user?.username,
        phone: user?.phone,
      })
      setPermission(user.permission)
      setStatusAccount(user.status)
    }
  }, [user])

  const [isOpenDropdown, setIsOpenDropdown] = useState(false)
  const [isOpenStatusDropdown, setIsOpenStatusDropdown] = useState(false)

  function toggleDropdown() {
    setIsOpenDropdown(!isOpenDropdown)
  }

  function closeDropdown() {
    setIsOpenDropdown(false)
  }

  function validateField(name: keyof UserFormData, value: string) {
    if (name === "phone") {
      const isValidPhone = /^[0-9]{10}$/.test(value)
      setError(prev => ({ ...prev, phone: !isValidPhone }))
    } else {
      setError(prev => ({ ...prev, [name]: value.trim() === "" }))
    }
  }

  function onChangeInput(e: ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // validate real-time
    validateField(name as keyof UserFormData, value)
  }

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const response = await AuthSending().post(
        `${API_ENDPOINT}${API_VERSION}users/update/info/${user?.id}`,
        {
          name: formData.name.trim(),
          nickname: formData.nickname.trim(),
          username: formData.username.trim(),
          phone: formData.phone.trim(),
          permission: permission.trim(),
          status: statusAccount,
        }
      )

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
        reFetching()
      } else throw new Error(response.data.message)
    } catch (error: any) {
      console.error(error.message)
      toast.update(toastId, {
        render: error.message,
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      closeModal()
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 lg:mb-6 dark:text-white/90">
            ข้อมูลส่วนตัว
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ชื่อ
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ชื่อเล่น
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.nickname}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                รหัสพนักงาน
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {user?.username}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                เบอร์โทรศัพท์
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {formatPhoneNumber(String(user?.phone))}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                สิทธิ์การใช้งาน
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <Badge
                  size="sm"
                  color={user?.permission === "admin" ? "success" : "error"}
                >
                  {user?.permission === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                </Badge>
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                สถานะบัญชี
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                <Badge size="sm" color={user?.status ? "success" : "error"}>
                  {user?.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          แก้ไข
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              แก้ไขข้อมูลส่วนตัว
            </h4>
          </div>
          <form onSubmit={handleSave} className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                  ข้อมูลส่วนตัว
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>ชื่อ</Label>
                    <Input
                      type="text"
                      value={formData.name}
                      name="name"
                      onChange={onChangeInput}
                      error={error.name}
                      hint={error.name ? "โปรดระบุชื่อจริง" : ""}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>ชื่อเล่น</Label>
                    <Input
                      type="text"
                      value={formData.nickname}
                      name="nickname"
                      onChange={onChangeInput}
                      error={error.nickname}
                      hint={error.nickname ? "โปรดระบุชื่อเล่น" : ""}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>รหัสพนักงาน</Label>
                    <Input
                      type="text"
                      value={user?.username}
                      name="username"
                      onChange={onChangeInput}
                      error={error.username}
                      hint={error.username ? "โปรดระบุรหัสพนักงาน" : ""}
                      disabled={session?.permission !== "admin"}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>เบอร์โทรศัพท์</Label>
                    <Input
                      type="text"
                      value={formData.phone}
                      name="phone"
                      onChange={onChangeInput}
                      maxLength={10}
                      error={error.phone}
                      hint={error.phone ? "โปรดระบุเบอร์โทรศัพท์" : ""}
                    />
                  </div>

                  {session?.permission === "admin" && (
                    <>
                      <div className="col-span-1">
                        <Label>สิทธิ์การใช้งาน</Label>

                        <div className="relative">
                          <Button
                            isButton
                            size="sm"
                            variant="outline"
                            onClick={toggleDropdown}
                            className="dropdown-toggle flex w-full items-center !justify-between text-gray-700 dark:text-gray-400"
                          >
                            <span className="text-theme-sm mr-1 block font-medium">
                              {permission === "admin"
                                ? "ผู้ดูแลระบบ"
                                : "ผู้ใช้งาน"}
                            </span>
                            <svg
                              className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
                                isOpenDropdown ? "rotate-180" : ""
                              }`}
                              width="18"
                              height="20"
                              viewBox="0 0 18 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Button>

                          <Dropdown
                            isOpen={isOpenDropdown}
                            onClose={closeDropdown}
                            className="shadow-theme-lg dark:bg-gray-dark absolute left-0 flex w-full flex-col rounded-2xl border border-gray-200 bg-white px-3 dark:border-gray-800"
                          >
                            <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                              <li>
                                <DropdownItem
                                  onItemClick={() => {
                                    closeDropdown(), setPermission("admin")
                                  }}
                                  className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  ผู้ดูแลระบบ
                                </DropdownItem>
                                <DropdownItem
                                  onItemClick={() => {
                                    closeDropdown(), setPermission("member")
                                  }}
                                  className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  ผู้ใช้งาน
                                </DropdownItem>
                              </li>
                            </ul>
                          </Dropdown>
                        </div>
                      </div>

                      <div className="col-span-1">
                        <Label>สถานะบัญชี</Label>

                        <div className="relative">
                          <Button
                            isButton
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setIsOpenStatusDropdown(!isOpenStatusDropdown)
                            }
                            className="dropdown-toggle flex w-full items-center !justify-between text-gray-700 dark:text-gray-400"
                          >
                            <span className="text-theme-sm mr-1 block font-medium">
                              {statusAccount ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                            </span>
                            <svg
                              className={`stroke-gray-500 transition-transform duration-200 dark:stroke-gray-400 ${
                                isOpenDropdown ? "rotate-180" : ""
                              }`}
                              width="18"
                              height="20"
                              viewBox="0 0 18 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </Button>

                          <Dropdown
                            isOpen={isOpenStatusDropdown}
                            onClose={() => setIsOpenStatusDropdown(false)}
                            className="shadow-theme-lg dark:bg-gray-dark absolute left-0 flex w-full flex-col rounded-2xl border border-gray-200 bg-white px-3 dark:border-gray-800"
                          >
                            <ul className="flex flex-col gap-1 border-b border-gray-200 pt-4 pb-3 dark:border-gray-800">
                              <li>
                                <DropdownItem
                                  onItemClick={() => {
                                    setIsOpenStatusDropdown(false),
                                      setStatusAccount(true)
                                  }}
                                  className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  เปิดใช้งาน
                                </DropdownItem>
                                <DropdownItem
                                  onItemClick={() => {
                                    setIsOpenStatusDropdown(false),
                                      setStatusAccount(false)
                                  }}
                                  className="group text-theme-sm flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
                                >
                                  ปิดใช้งาน
                                </DropdownItem>
                              </li>
                            </ul>
                          </Dropdown>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                disabled={error.name || error.nickname || error.phone}
                size="sm"
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
              <Button isButton size="sm" variant="outline" onClick={closeModal}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}
