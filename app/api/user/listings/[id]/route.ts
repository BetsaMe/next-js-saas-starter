// app/api/user/listings/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession }               from '@/lib/auth/session'
import { db }                       from '@/lib/db/drizzle'
import { listings }                 from '@/lib/db/schema'
import { eq }                       from 'drizzle-orm'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // 1) Verificar sesión
  const session = await getSession()
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    )
  }

  // 2) Obtener y validar el ID
  const { id } = await params
  const listingId = Number(id)
  if (isNaN(listingId)) {
    return NextResponse.json(
      { error: 'Invalid ID' },
      { status: 400 }
    )
  }

  // 3) Comprobar que el listing existe y es del usuario
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1)

  if (!listing) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }
  if (listing.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  // 4) Borrar el listing
  await db
    .delete(listings)
    .where(eq(listings.id, listingId))

  return NextResponse.json({ success: true })
}
