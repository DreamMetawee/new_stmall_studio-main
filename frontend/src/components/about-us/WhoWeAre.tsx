import { useRef, useEffect, useState } from "react"
import { AboutChildProps } from "../../pages/AboutPage/AboutPage"
import Input from "../form/input/InputField"
import Button from "../ui/button/Button"
import { PUBLIC_STATIC } from "../../utils/meta"
import { handleImageError } from "../../utils/image"
import QuillEditor from "../common/QuillEditor"

const WhoWeAre = ({ data, onChange }: AboutChildProps) => {
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  const [previewUrls, setPreviewUrls] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ])

  const getImagePreview = (img: File | string | null) => {
    if (!img) return null
    if (img instanceof File) return URL.createObjectURL(img)
    return `${PUBLIC_STATIC}about-us/${img}`
  }

  useEffect(() => {
    const urls = [
      getImagePreview(data.record_image_1st),
      getImagePreview(data.record_image_2nd),
      getImagePreview(data.record_image_3rd),
      getImagePreview(data.record_image_4th),
      getImagePreview(data.record_image_5th),
      getImagePreview(data.record_image_6th),
    ]
    setPreviewUrls(urls)

    return () => {
      urls.forEach(url => {
        if (url?.startsWith("blob:")) URL.revokeObjectURL(url)
      })
    }
  }, [
    data.record_image_1st,
    data.record_image_2nd,
    data.record_image_3rd,
    data.record_image_4th,
    data.record_image_5th,
    data.record_image_6th,
  ])

  const handleImageChange = (index: number, file: File | null) => {
    if (!file) return
    const key = [
      `record_image_1st`,
      `record_image_2nd`,
      `record_image_3rd`,
      `record_image_4th`,
      `record_image_5th`,
      `record_image_6th`,
    ][index]
    onChange(key, file)
  }

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
              เราเป็นใคร
            </h3>
            <div className="space-y-6">
              <Input
                placeholder="Title"
                value={data.record_title}
                onChange={e => onChange("record_title", e.target.value)}
              />
              <QuillEditor
                value={data.record_subtitle}
                onChange={value => onChange("record_subtitle", value)}
              />
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-2 gap-5 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex flex-col items-center gap-2">
                <img
                  src={previewUrls[i] || "/images/placeholder.png"}
                  alt={`grid-${i}`}
                  className="rounded-xl border border-gray-200 sm:max-w-1/2 dark:border-gray-800"
                  onError={e => handleImageError(e, "blank")}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRefs[i].current?.click()}
                >
                  เปลี่ยนรูปภาพ
                </Button>
                <input
                  ref={fileInputRefs[i]}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0] || null
                    handleImageChange(i, file)
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WhoWeAre
