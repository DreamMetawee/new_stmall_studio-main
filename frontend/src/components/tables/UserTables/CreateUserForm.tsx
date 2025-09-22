import { ChangeEvent, useState } from "react"
import Button from "../../ui/button/Button"
import { UserProps } from "../../../props/User"
import Label from "../../form/Label"
import Input from "../../form/input/InputField"
import { useUser } from "../../../context/UserContext"
import { DropdownItem } from "../../ui/dropdown/DropdownItem"
import { Dropdown } from "../../ui/dropdown/Dropdown"
import { toast } from "react-toastify"
import { AuthSending } from "../../../utils/api"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../../utils/meta"

type UserFormData = Pick<UserProps, "name" | "nickname" | "phone" | "username">

interface CreateUserFormProps {
  reFetching: () => void
  onClose: () => void
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  reFetching,
  onClose,
}) => {
  const { session } = useUser()
  const [error, setError] = useState<{
    name: boolean
    nickname: boolean
    username: boolean
    password: boolean
    phone: boolean
  }>({
    name: true,
    nickname: true,
    username: true,
    password: true,
    phone: true,
  })
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    username: "",
    password: "",
    phone: "",
  })
  const [permission, setPermission] = useState<"member" | "admin">("member")

  const [isOpenDropdown, setIsOpenDropdown] = useState(false)

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

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const response = await AuthSending().post(
        `${API_ENDPOINT}${API_VERSION}users/create`,
        {
          name: formData.name.trim(),
          nickname: formData.nickname.trim(),
          username: formData.username.trim(),
          password: formData.password.trim(),
          permission: permission.trim(),
          phone: formData.phone.trim(),
        }
      )

      if (response.data.success) {
        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
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
      reFetching()
      onClose()
    }
  }

  return (
    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
      <div className="px-2 pr-14">
        <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          เพิ่มผู้ใช้งานใหม่
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
                  value={formData?.username}
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
                <div className="col-span-2">
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
                        {permission === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
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
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
          <Button
            disabled={error.name || error.nickname || error.phone}
            size="sm"
          >
            เพิ่มข้อมูล
          </Button>
          <Button isButton size="sm" variant="outline" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </div>
      </form>
    </div>
  )
}
export default CreateUserForm
