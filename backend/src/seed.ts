import fs from "fs"
import { PrismaClient } from "@prisma/client"
import { backupAndRestoreTables } from "./libs/config"

const prisma = new PrismaClient()

async function restoreData() {
  for (const table of backupAndRestoreTables) {
    console.log("Seeding:", table.name)

    const filePath = `./backup/backup_${table.name}.json`
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`)
      continue
    }

    const rawData = fs.readFileSync(filePath, "utf8")
    const data = JSON.parse(rawData)

    if (data.length === 0) {
      console.log(`⚠️  No data to restore for: ${table.name}`)
      continue
    }

    try {
      await (table.model as any).createMany({
        data,
        skipDuplicates: true, // 👈 ป้องกัน duplicate key error
      })
      console.log(`✅ ${table.name} restored!`)
    } catch (error) {
      console.error(`❌ Failed restoring ${table.name}:`, error)
    }
  }

  console.log("🎉 All data successfully restored (skipping duplicates)!")
}

restoreData()
  .catch(e => console.error("❌ Error restoring data:", e))
  .finally(() => prisma.$disconnect())
