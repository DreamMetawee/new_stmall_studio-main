import { Link } from "react-router"
import { ArrowLeftIcon, ImageIcon } from "../../icons"
import { UserProfilePageProps } from "../../pages/UserProfiles"
import { API_ENDPOINT, API_VERSION, PUBLIC_STATIC } from "../../utils/meta"
import Button from "../ui/button/Button"
import { useModal } from "../../hooks/useModal"
import { Modal } from "../ui/modal"
import ImageDrop from "../../components/form/input/ImageDrop"
import { useState } from "react"
import { AuthSending } from "../../utils/api"
import Badge from "../ui/badge/Badge"
import { handleImageError } from "../../utils/image"

interface UserMetaCardProps extends UserProfilePageProps {
  isEdit: string | undefined
}

export default function UserMetaCard({
  user,
  isEdit,
  reFetching,
}: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async () => {
    if (!selectedFile || !user) return

    const formData = new FormData()
    formData.append("avatar", selectedFile)

    try {
      setIsUploading(true)
      const res = await AuthSending().post(
        `${API_ENDPOINT}${API_VERSION}users/${user.id}/upload-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      if (res.status === 200) {
        reFetching()
        closeModal()
      }
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 p-5 lg:p-6 dark:border-gray-800">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full flex-col items-center gap-6 xl:flex-row">
          <div className="h-20 w-20 overflow-hidden rounded-full border border-gray-200 dark:border-gray-800">
            <img
              src={
                user?.avatar
                  ? `${PUBLIC_STATIC}users/${user.avatar}`
                  : "/blank-profile.png"
              }
              alt="user"
              onError={e => handleImageError(e, "profile")}
            />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-center text-lg font-semibold text-gray-800 xl:text-left dark:text-white/90">
              {user?.name} ({user?.nickname})
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user?.username}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 xl:block dark:bg-gray-700"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <Badge
                  size="sm"
                  color={user?.permission === "admin" ? "success" : "error"}
                >
                  {user?.permission === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้งาน"}
                </Badge>
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-nowrap text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          <ImageIcon />
          เปลี่ยนโปรไฟล์
        </button>
        {isEdit && (
          <Link
            to="/users"
            className="shadow-theme-xs flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-nowrap text-gray-700 hover:bg-gray-50 hover:text-gray-800 lg:inline-flex lg:w-auto dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <ArrowLeftIcon />
            ย้อนกลับ
          </Link>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="m-4 max-w-[700px]">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 lg:p-11 dark:bg-gray-900">
          <div className="px-2 pr-14">
            <h4 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
              เปลี่ยนรูปโปรไฟล์
            </h4>
          </div>
          <form className="flex flex-col">
            <ImageDrop
              onChange={file => {
                setSelectedFile(file)
              }}
            />
            <div className="mt-6 flex items-center gap-3 px-2 lg:justify-end">
              <Button
                size="sm"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
              >
                {isUploading ? "กำลังอัปโหลด..." : "เปลี่ยนโปรไฟล์"}
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
