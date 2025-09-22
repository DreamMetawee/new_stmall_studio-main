import { FC } from "react"
import { useUser } from "../../context/UserContext"
import { Navigate } from "react-router"
import Loading from "../common/Loading"

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, loading } = useUser()

  if (loading)
    return (
      <div className="relative min-h-screen overflow-hidden">
        <div className="bg-opacity-60 absolute right-8 bottom-8 z-10 flex h-full w-full items-end justify-end bg-white">
          <Loading />
        </div>
      </div>
    )

  if (!isLoggedIn) return <Navigate to="/signin" />

  return children
}
export default ProtectedRoute
