import multer from "multer"
import path from "path"
import fs from "fs"

export function createUploader(folderName: string) {
  const uploadDir = path.join(__dirname, "..", "public", folderName)

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, uploadDir)
    },
    filename: function (_req, file, cb) {
      const ext = path.extname(file.originalname)
      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext}`
      cb(null, uniqueName)
    },
  })

  const uploader = multer({ storage })

  return { uploader, uploadDir }
}
