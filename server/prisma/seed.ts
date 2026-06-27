import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('cafelog2025', 10)

  const yeison = await prisma.usuario.upsert({
    where: { email: 'yeison@cafelog.app' },
    update: {},
    create: {
      email: 'yeison@cafelog.app',
      passwordHash,
      nombre: 'Yeison',
    },
  })

  const tiposBase = [
    { id: 'tipo-pergamino', nombre: 'Pergamino', color: '#b8833a' },
    { id: 'tipo-pasilla', nombre: 'Pasilla', color: '#7c5c2e' },
    { id: 'tipo-cereza', nombre: 'Cereza', color: '#c0392b' },
  ]

  for (const tipo of tiposBase) {
    await prisma.tipoCafe.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre, color: tipo.color },
      create: { ...tipo, usuarioId: yeison.id },
    })
  }

  await prisma.configuracion.upsert({
    where: { usuarioId: yeison.id },
    update: {},
    create: {
      id: `config-${yeison.id}`,
      porcentajePerdidaSecado: 50,
      costosFrecuentes: [
        { id: 'costo-transporte', descripcion: 'Transporte', monto: 15000 },
        { id: 'costo-sacos', descripcion: 'Sacos', monto: 3000 },
      ],
      usuarioId: yeison.id,
    },
  })

  console.log('✅ Seed completado.')
  console.log(`   Usuario: ${yeison.email}`)
  console.log(`   Contraseña: cafelog2025`)
  console.log(`   Cambia la contraseña después del primer login.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
