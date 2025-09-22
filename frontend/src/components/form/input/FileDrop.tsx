import { useDropzone } from "react-dropzone"
import { useState } from "react"
import { UploadIcon } from "../../../icons"

interface FileDropProps {
  onChange?: (file: File) => void
  multiFile?: boolean
  fileLimit?: number
}

const FileDrop: React.FC<FileDropProps> = ({
  onChange,
  multiFile = false,
  fileLimit = 1,
}) => {
    const [fileName, setFileName] = useState<string | null>(null)

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFileName(file.name)
      onChange?.(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [],

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
          <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
            <UploadIcon />
          </div>
        </div>
        <h4 className="text-theme-xl mb-3 font-semibold text-gray-800 dark:text-white/90">
          {isDragActive ? "วางไฟล์ที่นี่" : "ลากและวางไฟล์ที่นี่"}
        </h4>
        <span className="mb-5 block w-full max-w-[290px] text-center text-sm text-gray-700 dark:text-gray-400">
          รองรับไฟล์ PDF เท่านั้น
        </span>
        {fileName && (
          <span className="mb-2 block w-full max-w-[290px] truncate text-center text-sm font-medium text-green-600 dark:text-green-400">
            {fileName}
          </span>
        )}
        <span className="text-theme-sm text-brand-500 font-medium underline">
          เลือกไฟล์
        </span>
      </div>
    </div>
  )
}

export default FileDrop
