import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import Cookies from "js-cookie"
import { UserProps } from "../props/User"
import { AuthSending } from "../utils/api"
import { toast } from "react-toastify"
import { API_ENDPOINT, API_VERSION } from "../utils/meta"

interface UserContextProps {
  isLoggedIn: boolean
  session: UserProps | null
  loading: boolean
  initialSession: () => void
  login: (
    username: string,
    password: string
  ) => Promise<{
    success: boolean
    message: string
    token: string
    user: UserProps
  }>
  logout: () => void
}

const UserContext = createContext<UserContextProps>({
  isLoggedIn: false,
  session: null,
  loading: true,
  initialSession: () => {},
  login: async () => ({
    success: false,
    message: "",
    token: "",
    user: {
      id: "",
      name: "",
      nickname: "",
      permission: "member",
      username: "",
      phone: "",
      avatar: "",
      status: true,
    },
  }),
  logout: () => {},
})

interface UserProviderProps {
  children: React.ReactNode
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [session, setSession] = useState<UserProps | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleTokenRefresh = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
    }

    const refreshTime = 2 * 60 * 60 * 1000 // 1 ชม.
    refreshTimer.current = setTimeout(() => {
      refreshToken()
    }, refreshTime)
  }

  const refreshToken = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken")

      const response = await AuthSending().post(
        `${API_ENDPOINT}${API_VERSION}users/refresh-token`,
        { refreshToken }
      )

      const { data } = response

      if (data?.success) {
        Cookies.set("token", data.token)
        setSession(data.user)
        setIsLoggedIn(true)
        scheduleTokenRefresh() // ตั้งเวลา refresh ครั้งถัดไป
      } else {
        logout()
      }
    } catch (error) {
      toast.error("หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่")
      logout()
    }
  }

  const initialSession = async () => {
    const token = Cookies.get("token")
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await AuthSending().get(
        `${API_ENDPOINT}${API_VERSION}users/authen`
      )
      const { data } = response
      if (data?.success) {
        setIsLoggedIn(true)
        setSession(data.user)
        scheduleTokenRefresh() // ตั้ง refresh หลัง load session สำเร็จ
      } else {
        logout()
      }
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("หมดเวลาใช้งาน กรุณาเข้าสู่ระบบใหม่")
        logout()
      } else {
        toast.error("ยืนยันตัวตนล้มเหลว")
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (
    username: string,
    password: string
  ): Promise<{
    success: boolean
    message: string
    token: string
    user: UserProps
  }> => {
    const res = await AuthSending().post(
      `${API_ENDPOINT}${API_VERSION}users/login`,
      { username: username.trim(), password: password.trim() }
    )

    if (res.data.success) {
      Cookies.set("token", res.data.token)
      Cookies.set("refreshToken", res.data.refreshToken) // ⬅️ ต้องมี
      setIsLoggedIn(true)
      setSession(res.data.user)
      scheduleTokenRefresh()
    }

    return res.data
  }

  useEffect(() => {
    initialSession()
  }, [])

  const logout = () => {
    if (refreshTimer.current) {
      clearTimeout(refreshTimer.current)
    }
    setIsLoggedIn(false)
    setSession(null)
    Cookies.remove("token")
  }

  return (
    <UserContext.Provider
      value={{ isLoggedIn, session, loading, initialSession, login, logout }}
    >
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
