import { useRef, useEffect, useState } from "react"
import Button from "../ui/button/Button"
import TextArea from "../form/input/TextArea"
import { AboutChildProps } from "../../pages/AboutPage/AboutPage"
import { PUBLIC_STATIC } from "../../utils/meta"

const AboutUs = ({ data, onChange }: AboutChildProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (data.hero_image instanceof File) {
      const fileUrl = URL.createObjectURL(data.hero_image)
      setPreviewUrl(fileUrl)

      return () => URL.revokeObjectURL(fileUrl)
    } else if (typeof data.hero_image === "string" && data.hero_image !== "") {
      setPreviewUrl(`${PUBLIC_STATIC}about-us/${data.hero_image}`)
    } else {
      setPreviewUrl(null)
    }
  }, [data.hero_image])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange("hero_image", file)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="relative min-h-72 overflow-hidden rounded-xl border border-gray-300 dark:border-gray-800">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="About Us Hero"
            className="max-h-[500px] w-full object-cover"
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-white/[0.05]">
            No image selected
          </div>
        )}

        <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center bg-black/30">
          <h3 className="text-theme-xl mb-4 font-semibold text-white/90 sm:text-2xl">
            เกี่ยวกับเรา
          </h3>
          <Button
            size="sm"
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            เปลี่ยนรูปภาพ
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white px-5 py-7 lg:col-span-1 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            วิสัยทัศน์
          </h3>
          <TextArea
            value={data.our_vision}
            onChange={value => onChange("our_vision", value)}
          />
        </div>

        <div className="col-span-2 rounded-2xl border border-gray-200 bg-white px-5 py-7 lg:col-span-1 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
            พันธกิจ
          </h3>
          <TextArea
            value={data.our_mission}
            onChange={value => onChange("our_mission", value)}
          />
        </div>
      </div>
    </div>
  )
}

export default AboutUs
