import { PrismaClient } from '@prisma/client'
import { BD_LOCATIONS } from '../src/lib/locations'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Seed divisions and districts
  for (const division of BD_LOCATIONS) {
    const div = await prisma.division.upsert({
      where: { name: division.name },
      update: {},
      create: { name: division.name, nameBn: division.nameBn },
    })

    for (const district of division.districts) {
      await prisma.district.upsert({
        where: { id: (await prisma.district.findFirst({
          where: { name: district.name, divisionId: div.id }
        }))?.id || 0 },
        update: {},
        create: {
          name: district.name,
          nameBn: district.nameBn,
          divisionId: div.id,
        },
      })
    }
    console.log(`✅ ${division.name} division seeded`)
  }

  // Create default admin
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (!adminExists) {
    await prisma.user.create({
      data: {
        phone: '01700000000',
        name: 'PropertyBD Admin',
        role: 'ADMIN',
        isVerified: true,
      },
    })
    console.log('✅ Admin user created (phone: 01700000000)')
  }

  console.log('🎉 Seed complete!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
