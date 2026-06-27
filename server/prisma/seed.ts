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

  const pedro = await prisma.usuario.upsert({
    where: { email: 'pedro@cafelog.app' },
    update: {},
    create: {
      email: 'pedro@cafelog.app',
      passwordHash,
      nombre: 'Pedro',
    },
  })

  const tiposBasePedro = [
    { id: `tipo-pergamino-${pedro.id}`, nombre: 'Pergamino', color: '#b8833a' },
    { id: `tipo-pasilla-${pedro.id}`, nombre: 'Pasilla', color: '#7c5c2e' },
    { id: `tipo-cereza-${pedro.id}`, nombre: 'Cereza', color: '#c0392b' },
  ]

  for (const tipo of tiposBasePedro) {
    await prisma.tipoCafe.upsert({
      where: { id: tipo.id },
      update: { nombre: tipo.nombre, color: tipo.color },
      create: { ...tipo, usuarioId: pedro.id },
    })
  }

  await prisma.configuracion.upsert({
    where: { usuarioId: pedro.id },
    update: {},
    create: {
      id: `config-${pedro.id}`,
      porcentajePerdidaSecado: 50,
      costosFrecuentes: [
        { id: `costo-transporte-${pedro.id}`, descripcion: 'Transporte', monto: 15000 },
        { id: `costo-sacos-${pedro.id}`, descripcion: 'Sacos', monto: 3000 },
      ],
      usuarioId: pedro.id,
    },
  })

  console.log('✅ Seed completado.')
  console.log(`   yeison@cafelog.app / cafelog2025`)
  console.log(`   pedro@cafelog.app  / cafelog2025`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
