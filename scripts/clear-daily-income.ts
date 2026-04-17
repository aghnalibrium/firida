import { PrismaClient } from '@/generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Menghapus semua data Daily Income...')

  const result = await prisma.dailyIncome.deleteMany({})

  console.log(`✅ Berhasil menghapus ${result.count} data`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
