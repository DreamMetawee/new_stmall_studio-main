import { useDropzone } from "react-dropzone"
import { useState, useEffect } from "react"
import { UploadIcon } from "../../../icons"

interface ImageDropProps {
  onChange?: (files: File[]) => void
  multiFile?: boolean
  fileLimit?: number
}

const MultiImageDrop: React.FC<ImageDropProps> = ({
  onChange,
  multiFile = false,
  fileLimit = 1,
}) => {
  const [previews, setPreviews] = useState<string[]>([])
  const [, setFiles] = useState<File[]>([])

  const onDrop = (acceptedFiles: File[]) => {
    const limitedFiles = acceptedFiles.slice(0, fileLimit)

    const newPreviews = limitedFiles.map(file => URL.createObjectURL(file))
    setFiles(limitedFiles)
    setPreviews(newPreviews)
    onChange?.(limitedFiles)
  }

  useEffect(() => {
    return () => {
      // Clean up previews when component unmounts
      previews.forEach(url => URL.revokeObjectURL(url))
    }
  }, [previews])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "image/gif": [],
      "image/webp": [],
    },
    maxFiles: fileLimit,
    multiple: multiFile,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer overflow-hidden rounded-xl border border-dashed transition ${
        isDragActive
          ? "border-brand-500 bg-gray-100 dark:bg-gray-800"
          : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
      } p-7 lg:p-10 flex items-center justify-center`}
    >
      <input {...getInputProps()} />

      {previews.length > 0 ? (
        <div className="relative z-10 grid grid-cols-2 gap-4 md:grid-cols-3"> {/* ย้าย grid นี้เข้ามาในเงื่อนไข */}
          {previews.map((url, idx) => (
            <div
              key={idx}
              className="relative h-32 w-32 overflow-hidden rounded-md border border-gray-300"
            >
              <img
                src={url}
                alt={`preview-${idx}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center text-center"> {/* ปรับเป็น flex-col และ items-center */}
          <div className="mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400"> {/* เอา grid ออก, ใช้ flex เพื่อจัดกึ่งกลางไอคอน */}
            <UploadIcon className="h-10 w-10" /> {/* ลบคลาส justify-center และ items-center ออกจาก icon เนื่องจาก div แม่จัดการแล้ว */}
          </div>
          <h4 className="text-theme-xl mb-3 font-semibold text-gray-800 dark:text-white/90">
            {isDragActive ? "วางไฟล์ที่นี่" : "ลากและวางไฟล์ที่นี่"}
          </h4>
          <span className="mb-5 block w-full max-w-[290px] text-center text-sm text-gray-700 dark:text-gray-400">
            รองรับรูปภาพ PNG, JPG, GIF, WEBP
          </span>
          <span className="text-theme-sm text-brand-500 font-medium underline">
            เลือกไฟล์
          </span>
        </div>
      )}
    </div>
  )
}

export default MultiImageDrop;