import { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { EyeCloseIcon, EyeIcon } from "../../icons"
import Label from "../form/Label"
import Input from "../form/input/InputField"
import Checkbox from "../form/input/Checkbox"
import Button from "../ui/button/Button"
import { toast } from "react-toastify"
import { useUser } from "../../context/UserContext"
import { useNavigate } from "react-router"

export default function SignInForm() {
  const navigate = useNavigate()
  const { login } = useUser()

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isPedding, setIsPedding] = useState(false)
  const [formData, setFormData] = useState<{
    username: string
    password: string
  }>({
    username: "",
    password: "",
  })

  useEffect(() => {
    const savedUsername = localStorage.getItem("remember")

    if (savedUsername) {
      setFormData({
        username: savedUsername,
        password: "",
      })
      setRememberMe(true)
    }
  }, [])

  const handlerSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPedding(true)
    const toastId = toast.loading("ตรวจสอบข้อมูล")

    try {
      const { username, password } = formData

      if (!username || !password) {
        toast.update(toastId, {
          render: "ชื่อผู้ใช้ หรือ รหัสผ่านให้ถูกต้อง",
          type: "warning",
          isLoading: false,
          autoClose: 2000,
        })
        setIsPedding(false)
        return
      }

      const response = await login(username, password)

      if (response.success) {
        if (rememberMe) {
          localStorage.setItem("remember", username)
        } else {
          localStorage.removeItem("remember")
        }

        toast.update(toastId, {
          render: response.message,
          type: "success",
          isLoading: false,
          autoClose: 2000,
        })
      } else {
        toast.update(toastId, {
          render: response.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error(error)
      toast.update(toastId, {
        render: "เกิดข้อผิดพลาด",
        type: "error",
        isLoading: false,
        autoClose: 2000,
      })
    } finally {
      setIsPedding(false)
      navigate("/")
    }
  }

  const handlerChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    if (type === "checkbox") {
      setRememberMe(checked)
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="text-title-sm sm:text-title-md mb-2 font-semibold text-gray-800 dark:text-white/90">
              เข้าสู่ระบบ
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              กรอกชื่อผู้ใช้งานและรหัสผ่านของคุณเพื่อเข้าสู่ระบบ!
            </p>
          </div>
          <div>
            <form onSubmit={handlerSubmit}>
              <div className="space-y-6">
                <div>
                  <Label>
                    ชื่อผู้ใช้งาน <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    value={formData.username}
                    name="username"
                    onChange={handlerChange}
                  />
                </div>
                <div>
                  <Label>
                    รหัสผ่าน <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      value={formData.password}
                      type={showPassword ? "text" : "password"}
                      name="password"
                      onChange={handlerChange}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 z-30 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="size-5 fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox checked={rememberMe} onChange={setRememberMe} />
                    <span className="text-theme-sm block font-normal text-gray-700 dark:text-gray-400">
                      จำฉันไว้
                    </span>
                  </div>
                </div>
                <div>
                  <Button disabled={isPedding} className="w-full" size="sm">
                    ลงชื่อเข้าใช้
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
