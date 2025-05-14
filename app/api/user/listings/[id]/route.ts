// app/api/user/listings/[id]/route.ts
import { NextResponse } from 'next/server';
import { getSession }   from '@/lib/auth/session';
import { db }           from '@/lib/db/drizzle';
import { listings }     from '@/lib/db/schema';
import { eq }           from 'drizzle-orm';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const listingId = Number(params.id);
  if (isNaN(listingId)) {
    return NextResponse.json(
      { error: 'Invalid ID' },
      { status: 400 }
    );
  }

  // 1) Recupera el listing para verificar propiedad
  const [listing] = await db
    .select()
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);

  if (!listing) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  if (listing.userId !== session.user.id) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // 2) Ahora sí podemos borrarlo con total seguridad
  await db
    .delete(listings)
    .where(eq(listings.id, listingId));

  return NextResponse.json({ success: true });
}
