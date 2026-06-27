import { prisma } from '../db/client'
import { TipoCafeInput } from '../schemas/tipoCafe.schema'

function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export async function listar(usuarioId: string) {
  return prisma.tipoCafe.findMany({
    where: { usuarioId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function crear(data: TipoCafeInput, usuarioId: string) {
  return prisma.tipoCafe.create({
    data: {
      id: data.id ?? generarId(),
      nombre: data.nombre,
      color: data.color,
      usuarioId,
    },
  })
}

export async function actualizar(id: string, data: TipoCafeInput, usuarioId: string) {
  const existente = await prisma.tipoCafe.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  return prisma.tipoCafe.update({
    where: { id },
    data: { nombre: data.nombre, color: data.color },
  })
}

export async function eliminar(id: string, usuarioId: string) {
  const existente = await prisma.tipoCafe.findFirst({ where: { id, usuarioId } })
  if (!existente) return null

  const enUso = await prisma.compra.count({ where: { tipoCafeId: id } })
  if (enUso > 0) throw new Error(`No se puede eliminar: hay ${enUso} compras con este tipo de café`)

  return prisma.tipoCafe.delete({ where: { id } })
}
