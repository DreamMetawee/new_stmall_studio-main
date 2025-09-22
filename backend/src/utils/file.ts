import fs from "fs"
import path from "path"

export const deleteFile = (uploadDir: string, filename: string) => {
  if (!filename) return
  const filePath = path.join(uploadDir, filename)
  fs.unlink(filePath, err => {
    if (err) console.error("Failed to delete image:", err)
  })
}
