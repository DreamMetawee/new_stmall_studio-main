import Button from "../ui/button/Button"
import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import { useState } from "react"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import { toast } from "react-toastify"
import { API_ENDPOINT, API_VERSION, IS_PEDDING_TEXT } from "../../utils/meta"
import { AuthSending } from "../../utils/api"
import { UserProfilePageProps } from "../../pages/UserProfiles"

export default function UserCredential({
  user,
  session,
  reFetching,
}: UserProfilePageProps) {
  const { isOpen, openModal, closeModal } = useModal()
  const [error, setError] = useState<{
    oldPassword: boolean
    newPassword: boolean
    cNewPassword: boolean
  }>({
    oldPassword: true,
    newPassword: true,
    cNewPassword: true,
  })
  const [matchError, setMatchError] = useState(false)
  const [credential, setCredential] = useState({
    oldPassword: "",
    newPassword: "",
    cNewPassword: "",
  })

  function validateField(name: any, value: string) {
    setError(prev => ({ ...prev, [name]: value.trim() === "" }))
  }

  function onChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setCredential(prev => ({ ...prev, [name]: value }))

    // validate real-time
    validateField(name, value)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (credential.newPassword !== credential.cNewPassword) {
      setMatchError(true)
      return
    }
    setMatchError(false)

    const toastId = toast.loading(IS_PEDDING_TEXT)

    try {
      const response = await AuthSending().post(
        `${API_ENDPOINT}${API_VERSION}users/change-password/${user?.id}`,
        {
          oldPassword: credential.oldPassword,
          newPassword: credential.newPassword,
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
            ความปลอดภัยและการเข้าสู่ระบบ
          </h4>
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
        <form onSubmit={handleSave} className="flex flex-col">
          <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              ความปลอดภัย
            </h4>

            <div className="mt-7">
              <h5 className="mb-5 text-lg font-medium text-gray-800 lg:mb-6 dark:text-white/90">
                การเข้าสู่ระบบ
              </h5>

              <div className="flex flex-col gap-x-6 gap-y-5">
                {session?.permission !== "admin" && (
                  <div className="col-span-2 lg:col-span-1">
                    <Label>รหัสผ่านปัจจุบัน</Label>
                    <Input
                      type="password"
                      value={credential.oldPassword}
                      name="oldPassword"
                      onChange={onChangeInput}
                      error={error.oldPassword}
                      hint={error.oldPassword ? "โปรดระบุรหัสผ่านปัจจุบัน" : ""}
                    />
                  </div>
                )}

                <div className="col-span-2 lg:col-span-1">
                  <Label>รหัสผ่าน</Label>
                  <Input
                    type="password"
                    value={credential.newPassword}
                    name="newPassword"
                    onChange={onChangeInput}
                    error={error.newPassword}
                    hint={error.newPassword ? "โปรดระบุรหัสผ่านใหม่" : ""}
                  />
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <Label>ยืนยันรหัสผ่าน</Label>
                  <Input
                    type="password"
                    value={credential.cNewPassword}
                    name="cNewPassword"
                    onChange={onChangeInput}
                    error={error.cNewPassword}
                    hint={error.cNewPassword ? "โปรดยืนยันรหัสผ่าน" : ""}
                  />
                  {matchError && (
                    <p className="mt-1 text-sm text-red-500">
                      รหัสผ่านใหม่ไม่ตรงกัน
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                disabled={
                  (session?.permission !== "admin" &&
                    !credential.oldPassword) ||
                  !credential.newPassword ||
                  !credential.cNewPassword
                }
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
              <Button isButton size="sm" variant="outline" onClick={closeModal}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
