import { useDropzone } from "react-dropzone"
import { useState } from "react"
import { UploadIcon } from "../../../icons"

interface ImageDropProps {
  onChange?: (file: File) => void
  multiFile?: boolean
  fileLimit?: number
}

const ImageDrop: React.FC<ImageDropProps> = ({
  onChange,
  multiFile = false,
  fileLimit = 1,
}) => {
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      onChange?.(file)
    }
  }

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
      } p-7 lg:p-10`}
    >
      <input {...getInputProps()} />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-5 flex justify-center">
          <div className="relative flex h-42 w-42 items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
            ) : (
              <UploadIcon />
            )}
          </div>
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
    </div>
  )
}

export default ImageDrop
