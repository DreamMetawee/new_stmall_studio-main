import fs from "fs"
import prisma from "./libs/prisma"
import { backupAndRestoreTables } from "./libs/config"

async function backupData() {
  for (const table of backupAndRestoreTables) {
    const data = await (table.model as any).findMany()
    fs.writeFileSync(
      `./backup/backup_${table.name}.json`,
      JSON.stringify(data, null, 2)
    )
    console.log(`✅ ${table.name} backup completed!`)
  }
}

backupData()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
