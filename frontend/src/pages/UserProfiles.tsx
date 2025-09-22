import PageBreadcrumb from "../components/common/PageBreadCrumb"
import UserMetaCard from "../components/user-profile/UserMetaCard"
import UserInfoCard from "../components/user-profile/UserInfoCard"
import PageMeta from "../components/common/PageMeta"
import {
  API_ENDPOINT,
  API_VERSION,
  WEBSITE_DESCRIPTION,
  WEBSITE_TITLE,
} from "../utils/meta"
import { useUser } from "../context/UserContext"
import { useNavigate, useParams } from "react-router"
import { useEffect, useState } from "react"
import { UserProps } from "../props/User"
import { AuthSending } from "../utils/api"
import UserCredential from "../components/user-profile/UserCredential"

export interface UserProfilePageProps {
  user: UserProps | null
  session?: UserProps | null
  reFetching: () => void
}

export default function UserProfiles() {
  const { session } = useUser()
  const { userId } = useParams()
  const navigate = useNavigate()

  const [userData, setUserData] = useState<UserProps | null>(null)

  const fetchUserById = async () => {
    try {
      const API =
        userId && session?.permission === "admin"
          ? `${API_ENDPOINT}${API_VERSION}users/v/${userId}`
          : `${API_ENDPOINT}${API_VERSION}users/v/${session?.id}`
      const response = await AuthSending().get(API)

      const { data } = response
      if (data) {
        setUserData(data.user)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchUserById()
  }, [])

  if (session?.permission === "member" && userId) navigate("/profile")

  return (
    <>
      <PageMeta
        title={`${WEBSITE_TITLE} | จัดการบัญชี`}
        description={WEBSITE_DESCRIPTION}
      />
      <PageBreadcrumb pageTitle="จัดการบัญชี" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 lg:mb-7 dark:text-white/90">
          ข้อมูลผู้ใช้งาน
        </h3>
        <div className="space-y-6">
          <UserMetaCard
            reFetching={fetchUserById}
            user={userData}
            isEdit={userId}
          />
          <UserInfoCard
            reFetching={fetchUserById}
            user={userData}
            session={session}
          />
          <UserCredential
            reFetching={fetchUserById}
            user={userData}
            session={session}
          />
        </div>
      </div>
    </>
  )
}
