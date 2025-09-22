import { useEffect, useRef, useState } from "react"
import { EnvelopeIcon, MapPinIcon, PhoneIcon, TimeIcon } from "../../icons"
import { ContactChildProps } from "../../pages/Contacts/Contacts"
import Input from "../form/input/InputField"
import TextArea from "../form/input/TextArea"
import Label from "../form/Label"
import Button from "../ui/button/Button"
import { PUBLIC_STATIC } from "../../utils/meta"
import { handleImageError } from "../../utils/image"
import QuillEditor from "../common/QuillEditor"

const ContactInfo = ({ data, onChange }: ContactChildProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (data.contact_image instanceof File) {
      const fileUrl = URL.createObjectURL(data.contact_image)
      setPreviewUrl(fileUrl)

      return () => URL.revokeObjectURL(fileUrl)
    } else if (
      typeof data.contact_image === "string" &&
      data.contact_image !== ""
    ) {
      setPreviewUrl(`${PUBLIC_STATIC}contact/${data.contact_image}`)
    } else {
      setPreviewUrl(null)
    }
  }, [data.contact_image])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange("contact_image", file)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1140px] space-y-6">
      <div className="relative max-h-[500px] overflow-hidden rounded-xl border border-gray-300 dark:border-gray-800">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="About Us Hero"
            className="block object-cover object-center"
            onError={e => handleImageError(e, "blank")}
          />
        ) : (
          <div className="flex h-64 w-full items-center justify-center bg-gray-100 text-gray-400 dark:bg-white/[0.05]">
            No image selected
          </div>
        )}

        <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center bg-black/30">
          <h3 className="text-theme-xl mb-4 font-semibold text-white/90 sm:text-2xl">
            ติดต่อเรา
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
        <div className="col-span-2 grid grid-cols-3 gap-x-6 gap-y-5 rounded-2xl border border-gray-200 bg-white px-5 py-7 xl:px-10 xl:py-12 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="col-span-3">
            <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
              รายละเอียด
            </h3>
            <Label>รายละเอียด</Label>
            <QuillEditor
              value={data.contact_description}
              onChange={value => onChange("contact_description", value)}
            />
          </div>

          <div className="col-span-3">
            <h3 className="text-theme-xl mb-4 font-semibold text-gray-800 sm:text-2xl dark:text-white/90">
              ข้อมูลติดต่อ
            </h3>
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              {/* ชื่อติดต่อ */}
              <div className="col-span-2 lg:col-span-1">
                <Label>ชื่อติดต่อ</Label>
                <Input
                  value={data.contact_name}
                  onChange={value =>
                    onChange("contact_name", value.target.value)
                  }
                />
              </div>

              {/* ชื่อติดต่อรอง */}
              <div className="col-span-2 lg:col-span-1">
                <Label>ชื่อติดต่อรอง</Label>
                <Input
                  value={data.sub_contact_name}
                  onChange={value =>
                    onChange("sub_contact_name", value.target.value)
                  }
                />
              </div>

              {/* ที่อยู่ */}
              <div className="col-span-2 lg:col-span-1">
                <Label>ที่อยู่</Label>
                <div className="relative">
                  <TextArea
                    className="custom-scrollbar resize-none pr-10"
                    value={data.contact_position}
                    onChange={value => onChange("contact_position", value)}
                  />
                  <span className="pointer-events-none absolute top-3 right-3 text-gray-500 dark:text-gray-400">
                    <MapPinIcon className="size-5" />
                  </span>
                </div>
              </div>

              {/* เวลาทำการ */}
              <div className="col-span-2 lg:col-span-1">
                <Label>เวลาทำการ</Label>
                <div className="relative">
                  <TextArea
                    className="custom-scrollbar resize-none pr-10"
                    value={data.contact_hour}
                    onChange={value => onChange("contact_hour", value)}
                  />
                  <span className="pointer-events-none absolute top-3 right-3 text-gray-500 dark:text-gray-400">
                    <TimeIcon className="size-5" />
                  </span>
                </div>
              </div>

              {/* เบอร์โทรศัพท์ */}
              <div className="col-span-2 lg:col-span-1">
                <Label>เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <Input
                    className="pr-10"
                    value={data.contact_phone}
                    onChange={value =>
                      onChange("contact_phone", value.target.value)
                    }
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <PhoneIcon className="size-4" />
                  </span>
                </div>
              </div>

              {/* โทรศัพท์มือถือ */}
              <div className="col-span-2 lg:col-span-1">
                <Label>โทรศัพท์มือถือ</Label>
                <div className="relative">
                  <Input
                    className="pr-10"
                    value={data.contact_mobile}
                    onChange={value =>
                      onChange("contact_mobile", value.target.value)
                    }
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <PhoneIcon className="size-4" />
                  </span>
                </div>
              </div>

              {/* อีเมล */}
              <div className="col-span-2 lg:col-span-1">
                <Label>อีเมล</Label>
                <div className="relative">
                  <Input
                    className="pr-10"
                    value={data.contact_email}
                    onChange={value =>
                      onChange("contact_email", value.target.value)
                    }
                  />
                  <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                    <EnvelopeIcon className="size-5" />
                  </span>
                </div>
              </div>

              {/* Line ID */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Line ID</Label>
                <Input
                  value={data.contact_line}
                  onChange={value =>
                    onChange("contact_line", value.target.value)
                  }
                />
              </div>

              {/* Facebook */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Facebook</Label>
                <Input
                  value={data.contact_facebook}
                  onChange={value =>
                    onChange("contact_facebook", value.target.value)
                  }
                />
              </div>

              {/* Website */}
              <div className="col-span-2 lg:col-span-1">
                <Label>Website</Label>
                <Input
                  value={data.contact_website}
                  onChange={value =>
                    onChange("contact_website", value.target.value)
                  }
                />
              </div>

              {/* Google Map */}
              <div className="col-span-2">
                <Label>Google Map URL</Label>
                <Input
                  value={data.contact_google_map}
                  onChange={value =>
                    onChange("contact_google_map", value.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ContactInfo
